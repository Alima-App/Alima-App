import { supabase } from '../supabase.js';
import { getProfile } from '../auth.js';

// Ambil kelas_id dari URL hash: #/materi?kelas=xxx
function getKelasId() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  return params.get('kelas');
}

export async function renderMateri(container) {
  const profile = await getProfile();
  const kelasId = getKelasId();

  if (!kelasId) {
    // Tampilkan pilihan kelas dulu
    await renderPilihKelas(container, profile);
    return;
  }

  // Ambil info kelas
  const { data: kelas, error: errKelas } = await supabase
    .from('kelas')
    .select('id, nama')
    .eq('id', kelasId)
    .single();

  if (errKelas || !kelas) {
    container.innerHTML = `<div class="page-wrap"><p class="error-msg">Kelas tidak ditemukan atau kamu tidak memiliki akses.</p></div>`;
    return;
  }

  if (profile.peran === 'dosen') {
    await renderMateriDosen(container, profile, kelas);
  } else {
    await renderMateriMahasiswa(container, profile, kelas);
  }
}

// ─────────────────────────────────────────
// PILIH KELAS (jika akses /materi tanpa ?kelas=)
// ─────────────────────────────────────────
async function renderPilihKelas(container, profile) {
  let query = supabase.from('kelas').select('id, nama').order('created_at', { ascending: false });
  if (profile.peran === 'dosen') {
    query = query.eq('pengajar_id', profile.id);
  }

  const { data: kelasList } = await query;
  const backUrl = profile.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa';

  container.innerHTML = `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <a href="${backUrl}" class="back-link">← Dashboard</a>
          <h2>Pilih Kelas</h2>
        </div>
      </div>
      <div>
        ${!kelasList || kelasList.length === 0
          ? `<div class="empty-state">Belum ada kelas tersedia.</div>`
          : kelasList.map(k => `
            <a href="#/materi?kelas=${k.id}" class="card kelas-card" style="text-decoration:none;display:flex;align-items:center;justify-content:space-between">
              <h3 style="font-size:1rem">${k.nama}</h3>
              <span style="color:var(--green);font-size:.85rem">Lihat Materi →</span>
            </a>
          `).join('')
        }
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// DOSEN
// ─────────────────────────────────────────
async function renderMateriDosen(container, profile, kelas) {
  const { data: materiList, error } = await supabase
    .from('materi')
    .select('*')
    .eq('kelas_id', kelas.id)
    .order('urutan', { ascending: true });

  if (error) { showError(container, error.message); return; }

  container.innerHTML = `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <a href="#/kelas" class="back-link">← Kelas</a>
          <h2>Materi — ${kelas.nama}</h2>
        </div>
        <button class="btn-primary" id="btn-tambah-materi">+ Tambah Materi</button>
      </div>

      <div id="form-materi" class="card form-card" style="display:none">
        <h3 id="form-materi-title">Tambah Materi</h3>
        <div class="input-group">
          <label>Judul</label>
          <input type="text" id="input-judul" placeholder="cth: Pertemuan 1 — Huruf Hijaiyah" />
        </div>
        <div class="input-group">
          <label>Tipe Materi</label>
          <select id="input-tipe">
            <option value="teks">Teks</option>
            <option value="pdf">PDF</option>
            <option value="mp3">Audio MP3</option>
            <option value="link">Tautan Eksternal</option>
          </select>
        </div>
        <div id="field-teks" class="input-group">
          <label>Isi Teks</label>
          <textarea id="input-teks" rows="6" placeholder="Tulis materi di sini..."
            style="width:100%;padding:.6rem .8rem;border:1px solid var(--border);border-radius:var(--radius);font-size:.9rem;resize:vertical;outline:none"></textarea>
        </div>
        <div id="field-file" class="input-group" style="display:none">
          <label id="label-file">File</label>
          <input type="file" id="input-file" accept=".pdf,.mp3" />
          <p class="hint" id="hint-file">Maks 50 MB. File disimpan di Supabase Storage.</p>
        </div>
        <div id="field-link" class="input-group" style="display:none">
          <label>URL Tautan</label>
          <input type="url" id="input-link" placeholder="https://youtube.com/..." />
        </div>
        <div class="input-group">
          <label>Urutan (angka)</label>
          <input type="number" id="input-urutan" value="0" min="0" style="width:100px" />
        </div>
        <div class="form-actions">
          <button class="btn-primary" id="btn-simpan-materi">Simpan</button>
          <button class="btn-ghost" id="btn-batal-materi">Batal</button>
        </div>
        <p class="error-msg" id="err-materi"></p>
        <div id="progress-upload" style="display:none">
          <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
          <p class="hint" id="progress-text">Mengupload...</p>
        </div>
      </div>

      <div id="daftar-materi">
        ${materiList.length === 0
          ? `<div class="empty-state">Belum ada materi. Klik "Tambah Materi" untuk mulai.</div>`
          : materiList.map(m => kartuMateriDosen(m)).join('')
        }
      </div>
    </div>
  `;

  setupFormMateri(kelas, profile, null);

  // Event delegasi
  document.getElementById('daftar-materi').addEventListener('click', async (e) => {
    const materiId = e.target.closest('[data-materi-id]')?.dataset.materiId;
    if (!materiId) return;

    if (e.target.classList.contains('btn-hapus-materi')) {
      if (!confirm('Hapus materi ini?')) return;
      const { data: m } = await supabase.from('materi').select('tipe, file_key').eq('id', materiId).single();
      if (m?.file_key) {
        await supabase.storage.from('materi-files').remove([m.file_key]);
      }
      await supabase.from('materi').delete().eq('id', materiId);
      window.location.hash = window.location.hash; // refresh
      await renderMateri(container);
    }
  });
}

function setupFormMateri(kelas, profile, editData) {
  const form = document.getElementById('form-materi');
  const tipeSelect = document.getElementById('input-tipe');

  // Toggle field sesuai tipe
  tipeSelect.addEventListener('change', () => toggleFieldTipe(tipeSelect.value));
  if (editData) toggleFieldTipe(editData.tipe);

  document.getElementById('btn-tambah-materi')?.addEventListener('click', () => {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('btn-batal-materi').addEventListener('click', () => {
    form.style.display = 'none';
    resetForm();
  });

  document.getElementById('btn-simpan-materi').addEventListener('click', async () => {
    await simpanMateri(kelas, profile, editData);
  });
}

function toggleFieldTipe(tipe) {
  document.getElementById('field-teks').style.display = tipe === 'teks' ? 'block' : 'none';
  document.getElementById('field-file').style.display = (tipe === 'pdf' || tipe === 'mp3') ? 'block' : 'none';
  document.getElementById('field-link').style.display = tipe === 'link' ? 'block' : 'none';

  if (tipe === 'pdf') {
    document.getElementById('input-file').accept = '.pdf';
    document.getElementById('label-file').textContent = 'File PDF';
    document.getElementById('hint-file').textContent = 'Maks 50 MB. Format: PDF.';
  } else if (tipe === 'mp3') {
    document.getElementById('input-file').accept = '.mp3,audio/*';
    document.getElementById('label-file').textContent = 'File Audio';
    document.getElementById('hint-file').textContent = 'Maks 50 MB. Format: MP3.';
  }
}

async function simpanMateri(kelas, profile, editData) {
  const judul = document.getElementById('input-judul').value.trim();
  const tipe = document.getElementById('input-tipe').value;
  const urutan = parseInt(document.getElementById('input-urutan').value) || 0;
  const errEl = document.getElementById('err-materi');
  const btn = document.getElementById('btn-simpan-materi');

  errEl.textContent = '';
  if (!judul) { errEl.textContent = 'Judul tidak boleh kosong.'; return; }

  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  let payload = { judul, tipe, urutan, kelas_id: kelas.id };

  if (tipe === 'teks') {
    const isi = document.getElementById('input-teks').value.trim();
    if (!isi) { errEl.textContent = 'Isi teks tidak boleh kosong.'; btn.disabled = false; btn.textContent = 'Simpan'; return; }
    payload.isi_teks = isi;

  } else if (tipe === 'link') {
    const url = document.getElementById('input-link').value.trim();
    if (!url) { errEl.textContent = 'URL tidak boleh kosong.'; btn.disabled = false; btn.textContent = 'Simpan'; return; }
    payload.url_eksternal = url;

  } else {
    // PDF atau MP3 — upload ke Supabase Storage
    const file = document.getElementById('input-file').files[0];
    if (!file) { errEl.textContent = 'Pilih file terlebih dahulu.'; btn.disabled = false; btn.textContent = 'Simpan'; return; }
    if (file.size > 50 * 1024 * 1024) { errEl.textContent = 'File terlalu besar. Maks 50 MB.'; btn.disabled = false; btn.textContent = 'Simpan'; return; }

    // Tampilkan progress
    document.getElementById('progress-upload').style.display = 'block';
    setProgress(30);

    const ext = file.name.split('.').pop();
    const fileKey = `${kelas.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    setProgress(50);
    const { error: errUpload } = await supabase.storage
      .from('materi-files')
      .upload(fileKey, file, { cacheControl: '3600', upsert: false });

    if (errUpload) {
      errEl.textContent = 'Gagal upload file: ' + errUpload.message;
      document.getElementById('progress-upload').style.display = 'none';
      btn.disabled = false; btn.textContent = 'Simpan';
      return;
    }
    setProgress(90);
    payload.file_key = fileKey;
  }

  const { error } = editData
    ? await supabase.from('materi').update(payload).eq('id', editData.id)
    : await supabase.from('materi').insert(payload);

  setProgress(100);

  if (error) {
    errEl.textContent = error.message;
    btn.disabled = false; btn.textContent = 'Simpan';
    document.getElementById('progress-upload').style.display = 'none';
    return;
  }

  window.location.reload();
}

function setProgress(pct) {
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = pct < 100 ? `Mengupload... ${pct}%` : 'Selesai!';
}

function resetForm() {
  document.getElementById('input-judul').value = '';
  document.getElementById('input-teks').value = '';
  document.getElementById('input-link').value = '';
  document.getElementById('input-urutan').value = '0';
  document.getElementById('err-materi').textContent = '';
  document.getElementById('input-tipe').value = 'teks';
  toggleFieldTipe('teks');
}

function kartuMateriDosen(m) {
  const ikonTipe = { teks: '📄', pdf: '📕', mp3: '🎵', link: '🔗' };
  return `
    <div class="card materi-card" data-materi-id="${m.id}">
      <div class="materi-info">
        <div class="materi-tipe-wrap">
          <span class="materi-tipe-badge tipe-${m.tipe}">${m.tipe.toUpperCase()}</span>
          <h3>${m.judul}</h3>
        </div>
        ${m.tipe === 'teks' ? `<p class="materi-preview">${m.isi_teks?.slice(0, 100)}${m.isi_teks?.length > 100 ? '...' : ''}</p>` : ''}
        ${m.tipe === 'link' ? `<a href="${m.url_eksternal}" target="_blank" class="materi-link">${m.url_eksternal}</a>` : ''}
        ${m.tipe === 'pdf' || m.tipe === 'mp3' ? `<p class="hint">File tersimpan di storage.</p>` : ''}
      </div>
      <div class="materi-actions">
        <button class="btn-danger btn-sm btn-hapus-materi">Hapus</button>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// MAHASISWA
// ─────────────────────────────────────────
async function renderMateriMahasiswa(container, profile, kelas) {
  const { data: materiList, error } = await supabase
    .from('materi')
    .select('*')
    .eq('kelas_id', kelas.id)
    .order('urutan', { ascending: true });

  if (error) { showError(container, error.message); return; }

  container.innerHTML = `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <a href="#/kelas" class="back-link">← Kelas</a>
          <h2>Materi — ${kelas.nama}</h2>
        </div>
      </div>
      <div id="daftar-materi">
        ${materiList.length === 0
          ? `<div class="empty-state">Belum ada materi di kelas ini.</div>`
          : materiList.map(m => kartuMateriMahasiswa(m)).join('')
        }
      </div>
    </div>
  `;

  // Event: unduh/buka file PDF dan MP3
  document.getElementById('daftar-materi').addEventListener('click', async (e) => {
    if (!e.target.classList.contains('btn-unduh')) return;
    const fileKey = e.target.dataset.fileKey;
    const btn = e.target;
    btn.disabled = true;
    btn.textContent = 'Memuat...';

    const { data, error } = await supabase.storage
      .from('materi-files')
      .createSignedUrl(fileKey, 300); // berlaku 5 menit

    if (error) {
      alert('Gagal membuat tautan: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Unduh / Buka';
      return;
    }

    window.open(data.signedUrl, '_blank');
    btn.disabled = false;
    btn.textContent = 'Unduh / Buka';
  });
}

function kartuMateriMahasiswa(m) {
  let konten = '';
  if (m.tipe === 'teks') {
    konten = `<div class="materi-teks">${m.isi_teks?.replace(/\n/g, '<br>') || ''}</div>`;
  } else if (m.tipe === 'link') {
    konten = `<a href="${m.url_eksternal}" target="_blank" class="btn-secondary btn-sm" style="margin-top:.5rem;display:inline-block">Buka Tautan →</a>`;
  } else if (m.tipe === 'pdf' || m.tipe === 'mp3') {
    konten = `<button class="btn-primary btn-sm btn-unduh" data-file-key="${m.file_key}" style="margin-top:.5rem">Unduh / Buka</button>`;
  }

  return `
    <div class="card materi-card" data-materi-id="${m.id}">
      <div class="materi-tipe-wrap" style="margin-bottom:.5rem">
        <span class="materi-tipe-badge tipe-${m.tipe}">${m.tipe.toUpperCase()}</span>
        <h3>${m.judul}</h3>
      </div>
      ${konten}
    </div>
  `;
}

function showError(container, msg) {
  container.innerHTML = `<div class="page-wrap"><p class="error-msg">${msg}</p></div>`;
}

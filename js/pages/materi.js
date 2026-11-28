import { supabase } from '../supabase.js';
import { getProfile } from '../auth.js';
import { escapeHtml, safeHttpUrl } from '../utils.js';

const BUCKET_MATERI = 'materi-files';
const TIPE_MATERI = ['teks', 'pdf', 'mp3', 'link'];
const MAKS_UKURAN_FILE = 50 * 1024 * 1024;

// Ekstensi dan content-type ditentukan dari TIPE yang dipilih, bukan dari nama file pengguna.
const ATURAN_FILE = {
  pdf: { ext: 'pdf', contentType: 'application/pdf', mimes: ['application/pdf'], label: 'PDF' },
  mp3: { ext: 'mp3', contentType: 'audio/mpeg', mimes: ['audio/mpeg', 'audio/mp3'], label: 'MP3' }
};

// Ambil kelas_id dari URL hash: #/materi?kelas=xxx
function getKelasId() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  return params.get('kelas');
}

function tipeAman(tipe) {
  return TIPE_MATERI.includes(tipe) ? tipe : 'teks';
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
            <a href="#/materi?kelas=${encodeURIComponent(k.id)}" class="card kelas-card" style="text-decoration:none;display:flex;align-items:center;justify-content:space-between">
              <h3 style="font-size:1rem">${escapeHtml(k.nama)}</h3>
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
          <h2>Materi — ${escapeHtml(kelas.nama)}</h2>
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

  setupFormMateri(container, kelas);

  // Event delegasi: hapus materi
  document.getElementById('daftar-materi').addEventListener('click', async (e) => {
    if (!e.target.classList.contains('btn-hapus-materi')) return;
    const materiId = e.target.closest('[data-materi-id]')?.dataset.materiId;
    if (!materiId) return;
    if (!confirm('Hapus materi ini?')) return;

    const btn = e.target;
    btn.disabled = true;

    const { data: m, error: errBaca } = await supabase
      .from('materi').select('file_key').eq('id', materiId).single();
    if (errBaca) { alert('Gagal membaca materi: ' + errBaca.message); btn.disabled = false; return; }

    // Hapus baris database dulu. Jika gagal, file di Storage tidak disentuh,
    // sehingga tidak ada materi yang menunjuk ke file yang sudah hilang.
    const { error: errHapus } = await supabase.from('materi').delete().eq('id', materiId);
    if (errHapus) { alert('Gagal menghapus materi: ' + errHapus.message); btn.disabled = false; return; }

    if (m?.file_key) {
      const { error: errFile } = await supabase.storage.from(BUCKET_MATERI).remove([m.file_key]);
      if (errFile) console.warn('File materi gagal dihapus dari Storage:', errFile.message);
    }

    await renderMateri(container);
  });
}

function setupFormMateri(container, kelas) {
  const form = document.getElementById('form-materi');
  const tipeSelect = document.getElementById('input-tipe');

  // Toggle field sesuai tipe
  tipeSelect.addEventListener('change', () => toggleFieldTipe(tipeSelect.value));

  document.getElementById('btn-tambah-materi').addEventListener('click', () => {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('btn-batal-materi').addEventListener('click', () => {
    form.style.display = 'none';
    resetForm();
  });

  document.getElementById('btn-simpan-materi').addEventListener('click', async () => {
    await simpanMateri(container, kelas);
  });
}

function toggleFieldTipe(tipe) {
  document.getElementById('field-teks').style.display = tipe === 'teks' ? 'block' : 'none';
  document.getElementById('field-file').style.display = (tipe === 'pdf' || tipe === 'mp3') ? 'block' : 'none';
  document.getElementById('field-link').style.display = tipe === 'link' ? 'block' : 'none';

  if (tipe === 'pdf') {
    document.getElementById('input-file').accept = '.pdf,application/pdf';
    document.getElementById('label-file').textContent = 'File PDF';
    document.getElementById('hint-file').textContent = 'Maks 50 MB. Format: PDF.';
  } else if (tipe === 'mp3') {
    document.getElementById('input-file').accept = '.mp3,audio/mpeg';
    document.getElementById('label-file').textContent = 'File Audio';
    document.getElementById('hint-file').textContent = 'Maks 50 MB. Format: MP3.';
  }
}

async function simpanMateri(container, kelas) {
  const judul = document.getElementById('input-judul').value.trim();
  const tipe = document.getElementById('input-tipe').value;
  const urutan = parseInt(document.getElementById('input-urutan').value, 10) || 0;
  const errEl = document.getElementById('err-materi');
  const btn = document.getElementById('btn-simpan-materi');
  const progressEl = document.getElementById('progress-upload');

  const gagal = (pesan) => {
    errEl.textContent = pesan;
    progressEl.style.display = 'none';
    btn.disabled = false;
    btn.textContent = 'Simpan';
  };

  errEl.textContent = '';
  if (!judul) { errEl.textContent = 'Judul tidak boleh kosong.'; return; }
  if (!TIPE_MATERI.includes(tipe)) { errEl.textContent = 'Tipe materi tidak valid.'; return; }

  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  const payload = { judul, tipe, urutan, kelas_id: kelas.id };
  let fileKeyBaru = null;

  if (tipe === 'teks') {
    const isi = document.getElementById('input-teks').value.trim();
    if (!isi) return gagal('Isi teks tidak boleh kosong.');
    payload.isi_teks = isi;

  } else if (tipe === 'link') {
    const mentah = document.getElementById('input-link').value.trim();
    if (!mentah) return gagal('URL tidak boleh kosong.');
    const url = safeHttpUrl(mentah);
    if (!url) return gagal('URL tidak valid. Gunakan alamat yang diawali http:// atau https://.');
    payload.url_eksternal = url;

  } else {
    // PDF atau MP3 — upload ke Supabase Storage
    const aturan = ATURAN_FILE[tipe];
    const file = document.getElementById('input-file').files[0];
    if (!file) return gagal('Pilih file terlebih dahulu.');
    if (file.size > MAKS_UKURAN_FILE) return gagal('File terlalu besar. Maks 50 MB.');
    if (!file.name.toLowerCase().endsWith('.' + aturan.ext)) return gagal(`File harus berformat ${aturan.label} (.${aturan.ext}).`);
    // Sebagian perangkat mobile tidak mengisi file.type; ekstensi tetap diperiksa di atas.
    if (file.type && !aturan.mimes.includes(file.type)) return gagal(`Jenis file tidak sesuai. Pilih file ${aturan.label}.`);

    // Progres bersifat indikatif: supabase-js tidak melaporkan progres unggahan.
    progressEl.style.display = 'block';
    setProgress(30);

    const fileKey = `${kelas.id}/${Date.now()}-${crypto.randomUUID()}.${aturan.ext}`;

    setProgress(50);
    const { error: errUpload } = await supabase.storage
      .from(BUCKET_MATERI)
      .upload(fileKey, file, { cacheControl: '3600', upsert: false, contentType: aturan.contentType });

    if (errUpload) return gagal('Gagal upload file: ' + errUpload.message);

    setProgress(90);
    payload.file_key = fileKey;
    fileKeyBaru = fileKey;
  }

  const { error } = await supabase.from('materi').insert(payload);

  if (error) {
    // Bersihkan file yang sudah terunggah agar tidak menjadi file yatim.
    if (fileKeyBaru) await supabase.storage.from(BUCKET_MATERI).remove([fileKeyBaru]);
    return gagal(error.message);
  }

  setProgress(100);
  await renderMateri(container);
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
  const tipe = tipeAman(m.tipe);
  const isi = m.isi_teks || '';
  const url = safeHttpUrl(m.url_eksternal);

  let konten = '';
  if (tipe === 'teks') {
    konten = `<p class="materi-preview">${escapeHtml(isi.slice(0, 100))}${isi.length > 100 ? '...' : ''}</p>`;
  } else if (tipe === 'link') {
    konten = url
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="materi-link">${escapeHtml(url)}</a>`
      : `<p class="hint">Tautan tidak valid.</p>`;
  } else {
    konten = `<p class="hint">File tersimpan di storage.</p>`;
  }

  return `
    <div class="card materi-card" data-materi-id="${escapeHtml(m.id)}">
      <div class="materi-info">
        <div class="materi-tipe-wrap">
          <span class="materi-tipe-badge tipe-${tipe}">${tipe.toUpperCase()}</span>
          <h3>${escapeHtml(m.judul)}</h3>
        </div>
        ${konten}
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
          <h2>Materi — ${escapeHtml(kelas.nama)}</h2>
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
    const btn = e.target.closest('.btn-unduh');
    if (!btn) return;
    const fileKey = btn.dataset.fileKey;

    btn.disabled = true;
    btn.textContent = 'Memuat...';

    // Jendela dibuka secara sinkron (masih dalam gestur klik) agar tidak diblokir
    // popup blocker, terutama di browser mobile; URL baru diisi setelah signed URL siap.
    const jendela = window.open('', '_blank');

    const { data, error } = await supabase.storage
      .from(BUCKET_MATERI)
      .createSignedUrl(fileKey, 300); // berlaku 5 menit

    if (error || !data?.signedUrl) {
      if (jendela) jendela.close();
      alert('Gagal membuat tautan: ' + (error?.message || 'tautan tidak tersedia'));
    } else if (jendela) {
      jendela.opener = null;
      jendela.location.href = data.signedUrl;
    } else {
      window.location.href = data.signedUrl;
    }

    btn.disabled = false;
    btn.textContent = 'Unduh / Buka';
  });
}

function kartuMateriMahasiswa(m) {
  const tipe = tipeAman(m.tipe);
  let konten = '';

  if (tipe === 'teks') {
    konten = `<div class="materi-teks">${escapeHtml(m.isi_teks || '').replace(/\r?\n/g, '<br>')}</div>`;
  } else if (tipe === 'link') {
    const url = safeHttpUrl(m.url_eksternal);
    konten = url
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary btn-sm" style="margin-top:.5rem;display:inline-block">Buka Tautan →</a>`
      : `<p class="hint">Tautan tidak valid.</p>`;
  } else if (m.file_key) {
    konten = `<button class="btn-primary btn-sm btn-unduh" data-file-key="${escapeHtml(m.file_key)}" style="margin-top:.5rem">Unduh / Buka</button>`;
  }

  return `
    <div class="card materi-card" data-materi-id="${escapeHtml(m.id)}">
      <div class="materi-tipe-wrap" style="margin-bottom:.5rem">
        <span class="materi-tipe-badge tipe-${tipe}">${tipe.toUpperCase()}</span>
        <h3>${escapeHtml(m.judul)}</h3>
      </div>
      ${konten}
    </div>
  `;
}

function showError(container, msg) {
  container.innerHTML = `<div class="page-wrap"><p class="error-msg">${escapeHtml(msg)}</p></div>`;
}

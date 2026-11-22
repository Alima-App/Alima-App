import { supabase } from '../supabase.js';
import { getProfile } from '../auth.js';

export async function renderKelas(container) {
  const profile = await getProfile();
  container.innerHTML = `<div class="page-wrap"><p class="loading">Memuat...</p></div>`;

  if (profile.peran === 'dosen') {
    await renderKelasDosen(container, profile);
  } else {
    await renderKelasMahasiswa(container, profile);
  }
}

// ─────────────────────────────────────────
// DOSEN
// ─────────────────────────────────────────
async function renderKelasDosen(container, profile) {
  const { data: kelasList, error } = await supabase
    .from('kelas')
    .select('*')
    .eq('pengajar_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) { showError(container, error.message); return; }

  container.innerHTML = `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <a href="#/dashboard-dosen" class="back-link">← Dashboard</a>
          <h2>Kelas Saya</h2>
        </div>
        <button class="btn-primary" id="btn-buat-kelas">+ Buat Kelas</button>
      </div>

      <div id="form-buat-kelas" class="card form-card" style="display:none">
        <h3>Buat Kelas Baru</h3>
        <div class="input-group">
          <label>Nama Kelas</label>
          <input type="text" id="input-nama-kelas" placeholder="cth: Bahasa Arab Dasar A" />
        </div>
        <p class="hint">Kode kelas akan dibuat otomatis.</p>
        <div class="form-actions">
          <button class="btn-primary" id="btn-simpan-kelas">Simpan</button>
          <button class="btn-ghost" id="btn-batal-kelas">Batal</button>
        </div>
        <p class="error-msg" id="err-kelas"></p>
      </div>

      <div id="daftar-kelas">
        ${kelasList.length === 0
          ? `<div class="empty-state">Belum ada kelas. Klik "Buat Kelas" untuk mulai.</div>`
          : kelasList.map(k => kartuKelasDosen(k)).join('')
        }
      </div>
    </div>
  `;

  // Toggle form
  document.getElementById('btn-buat-kelas').addEventListener('click', () => {
    const form = document.getElementById('form-buat-kelas');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('btn-batal-kelas').addEventListener('click', () => {
    document.getElementById('form-buat-kelas').style.display = 'none';
  });

  // Simpan kelas baru
  document.getElementById('btn-simpan-kelas').addEventListener('click', async () => {
    const nama = document.getElementById('input-nama-kelas').value.trim();
    const errEl = document.getElementById('err-kelas');
    const btn = document.getElementById('btn-simpan-kelas');
    if (!nama) { errEl.textContent = 'Nama kelas tidak boleh kosong.'; return; }

    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
    errEl.textContent = '';

    const kode = buatKode();
    const { error } = await supabase.from('kelas').insert({
      nama,
      kode,
      pengajar_id: profile.id
    });

    if (error) {
      errEl.textContent = error.message;
      btn.disabled = false;
      btn.textContent = 'Simpan';
      return;
    }

    window.location.hash = '#/kelas';
  });

  // Event delegasi: lihat anggota & hapus kelas
  document.getElementById('daftar-kelas').addEventListener('click', async (e) => {
    const kelasId = e.target.closest('[data-kelas-id]')?.dataset.kelasId;
    if (!kelasId) return;

    if (e.target.classList.contains('btn-lihat-anggota')) {
      await tampilAnggota(kelasId);
    }
    if (e.target.classList.contains('btn-hapus-kelas')) {
      if (!confirm('Hapus kelas ini? Semua data di dalamnya akan ikut terhapus.')) return;
      await supabase.from('kelas').delete().eq('id', kelasId);
      window.location.hash = '#/kelas';
    }
    if (e.target.classList.contains('btn-salin-kode')) {
      const kode = e.target.dataset.kode;
      navigator.clipboard.writeText(kode).then(() => {
        e.target.textContent = 'Tersalin!';
        setTimeout(() => e.target.textContent = 'Salin Kode', 1500);
      });
    }
  });
}

function kartuKelasDosen(k) {
  return `
    <div class="card kelas-card" data-kelas-id="${k.id}">
      <div class="kelas-info">
        <h3>${k.nama}</h3>
        <div class="kode-wrap">
          <span class="kode-label">Kode:</span>
          <code class="kode">${k.kode}</code>
          <button class="btn-ghost btn-sm btn-salin-kode" data-kode="${k.kode}">Salin Kode</button>
        </div>
        <p class="muted">Dibuat ${formatTanggal(k.created_at)}</p>
      </div>
      <div class="kelas-actions">
        <button class="btn-secondary btn-sm btn-lihat-anggota">Lihat Anggota</button>
        <button class="btn-danger btn-sm btn-hapus-kelas">Hapus</button>
      </div>
    </div>
  `;
}

async function tampilAnggota(kelasId) {
  const { data, error } = await supabase
    .from('anggota_kelas')
    .select('mahasiswa_id, joined_at, profiles(nama, email)')
    .eq('kelas_id', kelasId);

  if (error) { alert('Gagal memuat anggota: ' + error.message); return; }

  const isi = data.length === 0
    ? '<p class="muted">Belum ada mahasiswa yang bergabung.</p>'
    : `<table class="tabel-anggota">
        <thead><tr><th>Nama</th><th>Email</th><th>Bergabung</th><th></th></tr></thead>
        <tbody>
          ${data.map(a => `
            <tr>
              <td>${a.profiles.nama}</td>
              <td>${a.profiles.email}</td>
              <td>${formatTanggal(a.joined_at)}</td>
              <td><button class="btn-danger btn-sm btn-keluarkan"
                data-kelas-id="${kelasId}"
                data-mahasiswa-id="${a.mahasiswa_id}">Keluarkan</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

  // Tampilkan sebagai modal sederhana
  let modal = document.getElementById('modal-anggota');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-anggota';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>Daftar Anggota (${data.length} mahasiswa)</h3>
        <button id="btn-tutup-modal">✕</button>
      </div>
      <div class="modal-body">${isi}</div>
    </div>
  `;
  modal.style.display = 'flex';

  document.getElementById('btn-tutup-modal').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.querySelectorAll('.btn-keluarkan').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Keluarkan mahasiswa ini dari kelas?')) return;
      await supabase.from('anggota_kelas')
        .delete()
        .eq('kelas_id', btn.dataset.kelasId)
        .eq('mahasiswa_id', btn.dataset.mahasiswaId);
      modal.style.display = 'none';
      await tampilAnggota(kelasId);
    });
  });
}

// ─────────────────────────────────────────
// MAHASISWA
// ─────────────────────────────────────────
async function renderKelasMahasiswa(container, profile) {
  const { data: kelasList, error } = await supabase
    .from('kelas')
    .select('*, anggota_kelas!inner(mahasiswa_id)')
    .eq('anggota_kelas.mahasiswa_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) { showError(container, error.message); return; }

  container.innerHTML = `
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <a href="#/dashboard-mahasiswa" class="back-link">← Dashboard</a>
          <h2>Kelas Saya</h2>
        </div>
        <button class="btn-primary" id="btn-gabung-kelas">+ Gabung Kelas</button>
      </div>

      <div id="form-gabung-kelas" class="card form-card" style="display:none">
        <h3>Gabung dengan Kode Kelas</h3>
        <div class="input-group">
          <label>Kode Kelas</label>
          <input type="text" id="input-kode-kelas" placeholder="cth: AB1C2D"
            maxlength="6" style="text-transform:uppercase;letter-spacing:.15em" />
        </div>
        <div class="form-actions">
          <button class="btn-primary" id="btn-simpan-gabung">Gabung</button>
          <button class="btn-ghost" id="btn-batal-gabung">Batal</button>
        </div>
        <p class="error-msg" id="err-gabung"></p>
      </div>

      <div id="daftar-kelas">
        ${kelasList.length === 0
          ? `<div class="empty-state">Belum bergabung ke kelas apapun. Minta kode kelas ke dosen.</div>`
          : kelasList.map(k => kartuKelasMahasiswa(k)).join('')
        }
      </div>
    </div>
  `;

  document.getElementById('btn-gabung-kelas').addEventListener('click', () => {
    const form = document.getElementById('form-gabung-kelas');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('btn-batal-gabung').addEventListener('click', () => {
    document.getElementById('form-gabung-kelas').style.display = 'none';
  });

  document.getElementById('btn-simpan-gabung').addEventListener('click', async () => {
    const kode = document.getElementById('input-kode-kelas').value.trim().toUpperCase();
    const errEl = document.getElementById('err-gabung');
    const btn = document.getElementById('btn-simpan-gabung');
    if (!kode) { errEl.textContent = 'Masukkan kode kelas.'; return; }

    btn.disabled = true;
    btn.textContent = 'Menggabungkan...';
    errEl.textContent = '';

    // Bergabung melalui RPC atomik; mahasiswa tidak memiliki INSERT langsung.
    const { error: errGabung } = await supabase
      .rpc('gabung_kelas_by_kode', { p_kode: kode });

    if (errGabung) {
      errEl.textContent = errGabung.message;
      btn.disabled = false;
      btn.textContent = 'Gabung';
      return;
    }

    window.location.hash = '#/kelas';
  });
}

function kartuKelasMahasiswa(k) {
  return `
    <div class="card kelas-card" data-kelas-id="${k.id}">
      <div class="kelas-info">
        <h3>${k.nama}</h3>
        <p class="muted">Bergabung ${formatTanggal(k.created_at)}</p>
      </div>
      <div class="kelas-actions">
        <a href="#/materi?kelas=${k.id}" class="btn-secondary btn-sm">Materi</a>
        <a href="#/tugas?kelas=${k.id}" class="btn-secondary btn-sm">Tugas</a>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────
function buatKode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function showError(container, msg) {
  container.innerHTML = `<div class="page-wrap"><p class="error-msg">${msg}</p></div>`;
        }

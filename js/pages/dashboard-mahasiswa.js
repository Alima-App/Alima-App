import { logout } from '../auth.js';

export function renderDashboardMahasiswa(container, profile) {
  container.innerHTML = `
    <div class="dashboard-wrap">
      <nav class="topbar">
        <span class="topbar-logo">Alima</span>
        <span class="topbar-user">👤 ${profile.nama}</span>
        <button id="btn-logout">Keluar</button>
      </nav>
      <main class="dashboard-main">
        <h2>Halo, ${profile.nama}</h2>
        <p class="peran-badge mahasiswa">Mahasiswa</p>
        <div class="menu-grid">
          <a href="#/kelas" class="menu-card">🏫 Kelas Saya</a>
          <a href="#/materi" class="menu-card">📚 Materi</a>
          <a href="#/tugas" class="menu-card">📝 Tugas</a>
          <a href="#/nilai" class="menu-card">📊 Nilai Saya</a>
        </div>
      </main>
    </div>
  `;
  document.getElementById('btn-logout').addEventListener('click', logout);
}

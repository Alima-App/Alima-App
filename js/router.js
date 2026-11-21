import { getProfile } from './auth.js';
import { renderLogin } from './pages/login.js';
import { renderDashboardDosen } from './pages/dashboard-dosen.js';
import { renderDashboardMahasiswa } from './pages/dashboard-mahasiswa.js';
import { renderKelas } from './pages/kelas.js';
import { renderMateri } from './pages/materi.js';

const app = document.getElementById('app');

function showLoading() {
  app.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:1rem">
      <div class="spinner"></div>
      <p style="color:var(--muted);font-size:.85rem">Memuat...</p>
    </div>
  `;
}

export async function navigate() {
  showLoading();

  const hash = window.location.hash || '#/login';
  const profile = await getProfile();

  const protected_routes = ['#/dashboard', '#/kelas', '#/materi', '#/tugas', '#/nilai'];
  const is_protected = protected_routes.some(r => hash.startsWith(r));

  if (is_protected && !profile) {
    window.location.hash = '#/login';
    return;
  }

  if (hash === '#/login' || hash === '#/daftar') {
    if (profile) {
      window.location.hash = profile.peran === 'dosen'
        ? '#/dashboard-dosen'
        : '#/dashboard-mahasiswa';
      return;
    }
    renderLogin(app, hash === '#/daftar');
    return;
  }

  if (hash.startsWith('#/dashboard-dosen')) {
    if (profile?.peran !== 'dosen') { window.location.hash = '#/login'; return; }
    renderDashboardDosen(app, profile);
    return;
  }

  if (hash.startsWith('#/dashboard-mahasiswa')) {
    if (profile?.peran !== 'mahasiswa') { window.location.hash = '#/login'; return; }
    renderDashboardMahasiswa(app, profile);
    return;
  }

  if (hash.startsWith('#/kelas')) {
    renderKelas(app);
    return;
  }

  if (hash.startsWith('#/materi')) {
    renderMateri(app);
    return;
  }

  app.innerHTML = `
    <div class="page-wrap">
      <a href="${profile?.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa'}" class="back-link">← Dashboard</a>
      <div class="empty-state" style="margin-top:1rem">Halaman ini sedang dalam pengerjaan.</div>
    </div>
  `;
}

window.addEventListener('hashchange', navigate);

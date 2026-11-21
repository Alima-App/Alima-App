import { getProfile } from './auth.js';
import { renderLogin } from './pages/login.js';
import { renderDashboardDosen } from './pages/dashboard-dosen.js';
import { renderDashboardMahasiswa } from './pages/dashboard-mahasiswa.js';
import { renderKelas } from './pages/kelas.js'; // ← tambah ini
import { renderMateri } from './pages/materi.js'; // ← tambah

const app = document.getElementById('app');

export async function navigate() {
  const hash = window.location.hash || '#/login';
  const profile = await getProfile();

  // Halaman yang butuh login
  const protected_routes = ['#/dashboard', '#/kelas', '#/materi', '#/tugas', '#/nilai'];
  const is_protected = protected_routes.some(r => hash.startsWith(r));

  if (is_protected && !profile) {
    window.location.hash = '#/login';
    return;
  }

  if (hash === '#/login' || hash === '#/daftar') {
    if (profile) {
      // Sudah login, redirect ke dashboard sesuai peran
      window.location.hash = profile.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa';
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

  if (hash.startsWith('#/materi')) {
  renderMateri(app);
  return;
  }

  // Fallback
  app.innerHTML = '<p style="padding:2rem">Halaman tidak ditemukan.</p>';
}

window.addEventListener('hashchange', navigate);

import { getProfile } from './auth.js';
import { renderLogin } from './pages/login.js';
import { renderDashboardDosen } from './pages/dashboard-dosen.js';
import { renderDashboardMahasiswa } from './pages/dashboard-mahasiswa.js';

const app = document.getElementById('app');
let navigating = false;

export async function navigate() {
  if (navigating) return;
  navigating = true;
  try {
    const hash = window.location.hash || '#/login';
    const profile = await getProfile();
    if (hash === '#/login' || hash === '#/' || hash === '') {
      if (profile) { window.location.hash = profile.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa'; return; }
      renderLogin(app); return;
    }
    if (!profile) { window.location.hash = '#/login'; return; }
    if (hash.startsWith('#/dashboard-dosen') && profile.peran === 'dosen') { renderDashboardDosen(app, profile); return; }
    if (hash.startsWith('#/dashboard-mahasiswa') && profile.peran === 'mahasiswa') { renderDashboardMahasiswa(app, profile); return; }
    if (hash.startsWith('#/dashboard')) { window.location.hash = profile.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa'; return; }
    app.innerHTML = `<main class="preview-page"><a href="${profile.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa'}">← Kembali ke dashboard</a><div class="preview-card"><span class="eyebrow">DEMO PREVIEW</span><h1>Fitur sedang disiapkan</h1><p>Halaman kelas, materi, tugas, dan nilai akan dihubungkan ke data demo pada tahap berikutnya.</p></div></main>`;
  } catch (error) {
    app.innerHTML = `<main class="preview-page"><div class="preview-card"><h1>Aplikasi tidak dapat dimuat</h1><p>${String(error.message || error)}</p><button class="login-submit" onclick="location.reload()">Coba lagi</button></div></main>`;
  } finally { navigating = false; }
}
window.addEventListener('hashchange', navigate);

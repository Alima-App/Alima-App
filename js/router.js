import { deployment } from './deployment-config.js';
import { getProfile } from './auth.js';
import { escapeHtml } from './utils.js';

const app = document.getElementById('app');
let navigating = false;
// Navigasi yang masuk saat navigasi lain masih berjalan diantrikan (bukan dibuang),
// supaya klik cepat tidak meninggalkan halaman lama di layar.
let pending = false;

export async function navigate() {
  if (navigating) { pending = true; return; }
  navigating = true;
  try {
    const hash = location.hash || '#/login';
    const profile = await getProfile();

    if (hash === '#/login' || hash === '#/' || hash === '#/daftar') {
      if (profile) {
        location.hash = profile.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa';
        return;
      }
      if (deployment.mode === 'demo') {
        const { renderLogin } = await import('./pages/login-demo.js');
        renderLogin(app);
      } else {
        const { renderLogin } = await import('./pages/login-production.js');
        renderLogin(app, hash === '#/daftar');
      }
      return;
    }

    if (!profile) { location.hash = '#/login'; return; }

    if (hash.startsWith('#/dashboard')) {
      if (deployment.mode === 'demo') {
        const page = profile.peran === 'dosen'
          ? await import('./pages/dashboard-dosen.js')
          : await import('./pages/dashboard-mahasiswa.js');
        (profile.peran === 'dosen' ? page.renderDashboardDosen : page.renderDashboardMahasiswa)(app, profile);
      } else {
        const page = await import('./pages/dashboard-production.js');
        page.renderDashboardProduction(app, profile);
      }
      return;
    }

    if (hash.startsWith('#/kelas')) {
      if (deployment.mode === 'demo') showPlaceholder();
      else { const page = await import('./pages/kelas.js'); await page.renderKelas(app); }
      return;
    }

    if (hash.startsWith('#/materi')) {
      if (deployment.mode === 'demo') showPlaceholder();
      else { const page = await import('./pages/materi.js'); await page.renderMateri(app); }
      return;
    }

    showPlaceholder();
  } catch (error) {
    app.innerHTML = `<main class="preview-page"><div class="preview-card"><h1>Aplikasi tidak dapat dimuat</h1><p>${escapeHtml(error.message || error)}</p><button class="login-submit" id="retry">Coba lagi</button></div></main>`;
    app.querySelector('#retry')?.addEventListener('click', () => location.reload());
  } finally {
    navigating = false;
    if (pending) { pending = false; navigate(); }
  }
}

function showPlaceholder() {
  const demo = deployment.mode === 'demo';
  const label = demo ? 'DEMO PREVIEW' : 'SEGERA HADIR';
  const pesan = demo
    ? 'Halaman ini belum tersedia pada dataset demonstrasi.'
    : 'Halaman ini belum tersedia. Fitur sedang dalam pengembangan.';
  app.innerHTML = `<main class="preview-page"><a href="#/dashboard">← Kembali ke dashboard</a><div class="preview-card"><span class="eyebrow">${label}</span><h1>Fitur sedang disiapkan</h1><p>${pesan}</p></div></main>`;
}

window.addEventListener('hashchange', navigate);

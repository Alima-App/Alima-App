import { getSession, getProfile } from './auth.js';
import { renderLogin } from './pages/login.js';
import { renderDashboardDosen } from './pages/dashboard-dosen.js';
import { renderDashboardMahasiswa } from './pages/dashboard-mahasiswa.js';
import { renderKelas } from './pages/kelas.js';
import { renderMateri } from './pages/materi.js';

const app = document.getElementById('app');
let isFirstLoad = true;
let navigationId = 0;

function showLoading() {
  app.innerHTML = isFirstLoad
    ? `<div class="page-wrap" style="min-height:70vh;display:grid;place-content:center;text-align:center">
         <strong style="font:900 2.2rem Georgia,serif;color:var(--navy)">Ali<span style="color:var(--green)">ma</span></strong>
         <div class="spinner" role="status" aria-label="Memuat"></div>
         <p class="loading">Menyiapkan kelas...</p>
       </div>`
    : `<div class="page-wrap"><div class="skeleton" style="height:24px;width:45%;margin-bottom:1rem"></div><div class="skeleton" style="height:90px;margin-bottom:1rem"></div><div class="skeleton" style="height:90px"></div></div>`;
  isFirstLoad = false;
}

function showError(error) {
  console.error('[Alima] Gagal memuat aplikasi:', error);
  app.innerHTML = `<main class="page-wrap" role="alert">
    <h2>Aplikasi belum dapat dimuat</h2>
    <p class="muted" style="margin:1rem 0">Periksa koneksi internet dan konfigurasi layanan. Silakan coba kembali.</p>
    <button class="btn-primary" id="btn-retry">Coba Lagi</button>
  </main>`;
  document.getElementById('btn-retry')?.addEventListener('click', () => navigate());
}

export async function navigate() {
  const currentNavigation = ++navigationId;
  const hash = window.location.hash || '#/login';
  const publicRoute = hash === '#/login' || hash === '#/daftar';
  showLoading();

  try {
    // Halaman login/daftar tidak perlu menunggu query profil ke database.
    const session = await getSession();
    if (currentNavigation !== navigationId) return;

    if (publicRoute && !session) {
      renderLogin(app, hash === '#/daftar');
      return;
    }

    const protectedRoutes = ['#/dashboard', '#/kelas', '#/materi', '#/tugas', '#/nilai'];
    const isProtected = protectedRoutes.some(route => hash.startsWith(route));
    if (isProtected && !session) {
      window.location.hash = '#/login';
      return;
    }

    // Profil hanya diminta saat sesi ada atau halaman memerlukannya.
    const profile = session ? await getProfile() : null;
    if (currentNavigation !== navigationId) return;

    if (session && !profile) {
      app.innerHTML = `<div class="page-wrap"><p class="error-msg">Profil akun tidak ditemukan. Silakan hubungi pengelola kelas.</p><button class="btn-primary" id="btn-signout">Kembali ke Login</button></div>`;
      document.getElementById('btn-signout')?.addEventListener('click', async () => {
        const { supabase } = await import('./supabase.js');
        await supabase.auth.signOut();
        window.location.hash = '#/login';
      });
      return;
    }

    if (publicRoute) {
      window.location.hash = profile.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa';
      return;
    }
    if (hash.startsWith('#/dashboard-dosen')) {
      if (profile?.peran !== 'dosen') { window.location.hash = '#/login'; return; }
      renderDashboardDosen(app, profile); return;
    }
    if (hash.startsWith('#/dashboard-mahasiswa')) {
      if (profile?.peran !== 'mahasiswa') { window.location.hash = '#/login'; return; }
      renderDashboardMahasiswa(app, profile); return;
    }
    if (hash.startsWith('#/kelas')) { renderKelas(app); return; }
    if (hash.startsWith('#/materi')) { await renderMateri(app); return; }

    app.innerHTML = `<div class="page-wrap"><a href="${profile?.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa'}" class="back-link">← Dashboard</a><div class="empty-state" style="margin-top:1rem">Halaman ini sedang dalam pengerjaan.</div></div>`;
  } catch (error) {
    if (currentNavigation === navigationId) showError(error);
  }
}

window.addEventListener('hashchange', navigate);

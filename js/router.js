import { getProfile } from './auth.js';
import { renderLogin } from './pages/login.js';
import { renderDashboardDosen } from './pages/dashboard-dosen.js';
import { renderDashboardMahasiswa } from './pages/dashboard-mahasiswa.js';
import { renderKelas } from './pages/kelas.js';
import { renderMateri } from './pages/materi.js';

const app = document.getElementById('app');
let isFirstLoad = true;

function showLoading() {
  app.innerHTML = `
    <div class="page-wrap" style="max-width:900px;margin:0 auto;padding:2rem 5%">
      <div class="skeleton" style="width:160px;height:20px;margin-bottom:2rem"></div>
      <div class="skeleton" style="width:100%;height:80px;margin-bottom:1rem"></div>
      <div class="skeleton" style="width:100%;height:80px;margin-bottom:1rem"></div>
      <div class="skeleton" style="width:100%;height:80px"></div>
    </div>
  `;
}

function showLoading() {
  if (isFirstLoad) {
    // Splash screen hanya saat pertama buka
    app.innerHTML = `
      <div style="
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        min-height:100vh;gap:1.25rem;background:var(--white)
      ">
        <div style="
          font-family:'Playfair Display',serif;
          font-size:2.5rem;font-weight:900;
          color:var(--navy);letter-spacing:-0.02em
        ">
          Ali<span style="color:var(--green)">ma</span>
        </div>
        <div class="spinner"></div>
        <p style="color:var(--muted);font-size:.78rem;letter-spacing:.06em;text-transform:uppercase">
          Menyiapkan kelas...
        </p>
      </div>
    `;
    isFirstLoad = false;
  } else {
    // Skeleton saat navigasi antar halaman
    app.innerHTML = `
      <div class="page-wrap" style="max-width:900px;margin:0 auto;padding:2rem 5%">
        <div class="skeleton" style="width:120px;height:16px;margin-bottom:1.5rem;border-radius:6px"></div>
        <div class="skeleton" style="width:200px;height:28px;margin-bottom:2rem;border-radius:6px"></div>
        <div class="skeleton" style="width:100%;height:88px;margin-bottom:.75rem;border-radius:10px"></div>
        <div class="skeleton" style="width:100%;height:88px;margin-bottom:.75rem;border-radius:10px"></div>
        <div class="skeleton" style="width:80%;height:88px;border-radius:10px"></div>
      </div>
    `;
  }
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

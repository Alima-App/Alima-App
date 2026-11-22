import { deployment } from '../deployment-config.js';
import { logout } from '../auth.js';
import { dummyDb } from '../../dummy-data.js';

const initials = name => name.split(' ').slice(0,2).map(part => part[0]).join('').toUpperCase();

export function renderDashboardDosen(container, profile) {
  const classes = dummyDb.kelas.byDosen(profile.id).data || [];
  const students = classes.reduce((sum, item) => sum + (dummyDb.anggotaKelas.byKelas(item.id).data || []).length, 0);
  const materials = classes.reduce((sum, item) => sum + (dummyDb.materi.byKelas(item.id).data || []).length, 0);
  const assignments = classes.reduce((sum, item) => sum + (dummyDb.tugas.byKelas(item.id).data || []).length, 0);
  container.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar"><a class="sidebar-brand" href="#/dashboard-dosen"><span class="brand-mark">ع</span><span>Alima<small>LEARNING SPACE</small></span></a><div class="sidebar-label">MENU UTAMA</div><a class="side-link active" href="#/dashboard-dosen">▦ <span>Dashboard</span></a><a class="side-link" href="#/kelas">▤ <span>Kelas saya</span></a><a class="side-link" href="#/materi">▧ <span>Materi</span></a><a class="side-link" href="#/tugas">☷ <span>Tugas</span></a><a class="side-link" href="#/nilai">▥ <span>Penilaian</span></a><div class="sidebar-bottom"><div class="profile-mini"><span class="avatar">${initials(profile.nama)}</span><span><strong>${profile.nama}</strong><small>Dosen pengajar</small></span></div><button class="side-logout" id="btn-logout">↪ Keluar</button></div></aside>
      <button class="sidebar-backdrop" id="sidebar-backdrop" type="button" aria-label="Tutup menu"></button>
      <main class="workspace"><header class="workspace-header"><div class="workspace-heading"><button class="mobile-menu-toggle" id="btn-menu-toggle" type="button" aria-label="Buka menu navigasi" aria-expanded="false">☰ <span>Menu</span></button><h1 class="header-page-title">Dashboard</h1></div><div class="header-right"><span class="demo-pill">${deployment.mode === 'demo' ? 'DEMO MODE' : 'PRODUCTION'}</span><span class="header-date">22 November 2026</span><span class="avatar">${initials(profile.nama)}</span></div></header>
        <div class="workspace-context eyebrow">RUANG DOSEN / OVERVIEW</div><section class="welcome-banner"><div><span class="eyebrow light">ASSALAMU'ALAIKUM</span><h2>Selamat datang, ${profile.nama.split(',')[0]} 👋</h2><p>Pantau kelas dan aktivitas pembelajaran bahasa Arab Anda hari ini.</p></div><div class="welcome-arabic" lang="ar" dir="rtl">مَرْحَبًا بِكُمْ</div></section>
        <section class="stat-grid"><article class="stat-card"><span class="stat-icon green">▤</span><span class="stat-label">Total kelas</span><strong>${classes.length}</strong><small>Kelas yang Anda kelola</small></article><article class="stat-card"><span class="stat-icon blue">♙</span><span class="stat-label">Mahasiswa</span><strong>${students}</strong><small>Terdaftar di kelas Anda</small></article><article class="stat-card"><span class="stat-icon amber">▧</span><span class="stat-label">Materi belajar</span><strong>${materials}</strong><small>Materi telah dibagikan</small></article><article class="stat-card"><span class="stat-icon violet">☷</span><span class="stat-label">Tugas</span><strong>${assignments}</strong><small>Tugas dalam kelas</small></article></section>
        <section class="content-grid"><div class="panel"><div class="panel-heading"><div><span class="eyebrow">PENGELOLAAN</span><h3>Kelas yang Anda ajar</h3></div><a href="#/kelas">Lihat semua →</a></div><div class="class-list">${classes.map((item,index)=>{const count=(dummyDb.anggotaKelas.byKelas(item.id).data||[]).length;return `<article class="class-row"><span class="class-symbol symbol-${index%3}">ع</span><div class="class-details"><strong>${item.nama}</strong><small>Kode kelas: ${item.kode} · ${count} mahasiswa</small></div><a class="row-arrow" href="#/kelas">→</a></article>`}).join('')}</div></div>
        <div class="panel activity-panel"><div class="panel-heading"><div><span class="eyebrow">AKSES CEPAT</span><h3>Aktivitas dosen</h3></div></div><a class="quick-action" href="#/materi"><span>▧</span><div><strong>Kelola materi</strong><small>Atur bahan pembelajaran</small></div><b>→</b></a><a class="quick-action" href="#/tugas"><span>☷</span><div><strong>Buat tugas</strong><small>Siapkan latihan mahasiswa</small></div><b>→</b></a><a class="quick-action" href="#/nilai"><span>▥</span><div><strong>Lihat penilaian</strong><small>Pantau hasil belajar</small></div><b>→</b></a></div></section>
        <footer class="workspace-footer">© 2026 Alima App <span>${deployment.mode === 'demo' ? 'Data demonstrasi · Tidak terhubung ke server' : 'Lingkungan produksi'}</span></footer>
      </main>
    </div>`;
  const sidebar = container.querySelector('.sidebar');
  const menuButton = container.querySelector('#btn-menu-toggle');
  const backdrop = container.querySelector('#sidebar-backdrop');
  const closeMenu = () => { container.querySelector('.app-shell').classList.remove('sidebar-open'); menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton.addEventListener('click', () => { const open = container.querySelector('.app-shell').classList.toggle('sidebar-open'); menuButton.setAttribute('aria-expanded', String(open)); });
  backdrop.addEventListener('click', closeMenu);
  sidebar.querySelectorAll('a.side-link, a.sidebar-brand').forEach(link => link.addEventListener('click', closeMenu));
  container.querySelector('#btn-logout').addEventListener('click', logout);
}

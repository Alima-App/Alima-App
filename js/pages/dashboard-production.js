import { logout } from '../auth.js';
import { escapeHtml, getInitials } from '../utils.js';

export function renderDashboardProduction(container, profile) {
  const role = profile.peran === 'dosen' ? 'Dosen pengajar' : 'Mahasiswa';
  const namaMentah = profile.nama || 'Pengguna';
  const nama = escapeHtml(namaMentah);
  // Inisial dihitung dari nama mentah, baru di-escape (sebelumnya dihitung dari
  // teks yang sudah di-escape sehingga nama berawalan "&" atau "<" menghasilkan inisial salah).
  const initials = escapeHtml(getInitials(namaMentah));
  const nilaiLabel = profile.peran === 'dosen' ? 'Penilaian' : 'Nilai saya';

  container.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="sidebar-brand" href="#/dashboard"><span class="brand-mark">ع</span><span>Alima<small>LEARNING SPACE</small></span></a>
        <div class="sidebar-label">MENU UTAMA</div>
        <a class="side-link active" href="#/dashboard">▦ <span>Dashboard</span></a>
        <a class="side-link" href="#/kelas">▤ <span>Kelas saya</span></a>
        <a class="side-link" href="#/materi">▧ <span>Materi belajar</span></a>
        <a class="side-link" href="#/tugas">☷ <span>Tugas</span></a>
        <a class="side-link" href="#/nilai">▥ <span>${nilaiLabel}</span></a>
        <div class="sidebar-bottom">
          <div class="profile-mini"><span class="avatar">${initials}</span><span><strong>${nama}</strong><small>${role}</small></span></div>
          <button class="side-logout" id="btn-logout" type="button">↪ Keluar</button>
        </div>
      </aside>
      <button class="mobile-menu-toggle" id="btn-menu-toggle" type="button" aria-label="Buka menu navigasi" aria-expanded="false">☰ <span>Menu</span></button>
      <button class="sidebar-backdrop" id="sidebar-backdrop" type="button" aria-label="Tutup menu"></button>
      <main class="workspace">
        <header class="workspace-header">
          <div><h1 class="header-page-title">Dashboard</h1></div>
          <div class="header-right"><span class="demo-pill">PRODUCTION</span><span class="avatar">${initials}</span></div>
        </header>
        <div class="workspace-context eyebrow">LINGKUNGAN PRODUKSI</div><section class="welcome-banner">
          <div><span class="eyebrow light">${role.toUpperCase()}</span><h2>Assalamu’alaikum, ${nama}.</h2><p>Selamat datang di ruang belajar digital Alima App.</p></div>
          <div class="welcome-arabic" lang="ar" dir="rtl">مَرْحَبًا بِكُمْ</div>
        </section>
        <section class="content-grid" style="margin-top:20px">
          <div class="panel">
            <div class="panel-heading"><div><span class="eyebrow">MULAI BELAJAR</span><h3>Akses pembelajaran</h3></div></div>
            <a class="quick-action" href="#/kelas"><span>▤</span><div><strong>Kelas saya</strong><small>Lihat kelas yang diikuti atau dikelola</small></div><b>→</b></a>
            <a class="quick-action" href="#/materi"><span>▧</span><div><strong>Materi belajar</strong><small>Akses bahan pembelajaran</small></div><b>→</b></a>
            <a class="quick-action" href="#/tugas"><span>☷</span><div><strong>Tugas</strong><small>Lihat aktivitas dan latihan</small></div><b>→</b></a>
            <a class="quick-action" href="#/nilai"><span>▥</span><div><strong>${nilaiLabel}</strong><small>Pantau hasil pembelajaran</small></div><b>→</b></a>
          </div>
        </section>
        <footer class="workspace-footer">© 2026 Alima App <span>Data produksi · Dilindungi Supabase Auth dan RLS</span></footer>
      </main>
    </div>`;

  const shell = container.querySelector('.app-shell');
  const menuButton = container.querySelector('#btn-menu-toggle');
  const backdrop = container.querySelector('#sidebar-backdrop');
  const closeMenu = () => {
    shell.classList.remove('sidebar-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const open = shell.classList.toggle('sidebar-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  backdrop.addEventListener('click', closeMenu);
  container.querySelectorAll('.sidebar a').forEach(link => link.addEventListener('click', closeMenu));
  container.querySelector('#btn-logout').addEventListener('click', logout);
}

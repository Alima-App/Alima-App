import { deployment } from '../deployment-config.js';
import { logout } from '../auth.js';
import { dummyDb } from '../../dummy-data.js';

const initials = name => name.split(' ').slice(0,2).map(part => part[0]).join('').toUpperCase();

export function renderDashboardMahasiswa(container, profile) {
  const classes = dummyDb.kelas.byMahasiswa(profile.id).data || [];
  const materials = classes.flatMap(item => dummyDb.materi.byKelas(item.id).data || []);
  const tasks = classes.flatMap(item => dummyDb.tugas.byKelas(item.id).data || []);
  const completed = tasks.filter(task => dummyDb.jawaban.sudahDikerjakan(profile.id, task.id)).length;
  container.innerHTML = `
    <div class="app-shell"><aside class="sidebar"><a class="sidebar-brand" href="#/dashboard-mahasiswa"><span class="brand-mark">ع</span><span>Alima<small>LEARNING SPACE</small></span></a><div class="sidebar-label">MENU UTAMA</div><a class="side-link active" href="#/dashboard-mahasiswa">▦ <span>Dashboard</span></a><a class="side-link" href="#/kelas">▤ <span>Kelas saya</span></a><a class="side-link" href="#/materi">▧ <span>Materi belajar</span></a><a class="side-link" href="#/tugas">☷ <span>Tugas</span></a><a class="side-link" href="#/nilai">▥ <span>Nilai saya</span></a><div class="sidebar-bottom"><div class="profile-mini"><span class="avatar">${initials(profile.nama)}</span><span><strong>${profile.nama}</strong><small>Mahasiswa</small></span></div><button class="side-logout" id="btn-logout">↪ Keluar</button></div></aside>
    <main class="workspace"><header class="workspace-header"><div><span class="eyebrow">RUANG MAHASISWA / OVERVIEW</span><h1>Dashboard</h1></div><div class="header-right"><span class="demo-pill">${deployment.mode === 'demo' ? 'DEMO MODE' : 'PRODUCTION'}</span><span class="header-date">22 November 2026</span><span class="avatar">${initials(profile.nama)}</span></div></header>
      <section class="welcome-banner student-banner"><div><span class="eyebrow light">SELAMAT BELAJAR</span><h2>Halo, ${profile.nama.split(' ')[0]}! 👋</h2><p>Terus tingkatkan kemampuan bahasa Arabmu. Sedikit demi sedikit, menjadi mahir.</p></div><div class="welcome-arabic" lang="ar" dir="rtl">طَلَبُ الْعِلْمِ</div></section>
      <section class="stat-grid"><article class="stat-card"><span class="stat-icon green">▤</span><span class="stat-label">Kelas diikuti</span><strong>${classes.length}</strong><small>Kelas aktif Anda</small></article><article class="stat-card"><span class="stat-icon blue">▧</span><span class="stat-label">Materi tersedia</span><strong>${materials.length}</strong><small>Bahan belajar</small></article><article class="stat-card"><span class="stat-icon amber">☷</span><span class="stat-label">Total tugas</span><strong>${tasks.length}</strong><small>Latihan pembelajaran</small></article><article class="stat-card"><span class="stat-icon violet">✓</span><span class="stat-label">Tugas dikerjakan</span><strong>${completed}</strong><small>Dari ${tasks.length} tugas</small></article></section>
      <section class="content-grid"><div class="panel"><div class="panel-heading"><div><span class="eyebrow">PEMBELAJARAN</span><h3>Kelas saya</h3></div><a href="#/kelas">Lihat semua →</a></div><div class="class-list">${classes.map((item,index)=>`<article class="class-row"><span class="class-symbol symbol-${index%3}">ع</span><div class="class-details"><strong>${item.nama}</strong><small>Kode kelas: ${item.kode}</small></div><a class="row-arrow" href="#/materi">→</a></article>`).join('')}</div></div>
      <div class="panel"><div class="panel-heading"><div><span class="eyebrow">LANJUTKAN BELAJAR</span><h3>Materi terbaru</h3></div></div>${materials.slice(0,3).map(item=>`<a class="quick-action" href="#/materi"><span>▧</span><div><strong>${item.judul}</strong><small>Materi bahasa Arab</small></div><b>→</b></a>`).join('')||'<p class="muted-empty">Belum ada materi.</p>'}</div></section>
      <footer class="workspace-footer">© 2026 Alima App <span>${deployment.mode === 'demo' ? 'Data demonstrasi · Tidak terhubung ke server' : 'Lingkungan produksi'}</span></footer>
    </main></div>`;
  container.querySelector('#btn-logout').addEventListener('click', logout);
}

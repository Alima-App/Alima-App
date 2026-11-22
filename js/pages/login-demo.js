import { DEMO_ACCOUNTS } from '../../dummy-data.js';
import { login } from '../auth.js';

export function renderLogin(container) {
  container.innerHTML = `
    <main class="login-shell">
      <section class="login-brand-panel">
        <div class="brand-lockup"><span class="brand-mark">ع</span><span>Alima</span></div>
        <div class="brand-copy"><span class="eyebrow">LEARNING MANAGEMENT SYSTEM</span><h1>Belajar bahasa Arab, <em>lebih terarah.</em></h1><p>Ruang belajar digital untuk dosen dan mahasiswa mengembangkan pemahaman bahasa Arab.</p></div>
        <div class="arabic-note" lang="ar" dir="rtl">العِلْمُ نُورٌ</div>
        <div class="brand-footer">Alima App · Demo Environment</div>
      </section>
      <section class="login-form-panel">
        <div class="login-card">
          <div class="mobile-brand brand-lockup"><span class="brand-mark">ع</span><span>Alima</span></div>
          <span class="eyebrow">SELAMAT DATANG KEMBALI</span><h2>Masuk ke akunmu</h2><p class="login-subtitle">Gunakan akun demo untuk menjelajahi Alima App.</p>
          <form id="form-auth">
            <label for="input-email">Email</label><input id="input-email" type="email" placeholder="nama@alima.test" autocomplete="username" required />
            <label for="input-password">Password</label><div class="password-wrap"><input id="input-password" type="password" placeholder="Masukkan password" autocomplete="current-password" required /><button type="button" id="toggle-password" aria-label="Tampilkan password">◉</button></div>
            <p id="auth-error" class="error-msg" role="alert"></p><button class="login-submit" id="btn-submit" type="submit">Masuk ke dashboard <span>→</span></button>
          </form>
          <div class="demo-access"><div class="demo-heading"><span>AKUN DEMO</span><span class="demo-pill">OFFLINE</span></div><p>Pilih peran untuk mengisi akun otomatis.</p><div class="demo-buttons"><button type="button" data-demo-role="dosen">Masuk sebagai dosen</button><button type="button" data-demo-role="mahasiswa">Masuk sebagai mahasiswa</button></div><div class="demo-credential" id="demo-credential">Password semua akun: <strong>alima123</strong></div></div>
          <p class="login-footnote">Mode demonstrasi · Data tidak tersimpan ke server.</p>
        </div>
      </section>
    </main>`;

  const email = container.querySelector('#input-email');
  const password = container.querySelector('#input-password');
  const error = container.querySelector('#auth-error');
  const submit = container.querySelector('#btn-submit');
  container.querySelector('#toggle-password').addEventListener('click', () => { password.type = password.type === 'password' ? 'text' : 'password'; });
  container.querySelectorAll('[data-demo-role]').forEach(button => button.addEventListener('click', () => {
    const role = button.dataset.demoRole;
    const account = DEMO_ACCOUNTS.find(item => item.peran === role);
    email.value = account.email; password.value = 'alima123'; error.textContent = '';
    container.querySelectorAll('[data-demo-role]').forEach(item => item.classList.toggle('selected', item === button));
  }));
  container.querySelector('#form-auth').addEventListener('submit', async event => {
    event.preventDefault(); error.textContent = ''; submit.disabled = true; submit.textContent = 'Memeriksa akun…';
    try {
      const result = await login(email.value, password.value);
      if (result.error) throw result.error;
      window.location.hash = result.data.peran === 'dosen' ? '#/dashboard-dosen' : '#/dashboard-mahasiswa';
    } catch (err) { error.textContent = err.message || 'Login gagal.'; submit.disabled = false; submit.innerHTML = 'Masuk ke dashboard <span>→</span>'; }
  });
}

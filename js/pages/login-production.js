import { login, register } from '../auth.js';

export function renderLogin(container, isDaftar = false) {
  container.innerHTML = `
    <main class="auth-wrap"><section class="auth-box">
      <div class="auth-logo">Alima</div><p>Ruang belajar digital bahasa Arab untuk dosen dan mahasiswa.</p>
      <div class="auth-tabs"><button type="button" id="tab-masuk" class="${!isDaftar?'active':''}">Masuk</button><button type="button" id="tab-daftar" class="${isDaftar?'active':''}">Daftar</button></div>
      <form id="form-auth">
        <div id="field-nama" style="display:${isDaftar?'block':'none'}"><label for="input-nama">Nama lengkap</label><input id="input-nama" autocomplete="name" /></div>
        <div id="field-peran" style="display:${isDaftar?'block':'none'}"><label for="input-peran">Daftar sebagai</label><select id="input-peran"><option value="mahasiswa">Mahasiswa</option><option value="dosen">Dosen</option></select></div>
        <label for="input-email">Email</label><input id="input-email" type="email" autocomplete="email" required />
        <label for="input-password">Password</label><input id="input-password" type="password" autocomplete="current-password" minlength="6" required />
        <p id="auth-error" class="error-msg" role="alert"></p><button class="login-submit" id="btn-submit" type="submit">${isDaftar?'Buat akun':'Masuk'}</button>
      </form><p class="login-footnote">Lingkungan produksi · Akun dan data tersimpan melalui Supabase.</p>
    </section></main>`;
  container.querySelector('#tab-masuk').addEventListener('click',()=>{location.hash='#/login';});
  container.querySelector('#tab-daftar').addEventListener('click',()=>{location.hash='#/daftar';});
  container.querySelector('#form-auth').addEventListener('submit',async e=>{
    e.preventDefault(); const btn=container.querySelector('#btn-submit'); const errorEl=container.querySelector('#auth-error');
    btn.disabled=true; errorEl.textContent='Memproses…';
    const email=container.querySelector('#input-email').value.trim(); const password=container.querySelector('#input-password').value;
    try {
      const result=isDaftar ? await register({nama:container.querySelector('#input-nama').value.trim(),email,password,peran:container.querySelector('#input-peran').value}) : await login(email,password);
      if(result.error) throw result.error;
      if(isDaftar && !result.data?.session) { errorEl.textContent='Pendaftaran berhasil. Periksa email untuk konfirmasi sebelum masuk.'; btn.disabled=false; return; }
      location.hash='#/dashboard';
    } catch(err) { errorEl.textContent=err.message || 'Tidak dapat memproses akun.'; btn.disabled=false; }
  });
}

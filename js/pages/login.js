import { supabase } from '../supabase.js';
import { navigate } from '../router.js';

export function renderLogin(container, isDaftar = false) {
  container.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-box">
        <div class="auth-logo">Alima</div>
        <div class="auth-tabs">
          <button class="${!isDaftar ? 'active' : ''}" id="tab-masuk">Masuk</button>
          <button class="${isDaftar ? 'active' : ''}" id="tab-daftar">Daftar</button>
        </div>

        <form id="form-auth">
          <div id="field-nama" style="display:${isDaftar ? 'block' : 'none'}">
            <label>Nama lengkap</label>
            <input type="text" id="input-nama" placeholder="Nama lengkap" />
          </div>
          <div id="field-peran" style="display:${isDaftar ? 'block' : 'none'}">
            <label>Daftar sebagai</label>
            <select id="input-peran">
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
            </select>
          </div>
          <div>
            <label>Email</label>
            <input type="email" id="input-email" placeholder="email@contoh.com" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" id="input-password" placeholder="Password" required />
          </div>
          <p id="auth-error" class="error-msg"></p>
          <button type="submit" id="btn-submit">
            ${isDaftar ? 'Buat Akun' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  `;

  let mode = isDaftar ? 'daftar' : 'masuk';

  document.getElementById('tab-masuk').addEventListener('click', () => {
    window.location.hash = '#/login';
  });
  document.getElementById('tab-daftar').addEventListener('click', () => {
    window.location.hash = '#/daftar';
  });

  document.getElementById('form-auth').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('input-email').value.trim();
    const password = document.getElementById('input-password').value;
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Memproses...';
    errEl.textContent = '';

    if (mode === 'daftar') {
      const nama = document.getElementById('input-nama').value.trim();
      const peran = document.getElementById('input-peran').value;
      if (!nama) { errEl.textContent = 'Nama tidak boleh kosong.'; btn.disabled = false; btn.textContent = 'Buat Akun'; return; }
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { nama, peran } }
      });
      if (error) { errEl.textContent = error.message; btn.disabled = false; btn.textContent = 'Buat Akun'; return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { errEl.textContent = 'Email atau password salah.'; btn.disabled = false; btn.textContent = 'Masuk'; return; }
    }

    await navigate();
  });
}

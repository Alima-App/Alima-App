import { deployment } from './deployment-config.js';
import { getProfile } from './auth.js';

const app=document.getElementById('app'); let navigating=false;
export async function navigate() {
 if(navigating)return; navigating=true;
 try {
  const hash=location.hash||'#/login'; const profile=await getProfile();
  if(hash==='#/login'||hash==='#/'||hash==='#/daftar') {
   if(profile){location.hash=profile.peran==='dosen'?'#/dashboard-dosen':'#/dashboard-mahasiswa';return;}
   if(deployment.mode==='demo'){const {renderLogin}=await import('./pages/login-demo.js');renderLogin(app);}
   else {const {renderLogin}=await import('./pages/login-production.js');renderLogin(app,hash==='#/daftar');}
   return;
  }
  if(!profile){location.hash='#/login';return;}
  if(hash.startsWith('#/dashboard')) {
   if(deployment.mode==='demo') { const page=profile.peran==='dosen' ? await import('./pages/dashboard-dosen.js') : await import('./pages/dashboard-mahasiswa.js'); (profile.peran==='dosen' ? page.renderDashboardDosen : page.renderDashboardMahasiswa)(app,profile); }
   else { const page=await import('./pages/dashboard-production.js'); page.renderDashboardProduction(app,profile); }
   return;
  }
  if(hash.startsWith('#/kelas')){if(deployment.mode==='demo'){showDemoPlaceholder();}else {const page=await import('./pages/kelas.js');await page.renderKelas(app);}return;}
  if(hash.startsWith('#/materi')){if(deployment.mode==='demo'){showDemoPlaceholder();}else {const page=await import('./js/materi.js');await page.renderMateri(app);}return;}
  showDemoPlaceholder();
 } catch(error) { app.innerHTML=`<main class="preview-page"><div class="preview-card"><h1>Aplikasi tidak dapat dimuat</h1><p>${escapeHtml(error.message||error)}</p><button class="login-submit" id="retry">Coba lagi</button></div></main>`;app.querySelector('#retry')?.addEventListener('click',()=>location.reload()); }
 finally {navigating=false;}
}
function showDemoPlaceholder(){app.innerHTML='<main class="preview-page"><a href="#/dashboard">← Kembali ke dashboard</a><div class="preview-card"><span class="eyebrow">DEMO PREVIEW</span><h1>Fitur sedang disiapkan</h1><p>Halaman ini belum tersedia pada dataset demonstrasi.</p></div></main>'; }
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
window.addEventListener('hashchange',navigate);

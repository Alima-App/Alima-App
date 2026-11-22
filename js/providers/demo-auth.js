import { demoLogin, demoLogout, getDemoProfile } from '../../dummy-data.js';
export async function getSession() {
  const profile = getDemoProfile();
  return profile ? { user: { id: profile.id, email: profile.email } } : null;
}
export async function getProfile() { return getDemoProfile(); }
export async function login(email, password) { return demoLogin(email, password); }
export async function register() { return { error: { message: 'Pendaftaran akun tidak tersedia di lingkungan demo.' } }; }
export async function logout() { demoLogout(); window.location.hash = '#/login'; }

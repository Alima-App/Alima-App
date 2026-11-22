import { USE_DUMMY, demoLogin, demoLogout, getDemoProfile } from '../dummy-data.js';

export async function getSession() {
  if (!USE_DUMMY) throw new Error('Mode demo dinonaktifkan.');
  const profile = getDemoProfile();
  return profile ? { user: { id: profile.id, email: profile.email } } : null;
}

export async function getProfile() {
  if (!USE_DUMMY) return null;
  return getDemoProfile();
}

export async function login(email, password) {
  if (!USE_DUMMY) return { data: null, error: { message: 'Mode demo tidak aktif.' } };
  return demoLogin(email, password);
}

export async function logout() {
  demoLogout();
  window.location.hash = '#/login';
}

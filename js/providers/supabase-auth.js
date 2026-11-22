import { supabase } from './supabase-client.js';
let profileCache = null;
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
export async function getProfile() {
  if (profileCache) return profileCache;
  const session = await getSession();
  if (!session) return null;
  const cacheKey = `alima_profile_${session.user.id}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) { try { profileCache = JSON.parse(cached); return profileCache; } catch { localStorage.removeItem(cacheKey); } }
  const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  if (error) throw error;
  profileCache = data;
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return profileCache;
}
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}
export async function register({ nama, email, password, peran }) {
  return await supabase.auth.signUp({ email, password, options: { data: { nama, peran } } });
}
export async function logout() {
  const session = await getSession();
  if (session) localStorage.removeItem(`alima_profile_${session.user.id}`);
  profileCache = null;
  await supabase.auth.signOut();
  window.location.hash = '#/login';
}
supabase.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') profileCache = null; });

import { supabase } from './supabase.js';

// Cache session di memori supaya tidak request ulang tiap halaman
let _sessionCache = null;
let _profileCache = null;

export async function getSession() {
  if (_sessionCache) return _sessionCache;
  const { data } = await supabase.auth.getSession();
  _sessionCache = data.session;
  return _sessionCache;
}

export async function getProfile() {
  if (_profileCache) return _profileCache;
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  _profileCache = data;
  return _profileCache;
}

export async function logout() {
  _sessionCache = null;
  _profileCache = null;
  await supabase.auth.signOut();
  window.location.hash = '#/login';
}

// Reset cache kalau session berubah (login/logout)
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
    _sessionCache = null;
    _profileCache = null;
  }
});

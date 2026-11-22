import { supabase } from './supabase.js';

let _profileCache = null;
let _profileUserId = null;

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile() {
  const session = await getSession();
  if (!session) {
    _profileCache = null;
    _profileUserId = null;
    return null;
  }

  const userId = session.user.id;
  if (_profileCache && _profileUserId === userId) return _profileCache;

  const cacheKey = 'alima_profile_' + userId;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.id === userId && parsed?.peran) {
        _profileCache = parsed;
        _profileUserId = userId;
        return parsed;
      }
    } catch (_) {
      localStorage.removeItem(cacheKey);
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id,nama,email,peran')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  _profileCache = data;
  _profileUserId = userId;
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}

export async function logout() {
  const session = await getSession();
  if (session) localStorage.removeItem('alima_profile_' + session.user.id);
  _profileCache = null;
  _profileUserId = null;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.hash = '#/login';
}

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    _profileCache = null;
    _profileUserId = null;
  }
});

import { supabase } from './supabase.js';

let _profileCache = null;

export async function getSession() {
  // Supabase sudah otomatis cache session di localStorage,
  // jadi getSession() lokal hampir 0ms jika sudah login sebelumnya
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile() {
  if (_profileCache) return _profileCache;

  const session = await getSession();
  if (!session) return null;

  // Coba ambil dari localStorage dulu
  const cacheKey = 'alima_profile_' + session.user.id;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      _profileCache = JSON.parse(cached);
      return _profileCache;
    } catch(e) {}
  }

  // Kalau tidak ada, fetch dari DB
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (data) {
    _profileCache = data;
    localStorage.setItem(cacheKey, JSON.stringify(data));
  }

  return _profileCache;
}

export async function logout() {
  // Bersihkan cache saat logout
  const session = await getSession();
  if (session) {
    localStorage.removeItem('alima_profile_' + session.user.id);
  }
  _profileCache = null;
  await supabase.auth.signOut();
  window.location.hash = '#/login';
}

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    _profileCache = null;
  }
});

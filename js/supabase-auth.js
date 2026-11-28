import { supabase } from './supabase-client.js';

// Cache profil: dipakai agar tidak query setiap pindah halaman.
// Kedaluwarsa setelah 10 menit supaya perubahan peran di database ikut terbaca.
// Cache hanya mempengaruhi tampilan UI; otorisasi sebenarnya tetap ditegakkan RLS.
const PROFILE_TTL_MS = 10 * 60 * 1000;
let profileCache = null; // { userId, data, savedAt }

function cacheKeyFor(userId) {
  return `alima_profile_${userId}`;
}

function readStoredProfile(userId) {
  const key = cacheKeyFor(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const fresh = parsed
      && parsed.data
      && parsed.data.id === userId
      && Number.isFinite(parsed.savedAt)
      && Date.now() - parsed.savedAt < PROFILE_TTL_MS;
    if (fresh) return parsed;
  } catch { /* cache rusak atau format lama: dihapus di bawah */ }
  try { localStorage.removeItem(key); } catch { /* storage tidak tersedia */ }
  return null;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile() {
  const session = await getSession();
  if (!session) { profileCache = null; return null; }

  const userId = session.user.id;
  const now = Date.now();

  if (profileCache && profileCache.userId === userId && now - profileCache.savedAt < PROFILE_TTL_MS) {
    return profileCache.data;
  }

  const stored = readStoredProfile(userId);
  if (stored) {
    profileCache = { userId, data: stored.data, savedAt: stored.savedAt };
    return stored.data;
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;

  profileCache = { userId, data, savedAt: now };
  try { localStorage.setItem(cacheKeyFor(userId), JSON.stringify({ data, savedAt: now })); } catch { /* abaikan */ }
  return data;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Peran TIDAK dikirim dari klien: database selalu membuat akun baru sebagai
// 'mahasiswa' (lihat migrasi 20261122163000). Akun dosen dibuat/diubah admin.
export async function register({ nama, email, password }) {
  return await supabase.auth.signUp({ email, password, options: { data: { nama } } });
}

export async function logout() {
  const session = await getSession();
  if (session) {
    try { localStorage.removeItem(cacheKeyFor(session.user.id)); } catch { /* abaikan */ }
  }
  profileCache = null;
  await supabase.auth.signOut();
  window.location.hash = '#/login';
}

supabase.auth.onAuthStateChange(event => {
  if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') profileCache = null;
});

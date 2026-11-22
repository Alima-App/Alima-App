import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Konfigurasi Supabase belum tersedia. Periksa GitHub Actions Repository Secrets.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

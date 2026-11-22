import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';
import { deployment } from '../deployment-config.js';

if (deployment.mode !== 'production') {
  throw new Error('Supabase hanya boleh diinisialisasi pada deployment produksi.');
}
if (!deployment.supabaseUrl || !deployment.supabaseAnonKey) {
  throw new Error('Konfigurasi Supabase produksi belum lengkap. Periksa GitHub Environment variables.');
}
export const supabase = createClient(deployment.supabaseUrl, deployment.supabaseAnonKey);

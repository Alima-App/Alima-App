import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';

const SUPABASE_URL = 'secrets.SUPABASE_URL'; // ganti dengan URL-mu
const SUPABASE_KEY = 'secrets.SUPABASE_KEY'; // ganti dengan anon key-mu

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

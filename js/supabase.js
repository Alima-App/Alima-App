import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';

const SUPABASE_URL = 'https://ngrwayktygwewagodfmi.supabase.co'; // ganti dengan URL-mu
const SUPABASE_KEY = 'sb_publishable_OlWly1qy3WUh2UEgEnKbCQ_DZPvWS7m'; // ganti dengan anon key-mu

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

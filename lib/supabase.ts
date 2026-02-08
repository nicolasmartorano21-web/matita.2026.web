
import { createClient } from '@supabase/supabase-js';

// Credenciales del proyecto jjgvfzaxcxfgyziikybd
const supabaseUrl = 'https://jjgvfzaxcxfgyziikybd.supabase.co';
const supabaseAnonKey = 'sb_publishable_hNWUKMZrLljdMaVN8NgWcw_b9UR3nVS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

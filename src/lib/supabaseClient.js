import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let warnedMissingEnv = false;

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function warnMissingSupabaseEnvOnce() {
  if (warnedMissingEnv || hasSupabaseEnv()) {
    return;
  }

  warnedMissingEnv = true;
  console.warn(
    '[analytics] Supabase logging disabled: missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = hasSupabaseEnv()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

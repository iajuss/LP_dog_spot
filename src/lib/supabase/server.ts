import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseServiceKey, getSupabaseUrl } from "./env";

export function getSupabaseServer() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function getSupabasePublic() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

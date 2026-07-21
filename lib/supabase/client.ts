import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Browser-safe Supabase client (anon key, RLS-enforced). Singleton so we don't
 * spin up multiple GoTrue instances. Returns null when Supabase isn't
 * configured, so callers can fall back gracefully. Reserved for end-user auth
 * flows; current data reads go through the server API routes.
 */
export function getBrowserSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;
  browserClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  hasServiceRole,
  isSupabaseConfigured,
} from "./env";

/**
 * Server-only Supabase clients. Never import this from a client component —
 * the service-role key must stay on the server.
 */

/**
 * Admin client using the service-role key. Bypasses RLS, so it is used for the
 * app's server-side data fetching until end-user auth is in place. Returns null
 * when no service-role key is configured.
 */
export function createAdminClient(): SupabaseClient<Database> | null {
  if (!hasServiceRole()) return null;
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Anon server client (RLS-enforced). For future request-scoped, authenticated
 * queries. Returns null when Supabase isn't configured.
 */
export function createServerAnonClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

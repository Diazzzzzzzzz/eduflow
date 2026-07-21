/**
 * Centralized Supabase environment access + validation.
 *
 * NEXT_PUBLIC_* vars are inlined into the client bundle at build time and are
 * safe to expose. SUPABASE_SERVICE_ROLE_KEY is server-only — it must never be
 * imported into a client component (only `server.ts` reads it).
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** True when the public URL + anon key are present (browser-capable config). */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * True when a service-role key is available server-side. The app fetches data
 * through the service role (bypassing RLS) until end-user auth is wired, so
 * this gate decides whether we read the database or fall back to mock data.
 */
export function hasServiceRole(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

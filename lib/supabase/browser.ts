"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

let client: SupabaseClient | null = null;

/**
 * Cookie-based browser Supabase client for auth (sign in/up/out). Singleton so
 * the session cookie is shared across the app.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (client) return client;
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let client: SupabaseClient | null = null;

/**
 * Cookie-based browser Supabase client for auth (sign in/up/out). Singleton so
 * the session cookie is shared across the app. Callers should check
 * `isSupabaseConfigured()` first; when unset we still return a client (so the
 * call fails fast/clearly) but warn loudly.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (client) return client;
  if (!isSupabaseConfigured()) {
    console.warn(
      "Supabase не настроен: проверьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

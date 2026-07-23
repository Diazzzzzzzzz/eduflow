import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Request-scoped, cookie-based Supabase client for server components / route
 * handlers. Session refresh + cookie writes happen in middleware, so setAll is
 * best-effort here (server components can't always write cookies).
 */
export function createServerSupabase(): SupabaseClient {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a server component — ignore (middleware handles it).
        }
      },
    },
  });
}

export interface Profile {
  id: string;
  role: "teacher" | "student" | "parent";
  full_name: string;
  student_id: string | null;
}

/** The authenticated user + their profile, or null when signed out. */
export async function getUserProfile(): Promise<{
  user: { id: string; email: string | null };
  profile: Profile | null;
} | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, student_id")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: (profile as Profile) ?? null,
  };
}

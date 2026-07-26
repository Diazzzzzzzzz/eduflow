import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";
import { DEMO_COOKIE, demoSession, isDemoRole } from "@/lib/demo-session";
import type { Role } from "@/lib/auth-routes";

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
  role: Role;
  full_name: string;
  student_id: string | null;
}

/** The authenticated user + their profile, or null when signed out. */
export async function getUserProfile(): Promise<{
  user: { id: string; email: string | null };
  profile: Profile | null;
} | null> {
  let user: User | null = null;

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabase();
    // Guard against a hung network call (e.g. Supabase down) so the layout
    // can't spin forever — fall through to the demo session or /login.
    const timeout = new Promise<{ data: { user: User | null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 8000)
    );
    const {
      data: { user: authUser },
    } = await Promise.race([supabase.auth.getUser(), timeout]);
    user = authUser;

    if (user) {
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
  }

  // No real session — honor a local demo cookie if present.
  const demoRole = cookies().get(DEMO_COOKIE)?.value;
  if (isDemoRole(demoRole)) return demoSession(demoRole);

  return null;
}

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";
import { DEMO_COOKIE, demoSession, isDemoRole, isDemoEnabled } from "@/lib/demo-session";
import type { Role } from "@/lib/auth-routes";
import type { Database } from "./types";

/**
 * Request-scoped, cookie-based Supabase client for server components / route
 * handlers. Session refresh + cookie writes happen in middleware, so setAll is
 * best-effort here (server components can't always write cookies).
 */
export function createServerSupabase(): SupabaseClient<Database> {
  const cookieStore = cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

/**
 * Request-scoped client that runs UNDER THE USER'S SESSION, so Postgres RLS
 * decides what each query can see. This is the intended read path for
 * per-user data: the policies in migration 0011 do the enforcement, and the
 * server code cannot accidentally widen it. Returns null when Supabase is
 * unconfigured (callers fall back to mock data).
 *
 * Contrast with createAdminClient() in ./server, which uses the service-role
 * key and BYPASSES RLS — reserved for seeds and key-bearing content.
 */
export function createRlsClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  return createServerSupabase();
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
        profile: (profile as unknown as Profile) ?? null,
      };
    }
  }

  // No real session — honor a local demo cookie ONLY when demo mode is on.
  // In production (flag off) the cookie is ignored entirely, so the demo
  // bypass cannot be used to reach real data.
  if (isDemoEnabled()) {
    const demoRole = cookies().get(DEMO_COOKIE)?.value;
    if (isDemoRole(demoRole)) return demoSession(demoRole);
  }

  return null;
}

export interface Session {
  user: { id: string; email: string | null };
  profile: Profile | null;
}

/**
 * Guard for route handlers: returns the session or a 401 payload. Every
 * protected endpoint starts with this, so "who is the caller" is decided on
 * the server from the cookie — never from the request body.
 */
export async function requireSession(): Promise<
  { session: Session } | { error: string; status: 401 }
> {
  const session = await getUserProfile();
  if (!session) return { error: "Требуется вход.", status: 401 };
  return { session };
}

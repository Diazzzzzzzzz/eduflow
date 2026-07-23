import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isProtectedPath, roleHome } from "@/lib/auth-routes";
import { DEMO_COOKIE, isDemoRole } from "@/lib/demo-session";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // Local demo fallback session (set when Supabase Auth is unreachable).
  const demoRole = request.cookies.get(DEMO_COOKIE)?.value;
  const hasDemo = isDemoRole(demoRole);

  let user: { user_metadata?: { role?: string } } | null = null;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const authed = !!user || hasDemo;
  const role = user
    ? (user.user_metadata?.role as string | undefined) ?? "student"
    : hasDemo
      ? (demoRole as string)
      : "student";

  if (path === "/") {
    return NextResponse.redirect(
      new URL(authed ? roleHome(role) : "/login", request.url)
    );
  }

  if (isProtectedPath(path) && !authed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((path === "/login" || path === "/register") && authed) {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  // Role isolation: each area belongs to one role. A teacher can't enter the
  // Student practice workspace, etc. — send them to their own dashboard.
  if (authed) {
    const areas: Array<[string, string]> = [
      ["/teacher", "teacher"],
      ["/student", "student"],
      ["/parent", "parent"],
    ];
    for (const [prefix, requiredRole] of areas) {
      if (
        (path === prefix || path.startsWith(`${prefix}/`)) &&
        role !== requiredRole
      ) {
        return NextResponse.redirect(new URL(roleHome(role), request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

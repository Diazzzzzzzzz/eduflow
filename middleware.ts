import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isProtectedPath, roleHome } from "@/lib/auth-routes";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // No Supabase config → don't guard (keeps local dev / previews working).
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return response;

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const role = (user?.user_metadata?.role as string | undefined) ?? "student";

  // Root: send to dashboard or login.
  if (path === "/") {
    return NextResponse.redirect(
      new URL(user ? roleHome(role) : "/login", request.url)
    );
  }

  // Protected pages require a session.
  if (isProtectedPath(path) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Signed-in users shouldn't see auth pages.
  if ((path === "/login" || path === "/register") && user) {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  return response;
}

export const config = {
  // Run on everything except static assets and API routes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isSelfAssignableRole, roleHome } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/** A brand-new account, for the purpose of honouring a requested role. */
const NEW_ACCOUNT_WINDOW_MS = 2 * 60 * 1000;

/** Supabase reports these in English; the sign-in page speaks Russian. */
function ruError(message: string): string {
  // Both spellings mean the same thing: the PKCE state no longer matches.
  if (/code verifier|flow state/i.test(message))
    return "Вход не завершён: сессия начата в другом браузере или данные были очищены. Попробуйте ещё раз.";
  if (/provider is not enabled/i.test(message))
    return "Вход через Google не включён в настройках Supabase.";
  if (/access.?denied|cancel/i.test(message))
    return "Вход через Google отменён.";
  if (/expired|invalid.*code/i.test(message))
    return "Ссылка входа устарела. Попробуйте ещё раз.";
  return message;
}

/**
 * GET /auth/callback — the OAuth return leg.
 *
 * Supabase's browser client uses PKCE, so the provider sends the user back
 * here with a one-time `code` that has to be exchanged for a session. The
 * exchange happens in a route handler rather than a server component because
 * only a route handler can write the session cookies.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const fail = (message: string) =>
    NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(ruError(message))}`, url.origin)
    );

  // The provider reports a refusal (user cancelled, app not approved) in the
  // query string rather than by failing the request.
  const providerError =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) return fail(providerError);

  const code = url.searchParams.get("code");
  if (!code) return fail("Не получен код авторизации от Google.");
  if (!isSupabaseConfigured()) return fail("Supabase не настроен.");

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error("OAuth exchange failed:", error);
    return fail(error?.message ?? "Не удалось завершить вход через Google.");
  }

  const user = data.user;
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileRow as { role?: string } | null;
  let role =
    profile?.role ?? (user.user_metadata?.role as string | undefined) ?? "student";

  // The sign-up page carries the role the visitor chose through the redirect.
  // It is applied only to an account created moments ago, and only for roles
  // the sign-up form itself offers, so an existing user cannot promote
  // themselves by editing the URL.
  const requested = url.searchParams.get("role");
  const createdAt = user.created_at ? Date.parse(user.created_at) : NaN;
  const isNewAccount =
    Number.isFinite(createdAt) && Date.now() - createdAt < NEW_ACCOUNT_WINDOW_MS;

  if (
    requested &&
    requested !== role &&
    isSelfAssignableRole(requested) &&
    isNewAccount
  ) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: requested } as never)
      .eq("id", user.id);
    if (updateError) {
      // Not fatal — the account exists and can sign in as the default role.
      console.error("Could not apply requested role:", updateError);
    } else {
      role = requested;
    }
  }

  return NextResponse.redirect(new URL(roleHome(role), url.origin));
}

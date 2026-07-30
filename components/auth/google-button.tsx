"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/auth-routes";

/** Google's four-colour mark. Inline so the strict CSP never has to fetch it. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/**
 * Starts the Google OAuth flow.
 *
 * `role` is only meaningful on the sign-up page: it rides along in the
 * callback URL and is applied to accounts created by that first sign-in.
 * On success the browser leaves for Google, so there is no "done" state.
 */
export function GoogleButton({
  role,
  label = "Продолжить с Google",
  onError,
}: {
  role?: Role;
  label?: string;
  onError?: (message: string) => void;
}) {
  const [loading, setLoading] = React.useState(false);

  async function onClick() {
    if (!isSupabaseConfigured()) {
      onError?.("Supabase не настроен — вход через Google недоступен.");
      return;
    }
    setLoading(true);
    try {
      const callback = new URL("/auth/callback", window.location.origin);
      if (role) callback.searchParams.set("role", role);

      const { error } = await getSupabaseBrowser().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (error) {
        console.error("Google OAuth error:", error);
        onError?.(
          /provider is not enabled/i.test(error.message)
            ? "Вход через Google не включён в настройках Supabase."
            : error.message
        );
        setLoading(false);
      }
      // On success the page navigates away to Google — keep the spinner.
    } catch (err) {
      console.error("Google OAuth exception:", err);
      onError?.("Не удалось открыть окно Google. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="animate-spin" /> : <GoogleMark />}
      {label}
    </Button>
  );
}

/** "или" rule used to separate the OAuth button from the email form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        или
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

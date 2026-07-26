"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  Loader2,
  School,
  TriangleAlert,
  Users,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { roleHome, type Role } from "@/lib/auth-routes";
import { DEMO_COOKIE } from "@/lib/demo-session";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_PASSWORD = "demo123456";
const AUTH_TIMEOUT_MS = 10_000;

const DEMOS = [
  { role: "admin", email: "admin@eduflow.kz", label: "Войти как Директор", icon: Building2 },
  { role: "teacher", email: "teacher@eduflow.kz", label: "Войти как Учитель", icon: School },
  { role: "student", email: "student@eduflow.kz", label: "Войти как Студент", icon: GraduationCap },
  { role: "parent", email: "parent@eduflow.kz", label: "Войти как Родитель", icon: Users },
] as const satisfies ReadonlyArray<{
  role: Role;
  email: string;
  label: string;
  icon: typeof School;
}>;

function ruError(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "Неверный email или пароль.";
  if (/email not confirmed/i.test(message))
    return "Email не подтверждён. Проверьте почту.";
  if (/timeout/i.test(message))
    return "Превышено время ожидания ответа сервера.";
  return message;
}

/** Reject after `ms` so a hung network call can't spin forever. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

function goTo(path: string) {
  // Hard navigation so freshly-set auth cookies reach the server on the next
  // request (avoids a soft-nav loop back to /login).
  window.location.assign(path);
}

function setDemoCookie(role: Role) {
  document.cookie = `${DEMO_COOKIE}=${role}; path=/; max-age=28800; samesite=lax`;
}

interface SignInOutcome {
  ok: boolean;
  role?: string;
  error?: string;
}

async function attemptSignIn(
  email: string,
  password: string
): Promise<SignInOutcome> {
  if (!isSupabaseConfigured()) {
    console.error("Supabase не настроен: отсутствуют NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY");
    return { ok: false, error: "Supabase не настроен." };
  }
  try {
    const { data, error } = await withTimeout(
      getSupabaseBrowser().auth.signInWithPassword({ email, password }),
      AUTH_TIMEOUT_MS
    );
    if (error) {
      console.error("Supabase auth error:", error);
      return { ok: false, error: ruError(error.message) };
    }
    return { ok: true, role: (data.user?.user_metadata?.role as string) ?? "student" };
  } catch (err) {
    console.error("Supabase auth exception/timeout:", err);
    return { ok: false, error: ruError((err as Error).message) };
  }
}

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("form");
    const res = await attemptSignIn(email, password);
    if (res.ok) {
      goTo(roleHome(res.role));
      return; // page unloads
    }
    setError(res.error ?? "Не удалось войти.");
    setLoading(null);
  }

  async function onDemo(role: Role, demoEmail: string) {
    setError(null);
    setLoading(role);
    const res = await attemptSignIn(demoEmail, DEMO_PASSWORD);
    if (res.ok) {
      goTo(roleHome(res.role ?? role));
      return;
    }
    // Fallback: keep the app usable via a local demo session.
    console.warn("Demo fallback (local session):", res.error);
    setDemoCookie(role);
    goTo(roleHome(role));
  }

  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="flex justify-center">
        <Logo />
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">Вход</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Войдите в аккаунт вашего центра.
            </p>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@center.kz"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-sm text-destructive"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!!loading}>
              {loading === "form" ? (
                <>
                  <Loader2 className="animate-spin" /> Вход…
                </>
              ) : (
                "Войти"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Регистрация
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Demo one-click login (with local fallback) */}
      <Card>
        <CardContent className="space-y-3 p-6">
          <div>
            <p className="text-sm font-medium">Быстрый демо-вход</p>
            <p className="text-xs text-muted-foreground">
              Попробуйте платформу в одной из трёх ролей.
            </p>
          </div>
          <div className="space-y-2">
            {DEMOS.map((d) => (
              <Button
                key={d.role}
                variant="outline"
                className="w-full justify-start"
                disabled={!!loading}
                onClick={() => onDemo(d.role, d.email)}
              >
                {loading === d.role ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <d.icon />
                )}
                {d.label}
              </Button>
            ))}
          </div>
          <p className="tabular text-center text-xs text-muted-foreground">
            Пароль демо-аккаунтов: demo123456
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

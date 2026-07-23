"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, School, Users } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { roleHome } from "@/lib/auth-routes";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_PASSWORD = "demo123456";
const DEMOS = [
  { key: "teacher", email: "teacher@eduflow.kz", label: "Войти как Учитель", icon: School },
  { key: "student", email: "student@eduflow.kz", label: "Войти как Студент", icon: GraduationCap },
  { key: "parent", email: "parent@eduflow.kz", label: "Войти как Родитель", icon: Users },
] as const;

function ruError(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "Неверный email или пароль.";
  if (/email not confirmed/i.test(message))
    return "Email не подтверждён. Проверьте почту.";
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<string | null>(null);

  async function signIn(em: string, pw: string, key: string) {
    setError(null);
    setLoading(key);
    const { data, error } = await getSupabaseBrowser().auth.signInWithPassword({
      email: em,
      password: pw,
    });
    if (error) {
      setError(ruError(error.message));
      setLoading(null);
      return;
    }
    const role = (data.user?.user_metadata?.role as string) ?? "student";
    router.push(roleHome(role));
    router.refresh();
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

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              signIn(email, password, "form");
            }}
          >
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
            {error && <p className="text-sm text-destructive">{error}</p>}
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

      {/* Demo one-click login */}
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
                key={d.key}
                variant="outline"
                className="w-full justify-start"
                disabled={!!loading}
                onClick={() => signIn(d.email, DEMO_PASSWORD, d.key)}
              >
                {loading === d.key ? (
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

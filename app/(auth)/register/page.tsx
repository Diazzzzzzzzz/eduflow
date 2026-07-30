"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { roleHome, type Role } from "@/lib/auth-routes";
import { Logo } from "@/components/layout/logo";
import { AuthDivider, GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ROLES: { value: Role; label: string }[] = [
  { value: "student", label: "Студент" },
  { value: "teacher", label: "Учитель" },
  { value: "parent", label: "Родитель" },
];

const ROLE_LABELS = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label])
) as Record<Role, string>;

export default function RegisterPage() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Role>("student");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase не настроен. Регистрация недоступна.");
      return;
    }
    setLoading(true);
    try {
      const signUp = getSupabaseBrowser().auth.signUp({
        email,
        password,
        options: { data: { role, full_name: fullName } },
      });
      const { data, error } = await Promise.race([
        signUp,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 10_000)
        ),
      ]);
      if (error) {
        console.error("Supabase sign-up error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        window.location.assign(roleHome(role));
        return;
      }
      setNotice(
        "Аккаунт создан. Подтвердите email по ссылке из письма, затем войдите."
      );
      setLoading(false);
    } catch (err) {
      console.error("Supabase sign-up exception/timeout:", err);
      setError("Превышено время ожидания ответа сервера. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="flex justify-center">
        <Logo />
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">
              Регистрация
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Создайте аккаунт и выберите роль.
            </p>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Имя</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Дана Искакова"
                required
              />
            </div>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Роль</Label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                      role === r.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "bg-card text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Создание…
                </>
              ) : (
                "Создать аккаунт"
              )}
            </Button>
          </form>

          {/* Shared by both flows, so it sits outside the email form. */}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && (
            <p className="rounded-md border border-primary/25 bg-primary/5 p-2.5 text-sm text-foreground">
              {notice}
            </p>
          )}

          <AuthDivider />

          {/* Names the selected role, because the picker sits above and the
              choice is carried through the Google redirect. */}
          <GoogleButton
            role={role}
            label={`Продолжить с Google как ${ROLE_LABELS[role]}`}
            onError={setError}
          />

          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

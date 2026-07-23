"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export interface MenuUser {
  email: string;
  role: "teacher" | "student" | "parent";
  fullName: string;
}

const ROLE_LABEL: Record<MenuUser["role"], string> = {
  teacher: "Учитель",
  student: "Студент",
  parent: "Родитель",
};

function initialsFrom(user: MenuUser): string {
  const base = user.fullName || user.email;
  const parts = base.trim().split(/\s+/);
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return letters.toUpperCase();
}

export function UserMenu({ user }: { user: MenuUser }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    await getSupabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative ml-1.5" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Меню пользователя"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/30 transition-shadow hover:ring-primary/50"
      >
        {initialsFrom(user)}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-xl border bg-card shadow-raised",
            "animate-fade-up"
          )}
        >
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium">
              {user.fullName || "Пользователь"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <span className="mt-1.5 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {ROLE_LABEL[user.role]}
            </span>
          </div>
          <button
            role="menuitem"
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Выход…" : "Выйти"}
          </button>
        </div>
      )}
    </div>
  );
}

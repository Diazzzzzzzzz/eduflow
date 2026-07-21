"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/teacher", label: "Учитель", icon: LayoutDashboard },
  { href: "/student", label: "Студент", icon: GraduationCap },
  { href: "/parent", label: "Родитель", icon: Smartphone },
];

export function RoleSwitcher() {
  const pathname = usePathname();
  return (
    <div
      role="tablist"
      aria-label="Переключить вид панели"
      className="flex items-center gap-1 rounded-lg bg-secondary p-1"
    >
      {ROLES.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            role="tab"
            aria-selected={active}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}

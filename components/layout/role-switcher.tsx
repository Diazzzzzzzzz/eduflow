"use client";

import { GraduationCap, LayoutDashboard, Smartphone } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const ROLES: { id: Role; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "teacher", label: "Teacher", icon: LayoutDashboard },
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "parent", label: "Parent", icon: Smartphone },
];

export function RoleSwitcher() {
  const { role, setRole } = useApp();
  return (
    <div
      role="tablist"
      aria-label="Switch dashboard view"
      className="flex items-center gap-1 rounded-lg bg-secondary p-1"
    >
      {ROLES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={role === id}
          onClick={() => setRole(id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            role === id
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

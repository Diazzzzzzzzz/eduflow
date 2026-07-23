"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/teacher", label: "Обзор" },
  { href: "/groups", label: "Группы" },
];

export function TeacherNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Разделы панели преподавателя"
      className="flex items-center gap-1 border-b animate-fade-up"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/teacher"
            ? pathname === "/teacher"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

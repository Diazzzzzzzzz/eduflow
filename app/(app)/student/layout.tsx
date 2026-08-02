"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { useFocusMode } from "@/components/layout/focus-mode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/student", label: "Обзор" },
  { href: "/student/lessons", label: "Уроки" },
  { href: "/student/practice", label: "Практика" },
  { href: "/student/vocabulary", label: "Словарь" },
  { href: "/student/homework", label: "Домашние задания" },
  { href: "/student/history", label: "История" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { students, activeStudent, activeStudentId, setActiveStudentId } =
    useApp();
  const pathname = usePathname();
  const { focused } = useFocusMode();
  const s = activeStudent;

  // Focus mode (a running test) gets the viewport to itself: the workspace
  // header and tab strip are both chrome and a way out of a timed attempt.
  //
  // Both states share ONE element tree, with the chrome toggled in place.
  // Returning a different tree for focus mode moved `children` to a new
  // position, so React unmounted and remounted it — which tore down the exam
  // session and silently restarted the attempt the moment focus was released.
  return (
    <div className={cn(focused ? "flex min-h-0 flex-1 flex-col" : "space-y-6")}>
      {/* Workspace header: who we're viewing + student picker */}
      {!focused && (
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20">
            {s.initials}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">
              {s.name}
            </h1>
            <p className="text-sm text-muted-foreground">{s.group}</p>
          </div>
        </div>
        <Select value={activeStudentId} onValueChange={setActiveStudentId}>
          <SelectTrigger className="w-60" aria-label="Выбрать студента">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {students.map((st) => (
              <SelectItem key={st.id} value={st.id}>
                {st.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      )}

      {/* Sub-navigation across the student workspace */}
      {!focused && (
      <nav
        aria-label="Разделы рабочего пространства студента"
        className="flex items-center gap-1 border-b"
      >
        {TABS.map((tab) => {
          const active =
            tab.href === "/student"
              ? pathname === "/student"
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
      )}

      {children}
    </div>
  );
}

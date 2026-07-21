"use client";

import * as React from "react";
import type { MockTest, Role, SkillScores, Student } from "@/lib/types";
import { STUDENTS } from "@/lib/mock-data";
import { calcOverall } from "@/lib/band";

const STORAGE_KEY = "ielts-pulse:v1";

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  students: Student[];
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeStudent: Student;
  addMockResult: (
    studentId: string,
    scores: SkillScores,
    label: string,
    date: string
  ) => void;
  /** True when the roster is served from Supabase rather than mock data. */
  dbBacked: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>("teacher");
  const [students, setStudents] = React.useState<Student[]>(STUDENTS);
  const [activeStudentId, setActiveStudentId] = React.useState(STUDENTS[0].id);
  const [theme, setTheme] = React.useState<"dark" | "light">("light");
  const [dbBacked, setDbBacked] = React.useState(false);

  // Track only user-added tests separately for localStorage persistence
  // (used solely in mock mode; the database is the source of truth otherwise).
  const extraRef = React.useRef<Record<string, MockTest[]>>({});

  const persist = React.useCallback(
    (extra: Record<string, MockTest[]>, nextTheme: "dark" | "light") => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ extraTests: extra, theme: nextTheme })
      );
    },
    []
  );

  // On mount: restore theme + local extras, then load the real cohort from the
  // API (Supabase when configured, otherwise the mock cohort) and merge.
  React.useEffect(() => {
    let cancelled = false;

    let extras: Record<string, MockTest[]> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          extraTests?: Record<string, MockTest[]>;
          theme?: "dark" | "light";
        };
        if (saved.extraTests) extras = saved.extraTests;
        if (saved.theme) setTheme(saved.theme);
      }
    } catch {
      // Corrupt storage — start fresh
      localStorage.removeItem(STORAGE_KEY);
    }
    extraRef.current = extras;

    (async () => {
      let base = STUDENTS;
      let isDb = false;
      try {
        const res = await fetch("/api/students");
        if (res.ok) {
          const json = (await res.json()) as {
            students?: Student[];
            source?: "supabase" | "mock";
          };
          if (json.students?.length) base = json.students;
          isDb = json.source === "supabase";
        }
      } catch {
        // Network/API failure — keep the bundled cohort.
      }
      if (cancelled) return;

      // In DB mode the database owns all results; only merge localStorage
      // extras when running on mock data.
      const merged = isDb
        ? base
        : base.map((s) =>
            extras[s.id]?.length
              ? { ...s, mockTests: [...s.mockTests, ...extras[s.id]] }
              : s
          );

      setStudents(merged);
      setDbBacked(isDb);
      setActiveStudentId((prev) =>
        merged.some((s) => s.id === prev) ? prev : merged[0]?.id ?? prev
      );
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const addMockResult = React.useCallback(
    (studentId: string, scores: SkillScores, label: string, date: string) => {
      const test: MockTest = {
        id: `mt-${studentId}-${Date.now()}`,
        date,
        label,
        ...scores,
        overall: calcOverall(scores),
      };

      // Optimistic local update for snappy UX (replaced by the persisted row
      // on the next load when DB-backed).
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, mockTests: [...s.mockTests, test] } : s
        )
      );

      // Persist to the database via the API (no-op server-side without a DB).
      fetch("/api/mock-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, ...scores, label, date }),
      }).catch(() => {
        // Best-effort; the local copy below keeps the UI consistent.
      });

      // Only mirror to localStorage in mock mode.
      if (!dbBacked) {
        extraRef.current = {
          ...extraRef.current,
          [studentId]: [...(extraRef.current[studentId] ?? []), test],
        };
        persist(extraRef.current, theme);
      }
    },
    [persist, theme, dbBacked]
  );

  const toggleTheme = React.useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      persist(extraRef.current, next);
      return next;
    });
  }, [persist]);

  const activeStudent =
    students.find((s) => s.id === activeStudentId) ?? students[0];

  const value: AppState = {
    role,
    setRole,
    students,
    activeStudentId,
    setActiveStudentId,
    activeStudent,
    addMockResult,
    dbBacked,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

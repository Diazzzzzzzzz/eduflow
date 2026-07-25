"use client";

import * as React from "react";
import type { MockTest, SkillScores, Student } from "@/lib/types";
import { calcOverall } from "@/lib/band";

const STORAGE_KEY = "ielts-pulse:v1";

export type RosterStatus = "loading" | "ready" | "error";

interface AppState {
  students: Student[];
  /**
   * Roster load state. `RosterGate` renders a skeleton until this is "ready",
   * so consumers below it can rely on `students` being the real cohort and on
   * `activeStudent` being defined.
   */
  rosterStatus: RosterStatus;
  reloadRoster: () => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeStudent: Student;
  addMockResult: (
    studentId: string,
    scores: SkillScores,
    label: string,
    date: string
  ) => void;
  /** Update a student's teacher note (shown to parents). */
  updateTeacherNote: (studentId: string, note: string) => void;
  /** True when the roster is served from Supabase rather than mock data. */
  dbBacked: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Deliberately empty: seeding this with the bundled cohort made the UI paint
  // the demo roster first and swap it for the real one a moment later, which
  // read as a flicker (8 students in a group, then 2).
  const [students, setStudents] = React.useState<Student[]>([]);
  const [rosterStatus, setRosterStatus] =
    React.useState<RosterStatus>("loading");
  const [activeStudentId, setActiveStudentId] = React.useState("");
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

  // Theme and local extras come from storage and are safe to apply immediately.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          extraTests?: Record<string, MockTest[]>;
          theme?: "dark" | "light";
        };
        extraRef.current = saved.extraTests ?? {};
        if (saved.theme) setTheme(saved.theme);
      }
    } catch {
      // Corrupt storage — start fresh
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Roster load, kept separate so the error state can retry it.
  const cancelledRef = React.useRef(false);

  const loadRoster = React.useCallback(async () => {
    setRosterStatus("loading");
    try {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error(`students: ${res.status}`);
      const json = (await res.json()) as {
        students?: Student[];
        source?: "supabase" | "mock";
      };
      if (cancelledRef.current) return;

      const base = json.students ?? [];
      const isDb = json.source === "supabase";

      // In DB mode the database owns all results; only merge localStorage
      // extras when running on mock data.
      const merged = isDb
        ? base
        : base.map((s) =>
            extraRef.current[s.id]?.length
              ? { ...s, mockTests: [...s.mockTests, ...extraRef.current[s.id]] }
              : s
          );

      setStudents(merged);
      setDbBacked(isDb);
      setActiveStudentId((prev) =>
        merged.some((s) => s.id === prev) ? prev : (merged[0]?.id ?? "")
      );
      setRosterStatus("ready");
    } catch {
      if (cancelledRef.current) return;
      // Falling back to the bundled cohort here would show a roster that is not
      // this centre's — surface the failure instead and offer a retry.
      setStudents([]);
      setRosterStatus("error");
    }
  }, []);

  React.useEffect(() => {
    cancelledRef.current = false;
    void loadRoster();
    return () => {
      cancelledRef.current = true;
    };
  }, [loadRoster]);

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

  const updateTeacherNote = React.useCallback(
    (studentId: string, note: string) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, teacherNote: note } : s))
      );
    },
    []
  );

  const toggleTheme = React.useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      persist(extraRef.current, next);
      return next;
    });
  }, [persist]);

  // Undefined only while the roster is still loading or failed, which is
  // exactly when `RosterGate` renders a placeholder instead of the page.
  const activeStudent =
    students.find((s) => s.id === activeStudentId) ?? students[0];

  const value: AppState = {
    students,
    rosterStatus,
    reloadRoster: () => void loadRoster(),
    activeStudentId,
    setActiveStudentId,
    activeStudent,
    addMockResult,
    updateTeacherNote,
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

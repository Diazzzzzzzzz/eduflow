"use client";

import * as React from "react";
import { useApp } from "@/components/app-provider";
import {
  type AttendanceStatus,
  type Homework,
  type HomeworkSection,
  type Submission,
  type WritingCriteria,
} from "@/lib/group-data";

interface NewHomework {
  groupName: string;
  title: string;
  description: string;
  section: HomeworkSection;
  dueDate: string;
  /** When set, assign only to these students (individual); else the whole group. */
  assignToStudentIds?: string[];
}

export type GroupsStatus = "loading" | "ready" | "error";

interface GroupsState {
  homework: Homework[];
  submissions: Submission[];
  attendance: Record<string, AttendanceStatus>;
  /** Lets screens tell "no homework yet" apart from "still loading". */
  status: GroupsStatus;
  createHomework: (input: NewHomework) => Promise<void>;
  submitHomework: (
    homeworkId: string,
    studentId: string,
    content: string
  ) => Promise<void>;
  gradeSubmission: (
    submissionId: string,
    band: number,
    feedback: string,
    criteria?: WritingCriteria | null
  ) => Promise<void>;
  setAttendance: (studentId: string, date: string, status: AttendanceStatus) => void;
}

const attKey = (studentId: string, date: string) => `${studentId}|${date}`;

const GroupsContext = React.createContext<GroupsState | null>(null);

/**
 * Homework state, backed by the API.
 *
 * Until Stage 3 this held React state seeded from lib/group-data, so every
 * assignment, hand-in and mark was lost on reload. It now reads and writes
 * /api/homework, which is RLS-scoped: a teacher receives their centre's work, a
 * student only what is set for their group plus their own submissions. The
 * mutations re-read the board rather than patching locally, so what the screen
 * shows is what the database actually stored.
 *
 * Attendance is still in-memory — that is Stage 3b, together with the class
 * schedule it needs to hang from.
 */
export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const { students } = useApp();
  const [homework, setHomework] = React.useState<Homework[]>([]);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [status, setStatus] = React.useState<GroupsStatus>("loading");

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/homework", { credentials: "include" });
      if (!res.ok) throw new Error(`homework: ${res.status}`);
      const json = (await res.json()) as {
        homework?: Homework[];
        submissions?: Submission[];
      };
      setHomework(json.homework ?? []);
      setSubmissions(json.submissions ?? []);
      setStatus("ready");
    } catch (err) {
      console.warn("[groups] load failed:", err);
      setHomework([]);
      setSubmissions([]);
      setStatus("error");
    }
  }, []);

  // Re-read once the roster arrives too: the student list identifies which
  // cohort the session belongs to, and the board is scoped to it.
  const rosterKey = students.map((s) => s.id).join(",");
  React.useEffect(() => {
    void load();
  }, [load, rosterKey]);

  const createHomework = React.useCallback(
    async (input: NewHomework) => {
      const res = await fetch("/api/homework", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "" }));
        throw new Error(error || "Не удалось создать задание.");
      }
      await load();
    },
    [load]
  );

  const submitHomework = React.useCallback(
    async (homeworkId: string, _studentId: string, content: string) => {
      // studentId is accepted for call-site compatibility but deliberately not
      // sent: the server takes the author from the session.
      void _studentId;
      const res = await fetch("/api/homework/submissions", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ homeworkId, content }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "" }));
        throw new Error(error || "Не удалось сдать работу.");
      }
      await load();
    },
    [load]
  );

  const gradeSubmission = React.useCallback(
    async (
      submissionId: string,
      band: number,
      feedback: string,
      criteria?: WritingCriteria | null
    ) => {
      const res = await fetch("/api/homework/submissions", {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submissionId,
          band,
          feedback,
          criteria: criteria ?? null,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "" }));
        throw new Error(error || "Не удалось сохранить оценку.");
      }
      await load();
    },
    [load]
  );

  const [attendance, setAttendanceState] = React.useState<
    Record<string, AttendanceStatus>
  >({});
  const setAttendance = React.useCallback(
    (studentId: string, date: string, s: AttendanceStatus) => {
      setAttendanceState((prev) => ({ ...prev, [attKey(studentId, date)]: s }));
    },
    []
  );

  const value: GroupsState = {
    homework,
    submissions,
    attendance,
    status,
    createHomework,
    submitHomework,
    gradeSubmission,
    setAttendance,
  };

  return (
    <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>
  );
}

export function useGroups() {
  const ctx = React.useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups must be used within GroupsProvider");
  return ctx;
}

export const attendanceKey = attKey;

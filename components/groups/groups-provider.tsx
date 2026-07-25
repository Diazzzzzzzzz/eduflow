"use client";

import * as React from "react";
import { useApp } from "@/components/app-provider";
import {
  buildSubmissionSeed,
  HOMEWORK_SEED,
  SUBMISSION_SEED,
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

interface GroupsState {
  homework: Homework[];
  submissions: Submission[];
  attendance: Record<string, AttendanceStatus>;
  createHomework: (input: NewHomework) => void;
  submitHomework: (homeworkId: string, studentId: string, content: string) => void;
  gradeSubmission: (
    submissionId: string,
    band: number,
    feedback: string,
    criteria?: WritingCriteria | null
  ) => void;
  setAttendance: (studentId: string, date: string, status: AttendanceStatus) => void;
}

const attKey = (studentId: string, date: string) => `${studentId}|${date}`;

const GroupsContext = React.createContext<GroupsState | null>(null);

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const { students } = useApp();
  const [homework, setHomework] = React.useState<Homework[]>(HOMEWORK_SEED);
  const [submissions, setSubmissions] =
    React.useState<Submission[]>(SUBMISSION_SEED);

  // The roster arrives from the API after mount and is keyed by database ids,
  // while SUBMISSION_SEED is built from the bundled cohort. Re-seed once the
  // real roster lands, otherwise no student matches and homework disappears.
  const seededFor = React.useRef("");
  React.useEffect(() => {
    const key = students.map((s) => s.id).join(",");
    if (!key || key === seededFor.current) return;
    seededFor.current = key;
    setSubmissions(buildSubmissionSeed(students));
  }, [students]);
  const [attendance, setAttendanceState] = React.useState<
    Record<string, AttendanceStatus>
  >({});

  const createHomework = React.useCallback(
    (input: NewHomework) => {
      const { assignToStudentIds, ...rest } = input;
      const id = `hw-${Date.now()}`;
      const hw: Homework = {
        id,
        ...rest,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setHomework((prev) => [hw, ...prev]);
      // Assign to the named students (individual) or the whole group.
      const targets =
        assignToStudentIds && assignToStudentIds.length
          ? students.filter((s) => assignToStudentIds.includes(s.id))
          : students.filter((s) => s.group === input.groupName);
      const assigned: Submission[] = targets.map((s) => ({
          id: `sub-${id}-${s.id}`,
          homeworkId: id,
          studentId: s.id,
          content: "",
          status: "assigned",
          band: null,
          feedback: null,
          submittedAt: null,
        }));
      setSubmissions((prev) => [...prev, ...assigned]);
    },
    [students]
  );

  const submitHomework = React.useCallback(
    (homeworkId: string, studentId: string, content: string) => {
      setSubmissions((prev) => {
        const existing = prev.find(
          (s) => s.homeworkId === homeworkId && s.studentId === studentId
        );
        const submittedAt = new Date().toISOString().slice(0, 10);
        if (existing) {
          return prev.map((s) =>
            s.id === existing.id
              ? { ...s, content, status: "submitted", submittedAt }
              : s
          );
        }
        return [
          ...prev,
          {
            id: `sub-${homeworkId}-${studentId}`,
            homeworkId,
            studentId,
            content,
            status: "submitted",
            band: null,
            feedback: null,
            submittedAt,
          },
        ];
      });
    },
    []
  );

  const gradeSubmission = React.useCallback(
    (
      submissionId: string,
      band: number,
      feedback: string,
      criteria?: WritingCriteria | null
    ) => {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                status: "graded",
                band,
                feedback,
                criteria: criteria ?? s.criteria ?? null,
              }
            : s
        )
      );
    },
    []
  );

  const setAttendance = React.useCallback(
    (studentId: string, date: string, status: AttendanceStatus) => {
      setAttendanceState((prev) => ({ ...prev, [attKey(studentId, date)]: status }));
    },
    []
  );

  const value: GroupsState = {
    homework,
    submissions,
    attendance,
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

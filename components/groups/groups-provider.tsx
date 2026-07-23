"use client";

import * as React from "react";
import { useApp } from "@/components/app-provider";
import {
  HOMEWORK_SEED,
  SUBMISSION_SEED,
  type AttendanceStatus,
  type Homework,
  type HomeworkSection,
  type Submission,
} from "@/lib/group-data";

interface NewHomework {
  groupName: string;
  title: string;
  description: string;
  section: HomeworkSection;
  dueDate: string;
}

interface GroupsState {
  homework: Homework[];
  submissions: Submission[];
  attendance: Record<string, AttendanceStatus>;
  createHomework: (input: NewHomework) => void;
  submitHomework: (homeworkId: string, studentId: string, content: string) => void;
  gradeSubmission: (submissionId: string, band: number, feedback: string) => void;
  setAttendance: (studentId: string, date: string, status: AttendanceStatus) => void;
}

const attKey = (studentId: string, date: string) => `${studentId}|${date}`;

const GroupsContext = React.createContext<GroupsState | null>(null);

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const { students } = useApp();
  const [homework, setHomework] = React.useState<Homework[]>(HOMEWORK_SEED);
  const [submissions, setSubmissions] =
    React.useState<Submission[]>(SUBMISSION_SEED);
  const [attendance, setAttendanceState] = React.useState<
    Record<string, AttendanceStatus>
  >({});

  const createHomework = React.useCallback(
    (input: NewHomework) => {
      const id = `hw-${Date.now()}`;
      const hw: Homework = {
        id,
        ...input,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setHomework((prev) => [hw, ...prev]);
      // Assign to every student currently in that group.
      const assigned: Submission[] = students
        .filter((s) => s.group === input.groupName)
        .map((s) => ({
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
    (submissionId: string, band: number, feedback: string) => {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, status: "graded", band, feedback }
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

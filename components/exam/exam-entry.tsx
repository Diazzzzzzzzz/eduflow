"use client";

import { useApp } from "@/components/app-provider";
import type { ExamSection } from "@/lib/exam/types";
import { ExamRunner } from "./exam-runner";

/**
 * Bridges the server-rendered paper to the client engine, supplying the active
 * student so a submission can be attributed when a database is configured.
 */
export function ExamEntry({ section }: { section: ExamSection }) {
  const { activeStudentId } = useApp();
  return <ExamRunner section={section} studentId={activeStudentId} />;
}

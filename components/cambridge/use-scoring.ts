"use client";

import * as React from "react";
import { useApp } from "@/components/app-provider";
import type { SubmissionResult } from "@/lib/cambridge-types";

/** Answer state + server-side submit/scoring for a Cambridge section. */
export function useScoring(section: string) {
  const { activeStudentId } = useApp();
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<SubmissionResult | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const setAnswer = React.useCallback((id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
  }, []);

  const submit = React.useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/cambridge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, studentId: activeStudentId, answers }),
      });
      if (res.ok) setResult((await res.json()) as SubmissionResult);
    } catch {
      // Network failure — leave result null so the user can retry.
    } finally {
      setSubmitting(false);
    }
  }, [section, activeStudentId, answers]);

  const reset = React.useCallback(() => {
    setResult(null);
    setAnswers({});
  }, []);

  return { answers, setAnswer, submit, result, submitting, reset };
}

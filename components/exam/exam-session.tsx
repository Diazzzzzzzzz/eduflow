"use client";

import * as React from "react";
import type {
  AnswerMap,
  AnswerValue,
  ExamResult,
  ExamSection,
} from "@/lib/exam/types";
import { sectionQuestions } from "@/lib/exam/types";

/** A stretch of a paragraph the candidate has marked, with an optional note. */
export interface Highlight {
  id: string;
  passageId: string;
  /** Index of the paragraph within the passage. */
  para: number;
  /** Character offsets into that paragraph's plain text. */
  start: number;
  end: number;
  /** Quoted text, so the notes panel can show it without re-reading the DOM. */
  quote: string;
  note?: string;
}

export type ExamPhase = "active" | "review" | "submitting" | "done";

interface PersistedState {
  answers: AnswerMap;
  flagged: string[];
  highlights: Highlight[];
  endsAt: number | null;
  startedAt: number;
}

interface ExamSessionValue {
  section: ExamSection;
  phase: ExamPhase;
  /** Seconds left, or null before the clock is restored on the client. */
  remaining: number | null;
  /** True once localStorage has been read — gates the resume notice. */
  restored: boolean;
  resumed: boolean;

  answers: AnswerMap;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  answeredCount: number;
  totalQuestions: number;

  flagged: Set<string>;
  toggleFlag: (questionId: string) => void;

  highlights: Highlight[];
  addHighlight: (h: Omit<Highlight, "id">) => void;
  removeHighlight: (id: string) => void;
  setNote: (id: string, note: string) => void;

  activePassage: number;
  setActivePassage: (index: number) => void;
  /** Scrolls a question into view and focuses it. */
  goToQuestion: (questionId: string) => void;

  openReview: () => void;
  closeReview: () => void;
  submit: () => Promise<void>;
  restart: () => void;
  result: ExamResult | null;
  error: string | null;
  /** Wall-clock seconds spent, filled in at submission. */
  elapsedSeconds: number;
}

const ExamSessionContext = React.createContext<ExamSessionValue | null>(null);

function storageKey(sectionId: string) {
  return `eduflow:exam:${sectionId}`;
}

export function ExamSessionProvider({
  section,
  studentId,
  children,
}: {
  section: ExamSection;
  studentId?: string | null;
  children: React.ReactNode;
}) {
  const questions = React.useMemo(() => sectionQuestions(section), [section]);
  const totalQuestions = questions.length;

  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const [flagged, setFlagged] = React.useState<Set<string>>(new Set());
  const [highlights, setHighlights] = React.useState<Highlight[]>([]);
  const [activePassage, setActivePassage] = React.useState(0);
  const [phase, setPhase] = React.useState<ExamPhase>("active");
  const [result, setResult] = React.useState<ExamResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [endsAt, setEndsAt] = React.useState<number | null>(null);
  const [startedAt, setStartedAt] = React.useState<number>(() => Date.now());
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const [restored, setRestored] = React.useState(false);
  const [resumed, setResumed] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  // --- restore ------------------------------------------------------------
  // Runs once on mount. The clock is stored as an absolute timestamp so a
  // reload resumes with the time actually remaining, not a fresh 60 minutes.
  React.useEffect(() => {
    const fresh = Date.now() + section.durationMinutes * 60_000;
    try {
      const raw = localStorage.getItem(storageKey(section.id));
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        const stillRunning = !saved.endsAt || saved.endsAt > Date.now();
        if (stillRunning) {
          setAnswers(saved.answers ?? {});
          setFlagged(new Set(saved.flagged ?? []));
          setHighlights(saved.highlights ?? []);
          setEndsAt(saved.endsAt ?? fresh);
          setStartedAt(saved.startedAt ?? Date.now());
          setResumed(Object.keys(saved.answers ?? {}).length > 0);
          setRestored(true);
          return;
        }
        localStorage.removeItem(storageKey(section.id));
      }
    } catch {
      localStorage.removeItem(storageKey(section.id));
    }
    setEndsAt(fresh);
    setStartedAt(Date.now());
    setRestored(true);
  }, [section.id, section.durationMinutes]);

  // --- autosave -----------------------------------------------------------
  React.useEffect(() => {
    if (!restored || phase === "done") return;
    const state: PersistedState = {
      answers,
      flagged: Array.from(flagged),
      highlights,
      endsAt,
      startedAt,
    };
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey(section.id), JSON.stringify(state));
      } catch {
        // Quota or private mode — the session continues in memory.
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [
    answers,
    flagged,
    highlights,
    endsAt,
    startedAt,
    restored,
    phase,
    section.id,
  ]);

  // --- clock --------------------------------------------------------------
  const submitRef = React.useRef<() => Promise<void>>();

  React.useEffect(() => {
    if (endsAt === null || phase === "done" || phase === "submitting") return;
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) void submitRef.current?.();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt, phase]);

  // --- answers ------------------------------------------------------------
  const setAnswer = React.useCallback(
    (questionId: string, value: AnswerValue) => {
      setAnswers((prev) => {
        const isEmpty =
          typeof value === "string" ? value === "" : value.length === 0;
        if (isEmpty) {
          const { [questionId]: _drop, ...rest } = prev;
          void _drop;
          return rest;
        }
        return { ...prev, [questionId]: value };
      });
    },
    []
  );

  const answeredCount = React.useMemo(
    () =>
      questions.reduce((n, q) => {
        const v = answers[q.id];
        if (v === undefined) return n;
        return n + (typeof v === "string" ? (v.trim() ? 1 : 0) : v.length ? 1 : 0);
      }, 0),
    [answers, questions]
  );

  const toggleFlag = React.useCallback((questionId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  // --- highlights ---------------------------------------------------------
  const addHighlight = React.useCallback((h: Omit<Highlight, "id">) => {
    setHighlights((prev) => {
      // Drop anything the new range fully covers, then merge overlaps so the
      // stored list never contains nested marks.
      const others = prev.filter(
        (x) => x.passageId !== h.passageId || x.para !== h.para
      );
      const same = prev.filter(
        (x) => x.passageId === h.passageId && x.para === h.para
      );
      const overlapping = same.filter(
        (x) => x.start <= h.end && h.start <= x.end
      );
      const untouched = same.filter(
        (x) => !(x.start <= h.end && h.start <= x.end)
      );
      const merged: Highlight = {
        ...h,
        id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        start: Math.min(h.start, ...overlapping.map((x) => x.start)),
        end: Math.max(h.end, ...overlapping.map((x) => x.end)),
        // Keep the first existing note rather than silently discarding it.
        note: overlapping.find((x) => x.note)?.note,
      };
      return [...others, ...untouched, merged];
    });
  }, []);

  const removeHighlight = React.useCallback((id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const setNote = React.useCallback((id: string, note: string) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, note: note || undefined } : h))
    );
  }, []);

  // --- navigation ---------------------------------------------------------
  const goToQuestion = React.useCallback(
    (questionId: string) => {
      const index = section.passages.findIndex((p) =>
        p.groups.some((g) => g.questions.some((q) => q.id === questionId))
      );
      if (index >= 0) setActivePassage(index);
      setPhase("active");
      // Let the passage switch paint before scrolling to the question.
      window.requestAnimationFrame(() => {
        const el = document.getElementById(`question-${questionId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.querySelector<HTMLElement>("input, button")?.focus({
          preventScroll: true,
        });
      });
    },
    [section.passages]
  );

  // --- submission ---------------------------------------------------------
  const submit = React.useCallback(async () => {
    setPhase("submitting");
    setError(null);
    const spent = Math.round((Date.now() - startedAt) / 1000);
    setElapsedSeconds(spent);
    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: section.id,
          skill: section.skill,
          studentId: studentId ?? null,
          answers,
          durationSeconds: spent,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      const data = (await res.json()) as ExamResult;
      setResult(data);
      setPhase("done");
      try {
        localStorage.removeItem(storageKey(section.id));
      } catch {
        // Nothing to clean up.
      }
    } catch {
      setError(
        "Не удалось отправить ответы. Проверьте соединение и попробуйте ещё раз — ваши ответы сохранены."
      );
      setPhase("review");
    }
  }, [answers, section.id, section.skill, studentId, startedAt]);

  submitRef.current = submit;

  const restart = React.useCallback(() => {
    setAnswers({});
    setFlagged(new Set());
    setHighlights([]);
    setResult(null);
    setError(null);
    setActivePassage(0);
    setResumed(false);
    setPhase("active");
    const fresh = Date.now() + section.durationMinutes * 60_000;
    setEndsAt(fresh);
    setStartedAt(Date.now());
    try {
      localStorage.removeItem(storageKey(section.id));
    } catch {
      // Ignore.
    }
  }, [section.id, section.durationMinutes]);

  const value: ExamSessionValue = {
    section,
    phase,
    remaining,
    restored,
    resumed,
    answers,
    setAnswer,
    answeredCount,
    totalQuestions,
    flagged,
    toggleFlag,
    highlights,
    addHighlight,
    removeHighlight,
    setNote,
    activePassage,
    setActivePassage,
    goToQuestion,
    openReview: () => setPhase("review"),
    closeReview: () => setPhase("active"),
    submit,
    restart,
    result,
    error,
    elapsedSeconds,
  };

  return (
    <ExamSessionContext.Provider value={value}>
      {children}
    </ExamSessionContext.Provider>
  );
}

export function useExamSession() {
  const ctx = React.useContext(ExamSessionContext);
  if (!ctx) {
    throw new Error("useExamSession must be used inside ExamSessionProvider");
  }
  return ctx;
}

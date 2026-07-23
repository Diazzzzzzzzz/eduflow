import type { Skill } from "./types";

export type SectionId = "full" | Skill;

export interface CatalogSection {
  id: SectionId;
  /** English section name (kept recognizable). */
  en: string;
  /** Russian label. */
  label: string;
  duration: string;
  questions: string;
  /** Which practice-engine section a test launches. */
  engine: Skill;
}

export const CATALOG_SECTIONS: CatalogSection[] = [
  { id: "full", label: "Полный тест", en: "Full Mock", duration: "2 ч 45 мин", questions: "4 секции", engine: "listening" },
  { id: "listening", label: "Аудирование", en: "Listening", duration: "30 мин", questions: "40 вопросов", engine: "listening" },
  { id: "reading", label: "Чтение", en: "Reading", duration: "60 мин", questions: "40 вопросов", engine: "reading" },
  { id: "writing", label: "Письмо", en: "Writing", duration: "60 мин", questions: "2 задания", engine: "writing" },
  { id: "speaking", label: "Говорение", en: "Speaking", duration: "11–14 мин", questions: "3 части", engine: "speaking" },
];

/** Cambridge IELTS volumes, newest first (20 → 12). Book titles are factual. */
export const CAMBRIDGE_BOOKS = [20, 19, 18, 17, 16, 15, 14, 13, 12];
export const TESTS_PER_BOOK = [1, 2, 3, 4];

export type TestStatus = "done" | "progress" | "new";
export interface TestProgress {
  status: TestStatus;
  score?: number;
}

// Demo progress, deterministic (no Date/random → no hydration issues).
const PROGRESS: Record<string, TestProgress> = {
  "20-1": { status: "progress" },
  "19-1": { status: "done", score: 7.5 },
  "19-2": { status: "progress" },
  "18-1": { status: "done", score: 7.0 },
  "18-2": { status: "done", score: 6.5 },
  "17-3": { status: "done", score: 6.0 },
  "16-1": { status: "progress" },
};

export function progressFor(book: number, test: number): TestProgress {
  return PROGRESS[`${book}-${test}`] ?? { status: "new" };
}

export function statusLabel(p: TestProgress): string {
  if (p.status === "done") return `Пройдено (Score: ${p.score?.toFixed(1)})`;
  if (p.status === "progress") return "В процессе";
  return "Не начато";
}

export function statusTone(
  p: TestProgress
): "success" | "default" | "secondary" {
  if (p.status === "done") return "success";
  if (p.status === "progress") return "default";
  return "secondary";
}

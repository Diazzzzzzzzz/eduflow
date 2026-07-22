import type { QuestionType } from "./cambridge-types";

/** Normalize a free-text answer for comparison. */
export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,;]$/g, "");
}

/**
 * Compare a given answer to the stored key. fill_blanks keys may list
 * acceptable alternatives separated by '|'.
 */
export function isAnswerCorrect(
  _type: QuestionType,
  given: string,
  correct: string
): boolean {
  const g = normalizeAnswer(given);
  if (!g) return false;
  return correct.split("|").map(normalizeAnswer).includes(g);
}

// Approximate IELTS raw(/40)→band tables (Academic Reading & Listening).
const READING_TABLE: [number, number][] = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6],
  [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5],
];
const LISTENING_TABLE: [number, number][] = [
  [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6],
  [18, 5.5], [16, 5], [13, 4.5], [10, 4], [7, 3.5], [5, 3],
];

/**
 * Convert a raw score to an IELTS band. Partial question sets are scaled to a
 * /40 equivalent so short practice sets still yield a realistic estimate.
 */
export function rawToBand(
  correct: number,
  total: number,
  module: "reading" | "listening"
): number {
  if (total <= 0) return 0;
  const scaled = Math.round((correct / total) * 40);
  const table = module === "listening" ? LISTENING_TABLE : READING_TABLE;
  for (const [min, band] of table) if (scaled >= min) return band;
  return 2.5;
}

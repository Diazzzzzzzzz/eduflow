import type { Skill } from "./types";

export type QuestionType =
  | "mcq"
  | "true_false_not_given"
  | "fill_blanks"
  | "matching";

export type SectionType = Skill; // listening | reading | writing | speaking

/** Question as sent to the browser — no answer key. */
export interface EngineQuestion {
  id: string;
  questionNumber: number;
  type: QuestionType;
  prompt: string;
  options: string[] | null;
}

/** Full question incl. answer key — server-side only. */
export interface EngineQuestionFull extends EngineQuestion {
  correctAnswer: string; // fill_blanks may list alternatives with '|'
  explanation: string | null;
}

export interface EnginePassage<Q = EngineQuestion> {
  id: string;
  passageNumber: number;
  title: string;
  textContent: string;
  audioUrl: string | null;
  questions: Q[];
}

export interface CambridgeTest<Q = EngineQuestion> {
  id: string;
  bookNumber: number;
  testNumber: number;
  title: string;
  sectionType: SectionType;
  passages: EnginePassage<Q>[];
}

export type CambridgeTestFull = CambridgeTest<EngineQuestionFull>;

/** Per-question scoring result returned by the submit endpoint. */
export interface QuestionResult {
  questionId: string;
  questionNumber: number;
  correct: boolean;
  given: string;
  correctAnswer: string;
  explanation: string | null;
}

export interface SubmissionResult {
  total: number;
  correct: number;
  band: number | null; // null for writing/speaking (not auto-scored)
  results: QuestionResult[];
  scored: boolean;
}

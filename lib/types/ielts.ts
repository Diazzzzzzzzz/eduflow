/**
 * Type definitions for the Cambridge IELTS Academic dataset
 * (see `cambridge_19_academic.json`).
 *
 * These interfaces mirror the raw JSON shape exactly, so a parsed file is
 * assignable to `IeltsBook` with no massaging. The dataset bundles all four
 * skills per test and uses a few different question shapes across parts, so the
 * question types below are intentionally permissive (optional fields) rather
 * than one variant per shape.
 *
 * Normalized DB row types (as stored in Supabase) live at the bottom.
 */

// ---------------------------------------------------------------------------
// Listening
// ---------------------------------------------------------------------------

/** Question styles that appear across the four listening parts. */
export type ListeningQuestionType =
  | "multiple_choice" // single correct letter, e.g. "B"
  | "multiple_choice_multiple" // pick two, e.g. ["B", "C"] for id "21-22"
  | "matching" // match a label to a letter
  | "matching_map"; // match a place on a map to a letter

/**
 * A single listening question. Part 1 / Part 4 gap-fills carry a `prompt` and a
 * single `answer`; matching questions carry a `label`; the "pick two" questions
 * span a range id (e.g. `"21-22"`) and carry `answers`.
 */
export interface ListeningQuestion {
  /** Original id — a number (`7`) or a range string (`"21-22"`). */
  id: number | string;
  type?: ListeningQuestionType;
  /** Gap-fill sentence with a `[n]` placeholder (Part 1 / Part 4). */
  prompt?: string;
  /** Row label for matching questions. */
  label?: string;
  /** Single correct answer. */
  answer?: string;
  /** Correct answers for "pick two" (multiple_choice_multiple) questions. */
  answers?: string[];
}

export interface ListeningPart {
  title: string;
  questions: ListeningQuestion[];
}

/** The four-part listening section. */
export interface ListeningSection {
  part_1: ListeningPart;
  part_2: ListeningPart;
  part_3: ListeningPart;
  part_4: ListeningPart;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/** A reading answer is a single value, or an array for "pick two" ranges. */
export type ReadingAnswer = string | string[];

/**
 * The reading section is distributed as an answer key only (the copyrighted
 * passages are not included). Keys are question numbers or ranges as strings,
 * e.g. `"14"` or `"20-21"`.
 */
export interface ReadingSection {
  answers: Record<string, ReadingAnswer>;
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

export interface WritingSection {
  task_1: string;
  task_2: string;
}

/** A single normalized writing task (Task 1 or Task 2). */
export interface WritingTask {
  taskNumber: 1 | 2;
  prompt: string;
}

// ---------------------------------------------------------------------------
// Speaking
// ---------------------------------------------------------------------------

export interface SpeakingPart1 {
  topic: string;
  questions: string[];
}

export interface SpeakingPart2 {
  /** The cue-card topic ("Describe …"). */
  topic: string;
  prompt_points: string[];
}

/**
 * Part 3 is a set of discussion themes keyed by an ad-hoc category name
 * (e.g. `school_rules`, `working_in_legal_profession`), each mapping to a list
 * of questions.
 */
export type SpeakingPart3 = Record<string, string[]>;

export interface SpeakingSection {
  part_1: SpeakingPart1;
  part_2: SpeakingPart2;
  part_3: SpeakingPart3;
}

// ---------------------------------------------------------------------------
// Test + Book
// ---------------------------------------------------------------------------

export interface IeltsTest {
  test_id: number;
  listening: ListeningSection;
  reading: ReadingSection;
  writing: WritingSection;
  speaking: SpeakingSection;
}

/** Root object of `cambridge_19_academic.json`. */
export interface IeltsBook {
  book: string;
  tests: IeltsTest[];
}

// ---------------------------------------------------------------------------
// Normalized DB rows (as stored in Supabase — see 0005 migration)
// ---------------------------------------------------------------------------

export type IeltsSection = "listening" | "reading" | "writing" | "speaking";

/** Sections a student answers and that we can auto-score. */
export type AnswerableSection = "listening" | "reading";

export interface IeltsTestRow {
  id: string;
  book: string;
  test_number: number;
  created_at: string;
}

export interface IeltsQuestionRow {
  id: string;
  test_id: string;
  section: AnswerableSection;
  /** 1–4 for listening; null for reading (no parts in the dataset). */
  part_number: number | null;
  /** Original id string, e.g. "7" or "21-22". */
  question_ref: string;
  /** First numeric id, used purely for stable ordering. */
  sort_order: number;
  type: ListeningQuestionType | null;
  prompt: string | null;
  label: string | null;
  /** Always an array; single-answer questions store one element. */
  correct_answers: string[];
}

export interface IeltsWritingTaskRow {
  id: string;
  test_id: string;
  task_number: number;
  prompt: string;
}

export interface IeltsSpeakingPromptRow {
  id: string;
  test_id: string;
  part_number: number;
  /** Part 3 category name; null for parts 1 and 2. */
  category: string | null;
  /** Topic / cue card for parts 1 and 2; null for part 3. */
  topic: string | null;
  /** Cue-card bullet points (part 2). */
  prompt_points: string[] | null;
  /** Discussion questions (parts 1 and 3). */
  questions: string[] | null;
  sort_order: number;
}

/** A question as sent to the browser — answer key stripped. */
export type PublicIeltsQuestion = Omit<IeltsQuestionRow, "correct_answers">;

/** Per-question result returned by the answer checker. */
export interface IeltsQuestionResult {
  questionRef: string;
  correct: boolean;
  given: string[];
  correctAnswers: string[];
}

export interface IeltsCheckResult {
  section: AnswerableSection;
  total: number;
  correct: number;
  /** Estimated IELTS band; null when there are no questions. */
  band: number | null;
  results: IeltsQuestionResult[];
}

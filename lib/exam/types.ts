/**
 * Content model for the exam engine.
 *
 * Deliberately content-agnostic: the engine renders whatever conforms to
 * `ExamSection`, so licensed material can replace the bundled demo exam
 * without touching a single component.
 *
 * Questions are grouped the way a real IELTS paper groups them — a shared
 * instruction line ("Complete the notes below. Write NO MORE THAN TWO WORDS"),
 * a shared option list where relevant, and a contiguous question range.
 */

export type ExamSkill = "reading" | "listening";

export type QuestionType =
  | "mcq_single" // one letter
  | "mcq_multi" // choose TWO / THREE letters
  | "true_false_not_given"
  | "yes_no_not_given"
  | "gap_fill" // notes / summary / table / flow-chart completion
  | "short_answer"
  | "matching" // match a statement to a person / feature / paragraph
  | "matching_headings"
  | "sentence_endings"
  | "labelling"; // map or diagram

/** A selectable option. `value` is what gets stored (usually a letter). */
export interface ChoiceOption {
  value: string;
  label: string;
}

/** A question as sent to the browser — never carries the answer key. */
export interface ExamQuestion {
  id: string;
  number: number;
  /**
   * Set when one question covers a range of numbers, as "choose TWO letters"
   * does. The item is then worth `numberTo - number + 1` marks, matching the
   * real answer sheet where each correct letter earns its own mark.
   */
  numberTo?: number;
  /**
   * The stem. For `gap_fill` the blank is marked with `___` (three
   * underscores) and the renderer replaces it with an inline input.
   */
  prompt: string;
  /** Per-question options; falls back to the group's shared list. */
  options?: ChoiceOption[];
  /** `mcq_multi` only — how many letters must be chosen. */
  selectCount?: number;
  /** Overrides the group's word limit for this question. */
  wordLimit?: number;
}

/** Server-side question, including the answer key. Never leaves the server. */
export interface ExamQuestionFull extends ExamQuestion {
  /**
   * Accepted answer(s). A string may list interchangeable variants separated
   * by `|` (e.g. `"20|twenty"`). An array means every entry must be selected
   * (used by `mcq_multi`), and each entry may itself list `|` variants.
   */
  answer: string | string[];
  /** Shown on the results screen to explain the key. */
  explanation?: string;
}

/**
 * A diagram or map for `labelling` groups. The engine looks `id` up in a
 * client-side registry rather than accepting raw SVG, so untrusted content
 * can never inject markup.
 */
export interface ExamDiagram {
  id: string;
  title: string;
  caption?: string;
}

export interface QuestionGroup<Q = ExamQuestion> {
  id: string;
  type: QuestionType;
  /** Inclusive question-number range, used for the "Questions 1–6" header. */
  from: number;
  to: number;
  instructions: string;
  /** Max words per answer for text input. Enforced at scoring time. */
  wordLimit?: number;
  /** Heading above a shared option list, e.g. "List of Headings". */
  optionsTitle?: string;
  options?: ChoiceOption[];
  /** Title of the notes/summary block above the questions. */
  intro?: string;
  diagram?: ExamDiagram;
  questions: Q[];
}

export interface ExamPassage<Q = ExamQuestion> {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  /**
   * Body text. Paragraphs are separated by a blank line. A paragraph may open
   * with a bare `[A]` marker, which the reader renders as a lettered label —
   * that is what "matching headings" questions refer to.
   */
  text: string;
  /** Listening only. */
  audioUrl?: string;
  /** Listening transcript, revealed after submission. */
  transcript?: string;
  groups: QuestionGroup<Q>[];
}

export interface ExamSection<Q = ExamQuestion> {
  id: string;
  skill: ExamSkill;
  title: string;
  /** Countdown length shown to the candidate. */
  durationMinutes: number;
  /** Short provenance line rendered in the UI. */
  attribution: string;
  passages: ExamPassage<Q>[];
}

export type ExamSectionFull = ExamSection<ExamQuestionFull>;

/** What a candidate has entered. Arrays are used by `mcq_multi`. */
export type AnswerValue = string | string[];
export type AnswerMap = Record<string, AnswerValue>;

export interface QuestionResult {
  questionId: string;
  number: number;
  numberTo?: number;
  /** True only when every mark available on the item was earned. */
  correct: boolean;
  /** Marks earned, for partial credit on multi-answer items. */
  earned: number;
  /** Marks the item is worth. */
  possible: number;
  given: AnswerValue;
  answer: string;
  explanation?: string;
  /** Set when the answer was rejected purely for exceeding the word limit. */
  overWordLimit?: boolean;
}

export interface ExamResult {
  total: number;
  correct: number;
  band: number;
  results: QuestionResult[];
  /** Correct/total per passage, for the breakdown on the results screen. */
  byPassage: { number: number; title: string; correct: number; total: number }[];
  durationSeconds?: number;
}

// ---------------------------------------------------------------------------
// Helpers shared by client and server
// ---------------------------------------------------------------------------

export function sectionQuestions<Q>(section: ExamSection<Q>): Q[] {
  return section.passages.flatMap((p) => p.groups.flatMap((g) => g.questions));
}

export function passageQuestionRange<Q>(
  passage: ExamPassage<Q>
): { from: number; to: number } {
  const groups = passage.groups;
  return {
    from: groups[0]?.from ?? 0,
    to: groups[groups.length - 1]?.to ?? 0,
  };
}

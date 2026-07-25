/**
 * Answer checking and raw-score → band conversion.
 *
 * Runs on the server (the answer keys live there), but every function here is
 * pure, so it is also unit-testable and safe to reuse anywhere.
 */

import type {
  AnswerMap,
  AnswerValue,
  ExamQuestionFull,
  ExamResult,
  ExamSectionFull,
  QuestionResult,
  QuestionType,
} from "./types";

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

const LEADING_ARTICLE = /^(?:a|an|the)\s+/;

/**
 * Reduce an answer to a comparable form.
 *
 * IELTS marks spelling strictly, so this deliberately does no fuzzy matching:
 * it only removes differences a human marker would ignore — surrounding
 * whitespace, case, smart punctuation, trailing full stops, and a leading
 * article (both "the canopy" and "canopy" are accepted on a real answer sheet).
 */
export function normalizeAnswer(raw: string): string {
  const cleaned = raw
    .normalize("NFKC")
    .replace(/[‘’ʼ]/g, "'") // curly → straight apostrophe
    .replace(/[‐-―]/g, "-") // dashes → hyphen
    .replace(/[""]/g, '"')
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/[.,;:!?]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
  return cleaned.replace(LEADING_ARTICLE, "");
}

/** Word count as an IELTS marker would read it — hyphenated forms are one word. */
export function countWords(raw: string): number {
  const t = raw.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

/** Split a key like `"20|twenty"` into its accepted variants. */
function variants(key: string): string[] {
  return key.split("|").map(normalizeAnswer).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Per-question checking
// ---------------------------------------------------------------------------

const TEXT_TYPES: QuestionType[] = ["gap_fill", "short_answer"];

export interface CheckOutcome {
  /** Every available mark was earned. */
  correct: boolean;
  earned: number;
  possible: number;
  overWordLimit?: boolean;
}

/**
 * Compare a candidate's answer to the key.
 *
 * An array key (used by "choose TWO letters") is worth one mark per entry and
 * is marked order-insensitively with partial credit, exactly as on the real
 * answer sheet: one right letter and one wrong letter scores 1 of 2. Selecting
 * more options than requested is treated as an unmarkable answer and scores 0.
 */
export function checkAnswer(
  question: Pick<ExamQuestionFull, "answer" | "wordLimit"> & {
    /** Comes from the owning group; decides whether a word limit applies. */
    type?: QuestionType;
  },
  given: AnswerValue | undefined,
  groupWordLimit?: number
): CheckOutcome {
  const { answer } = question;

  if (Array.isArray(answer)) {
    const possible = answer.length;
    const chosen = (Array.isArray(given) ? given : given ? [given] : [])
      .map(normalizeAnswer)
      .filter(Boolean);
    if (chosen.length === 0) return { correct: false, earned: 0, possible };
    // Over-selecting would let a candidate tick every box and score full marks.
    if (chosen.length > possible) return { correct: false, earned: 0, possible };

    const remaining = [...chosen];
    let earned = 0;
    for (const key of answer) {
      const accepted = variants(key);
      const hit = remaining.findIndex((c) => accepted.includes(c));
      if (hit !== -1) {
        earned += 1;
        remaining.splice(hit, 1);
      }
    }
    return { correct: earned === possible, earned, possible };
  }

  const raw = Array.isArray(given) ? given.join(" ") : (given ?? "");
  if (!raw.trim()) return { correct: false, earned: 0, possible: 1 };

  const limit = question.wordLimit ?? groupWordLimit;
  const isText = !question.type || TEXT_TYPES.includes(question.type);
  if (isText && limit && countWords(raw) > limit) {
    // Over the stated limit is marked wrong even when the words are right.
    return { correct: false, earned: 0, possible: 1, overWordLimit: true };
  }

  const correct = variants(answer).includes(normalizeAnswer(raw));
  return { correct, earned: correct ? 1 : 0, possible: 1 };
}

// ---------------------------------------------------------------------------
// Raw score → band
// ---------------------------------------------------------------------------

/**
 * Published IELTS conversion tables, as `[minimum raw score, band]` in
 * descending order. Academic Reading is the harder curve of the two.
 */
const READING_TABLE: readonly (readonly [number, number])[] = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6],
  [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [3, 2],
  [2, 1.5],
];

const LISTENING_TABLE: readonly (readonly [number, number])[] = [
  [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6],
  [18, 5.5], [16, 5], [13, 4.5], [10, 4], [6, 3.5], [4, 3], [3, 2.5], [2, 2],
];

/**
 * Convert a raw score to a band.
 *
 * A partial set (a single passage, say) is scaled to its /40 equivalent so a
 * 13-question practice run still returns a meaningful estimate. Full 40-item
 * papers pass through the table unscaled.
 */
export function rawToBand(
  correct: number,
  total: number,
  skill: "reading" | "listening"
): number {
  if (total <= 0) return 0;
  const scaled = total === 40 ? correct : Math.round((correct / total) * 40);
  const table = skill === "listening" ? LISTENING_TABLE : READING_TABLE;
  for (const [min, band] of table) if (scaled >= min) return band;
  return 1;
}

// ---------------------------------------------------------------------------
// Whole-section scoring
// ---------------------------------------------------------------------------

export function scoreSection(
  section: ExamSectionFull,
  answers: AnswerMap,
  durationSeconds?: number
): ExamResult {
  const results: QuestionResult[] = [];
  const byPassage: ExamResult["byPassage"] = [];

  for (const passage of section.passages) {
    let passageEarned = 0;
    let passageMarks = 0;

    for (const group of passage.groups) {
      for (const q of group.questions) {
        const outcome = checkAnswer(
          { type: group.type, answer: q.answer, wordLimit: q.wordLimit },
          answers[q.id],
          group.wordLimit
        );
        passageMarks += outcome.possible;
        passageEarned += outcome.earned;
        results.push({
          questionId: q.id,
          number: q.number,
          numberTo: q.numberTo,
          correct: outcome.correct,
          earned: outcome.earned,
          possible: outcome.possible,
          given: answers[q.id] ?? "",
          answer: Array.isArray(q.answer)
            ? q.answer.map((a) => a.replace(/\|/g, " / ")).join(" + ")
            : q.answer.replace(/\|/g, " / "),
          explanation: q.explanation,
          overWordLimit: outcome.overWordLimit,
        });
      }
    }

    byPassage.push({
      number: passage.number,
      title: passage.title,
      correct: passageEarned,
      total: passageMarks,
    });
  }

  results.sort((a, b) => a.number - b.number);
  const correct = results.reduce((sum, r) => sum + r.earned, 0);
  const total = results.reduce((sum, r) => sum + r.possible, 0);

  return {
    total,
    correct,
    band: rawToBand(correct, total, section.skill),
    results,
    byPassage,
    durationSeconds,
  };
}

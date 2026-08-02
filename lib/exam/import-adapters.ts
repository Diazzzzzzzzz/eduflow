/**
 * Adapter for the "authoring" JSON dialect used by externally-produced papers.
 *
 * That dialect nests groups under `passages[].questionGroups`, numbers items
 * with `questionNumber`, and carries keys as `correctAnswer`. This module
 * translates it into the engine's own import format (`ImportedPaper`) so the
 * existing `validateImport` remains the single source of truth for validation.
 *
 * Four conversions here are load-bearing rather than cosmetic:
 *
 *  1. "Choose TWO letters" arrives as TWO rows that repeat the same 2-element
 *     key (Q23 → ["B","D"], Q24 → ["B","D"]). Taken literally that is four
 *     marks for a two-mark item and a 44-mark paper. Consecutive rows sharing a
 *     key are collapsed into one item spanning `number`–`numberTo`, which is how
 *     the engine already models a multi-mark question.
 *  2. Gap prompts use a run of underscores of any length; the renderer splits on
 *     exactly `___`, so a 5-underscore run would leave stray `__` on screen.
 *  3. Options arrive as `"A appeal"` — letter and label fused, with no
 *     separator for the generic parser to key on.
 *  4. Paragraph labels arrive as a bare leading letter (`"A It isn't easy…"`);
 *     the passage reader recognises `[A]`. Without the brackets a
 *     "which paragraph contains…" question has nothing to refer to.
 */

import type { ChoiceOption } from "./types";
import type {
  ImportedGroup,
  ImportedPaper,
  ImportedPassage,
  ImportedQuestion,
} from "./import-schema";

/* -------------------------------------------------------------------------- */
/* Wire shape of the external dialect                                         */
/* -------------------------------------------------------------------------- */

interface ExternalQuestion {
  id?: number;
  questionNumber?: number;
  text?: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
}

interface ExternalGroup {
  type?: string;
  groupInstruction?: string;
  questions?: ExternalQuestion[];
}

interface ExternalPassage {
  passageNumber?: number;
  title?: string;
  text?: string;
  questionGroups?: ExternalGroup[];
}

interface ExternalPaper {
  testId?: string;
  title?: string;
  type?: string;
  totalDurationMinutes?: number;
  attribution?: string;
  passages?: ExternalPassage[];
}

/** True when the payload uses the authoring dialect rather than the engine's. */
export function isExternalPaperFormat(raw: unknown): boolean {
  if (typeof raw !== "object" || raw === null) return false;
  const passages = (raw as ExternalPaper).passages;
  return (
    Array.isArray(passages) &&
    passages.some(
      (p) => typeof p === "object" && p !== null && "questionGroups" in p
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Type mapping                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Dialect type → an alias `validateImport` understands.
 *
 * `summary_completion_with_list` maps to `matching`, not `gap_fill`: the
 * candidate picks a letter from a shared A–K list rather than typing, and the
 * engine renders a long option list as a dropdown.
 */
const EXTERNAL_TYPES: Record<string, string> = {
  fill_in_blanks: "gap_fill",
  notes_completion: "gap_fill",
  sentence_completion: "gap_fill",
  summary_completion: "gap_fill",
  summary_completion_with_list: "matching",
  table_completion: "gap_fill",
  short_answer: "short_answer",
  true_false_not_given: "true_false_not_given",
  yes_no_not_given: "yes_no_not_given",
  matching_information: "matching",
  matching_features: "matching",
  matching_headings: "matching_headings",
  matching_sentence_endings: "sentence_endings",
  multiple_choice: "multiple_choice",
  multiple_choice_multiple_answers: "mcq_multi",
  diagram_labelling: "labelling",
};

/** Types whose answer is a letter chosen from a list, never typed text. */
const LETTER_TYPES = new Set(["matching", "matching_headings", "sentence_endings"]);

/* -------------------------------------------------------------------------- */
/* Field-level normalisation                                                  */
/* -------------------------------------------------------------------------- */

/** Collapse any run of 3+ underscores to the `___` the gap renderer splits on. */
function normalizeGap(prompt: string): string {
  return prompt.replace(/_{3,}/g, "___");
}

/**
 * The engine prints its own "Questions 14–18" header from the group range, so
 * the prefix baked into the instruction would render twice.
 */
function stripQuestionPrefix(instruction: string): string {
  return instruction
    .replace(/^\s*Questions?\s+\d+\s*(?:[-–—]|and)\s*\d+\s*[:.]\s*/i, "")
    .replace(/^\s*Questions?\s+\d+\s*[:.]\s*/i, "")
    .trim();
}

/**
 * `"A appeal"` → `{ value: "A", label: "A. appeal" }`.
 *
 * A bare letter (`"A"`) or a self-labelling token (`"TRUE"`) is its own key and
 * is passed through untouched — rewriting those would break the match against
 * the answer key.
 */
function toOption(raw: string, index: number): ChoiceOption {
  const trimmed = raw.trim();
  if (/^[A-Z]$/.test(trimmed) || /^[A-Z][A-Z ]*$/.test(trimmed)) {
    return { value: trimmed, label: trimmed };
  }
  // Already punctuated ("A. appeal" / "A) appeal") — let it stand.
  const punctuated = trimmed.match(/^([A-Za-z])[.)]\s*(.+)$/);
  if (punctuated) {
    return { value: punctuated[1].toUpperCase(), label: trimmed };
  }
  // Fused ("A appeal" / "B determined").
  const fused = trimmed.match(/^([A-Z])\s+(.+)$/);
  if (fused) {
    return { value: fused[1], label: `${fused[1]}. ${fused[2]}` };
  }
  const letter = String.fromCharCode(65 + index);
  return { value: letter, label: `${letter}. ${trimmed}` };
}

/** Word limit stated in the rubric, so an over-long answer is marked wrong. */
function wordLimitFrom(instruction: string): number | undefined {
  const text = instruction.toUpperCase();
  if (/ONE WORD ONLY|ONE WORD AND\/OR A NUMBER/.test(text)) return 1;
  if (/NO MORE THAN TWO WORDS|TWO WORDS AND\/OR A NUMBER/.test(text)) return 2;
  if (/NO MORE THAN THREE WORDS|THREE WORDS AND\/OR A NUMBER/.test(text)) return 3;
  return undefined;
}

/**
 * Bracket bare paragraph labels: `"A It isn't easy…"` → `"[A] It isn't easy…"`.
 *
 * Only applied when the passage actually has letter-referencing questions, and
 * only when EVERY paragraph carries a label — a passage whose first word merely
 * happens to be "A" must not be mangled.
 */
function bracketParagraphLabels(text: string): string {
  const paragraphs = text.split(/\n\s*\n/);
  if (paragraphs.length < 2) return text;

  const labelled = paragraphs.map((p) => p.match(/^([A-Z])\s+(?=[A-Z“"'])/));
  if (labelled.some((m) => !m)) return text;

  // Labels must run A, B, C… in order; anything else is a false positive.
  const expected = paragraphs.map((_, i) => String.fromCharCode(65 + i));
  if (labelled.some((m, i) => m![1] !== expected[i])) return text;

  return paragraphs
    .map((p, i) => `[${expected[i]}] ${p.slice(labelled[i]![0].length)}`)
    .join("\n\n");
}

/* -------------------------------------------------------------------------- */
/* Question conversion                                                        */
/* -------------------------------------------------------------------------- */

function sameKey(a: string | string[], b: string | string[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Convert one group's questions, collapsing repeated multi-answer rows.
 *
 * Returns issues rather than throwing so the caller can report every problem in
 * the file at once, matching `validateImport`'s contract.
 */
function convertQuestions(
  group: ExternalGroup,
  mappedType: string,
  path: string,
  issues: string[]
): ImportedQuestion[] {
  const raw = (group.questions ?? []).filter(
    (q): q is ExternalQuestion => typeof q === "object" && q !== null
  );
  const sorted = [...raw].sort(
    (a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0)
  );

  const out: ImportedQuestion[] = [];
  const wordLimit = wordLimitFrom(group.groupInstruction ?? "");

  for (let i = 0; i < sorted.length; i++) {
    const q = sorted[i];
    const number = q.questionNumber ?? q.id;
    if (typeof number !== "number" || !Number.isInteger(number)) {
      issues.push(`${path}.questions[${i}] — нет номера вопроса.`);
      continue;
    }

    const answer = q.correctAnswer;
    if (answer === undefined || (Array.isArray(answer) && answer.length === 0)) {
      issues.push(`${path}.questions[${i}] — нет correctAnswer.`);
      continue;
    }

    const options = q.options?.length ? q.options.map(toOption) : undefined;
    const isText = !options && !LETTER_TYPES.has(mappedType);
    const prompt = isText
      ? normalizeGap(q.text ?? "")
      : (q.text ?? "").replace(/\s*\(second answer\)\s*$/i, "").trim();

    if (!Array.isArray(answer)) {
      out.push({
        number,
        prompt,
        answer,
        options,
        explanation: q.explanation,
        wordLimit: isText ? wordLimit : undefined,
      });
      continue;
    }

    // Multi-answer item: absorb the following rows that repeat this same key,
    // so "choose TWO letters" is one question worth two marks, not two worth
    // two each.
    let last = number;
    while (
      i + 1 < sorted.length &&
      sorted[i + 1].correctAnswer !== undefined &&
      sameKey(sorted[i + 1].correctAnswer!, answer)
    ) {
      i += 1;
      last = sorted[i].questionNumber ?? last;
    }

    const numberTo = number + answer.length - 1;
    if (last !== numberTo) {
      issues.push(
        `${path} — вопросы ${number}–${last} несут ${answer.length} ответ(а); ожидался диапазон ${number}–${numberTo}.`
      );
    }

    out.push({
      number,
      numberTo,
      prompt,
      answer,
      options,
      explanation: q.explanation,
      selectCount: answer.length,
    });
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Paper conversion                                                           */
/* -------------------------------------------------------------------------- */

export interface AdaptResult {
  paper?: ImportedPaper;
  issues: string[];
}

/**
 * Translate an authoring-dialect paper into the engine's import format.
 *
 * Structural problems are collected as issues; the result is still returned so
 * the caller can run it through `validateImport` and surface both sets.
 */
export function adaptExternalPaper(raw: unknown): AdaptResult {
  const issues: string[] = [];
  if (typeof raw !== "object" || raw === null) {
    return { issues: ["Файл должен содержать JSON-объект."] };
  }

  const src = raw as ExternalPaper;
  const passagesIn = Array.isArray(src.passages) ? src.passages : [];
  if (passagesIn.length === 0) {
    return { issues: ["В файле нет пассажей (passages)."] };
  }

  const passages: ImportedPassage[] = [];

  passagesIn.forEach((p, pi) => {
    const pPath = `passages[${pi}]`;
    const groupsIn = Array.isArray(p.questionGroups) ? p.questionGroups : [];
    if (groupsIn.length === 0) {
      issues.push(`${pPath} — нет questionGroups.`);
      return;
    }

    const groups: ImportedGroup[] = [];
    let referencesParagraphs = false;

    groupsIn.forEach((g, gi) => {
      const gPath = `${pPath}.questionGroups[${gi}]`;
      const typeRaw = (g.type ?? "").trim();
      const mapped = EXTERNAL_TYPES[typeRaw] ?? EXTERNAL_TYPES[typeRaw.toLowerCase()];
      if (!mapped) {
        issues.push(
          `${gPath} — неизвестный тип "${typeRaw}". Поддерживаются: ${Object.keys(EXTERNAL_TYPES).join(", ")}.`
        );
        return;
      }
      if (typeRaw === "matching_information" || typeRaw === "matching_headings") {
        referencesParagraphs = true;
      }

      const instruction = stripQuestionPrefix(g.groupInstruction ?? "");
      const questions = convertQuestions(g, mapped, gPath, issues);
      if (questions.length === 0) return;

      groups.push({
        type: mapped,
        instructions: instruction || undefined,
        wordLimit: wordLimitFrom(g.groupInstruction ?? ""),
        questions,
      });
    });

    if (groups.length === 0) return;

    const text = p.text ?? "";
    passages.push({
      number: p.passageNumber ?? pi + 1,
      title: p.title ?? "",
      text: referencesParagraphs ? bracketParagraphLabels(text) : text,
      groups,
    });
  });

  return {
    issues,
    paper: {
      id: src.testId,
      title: src.title ?? "",
      module: src.type ?? "reading",
      durationMinutes: src.totalDurationMinutes,
      attribution: src.attribution,
      passages,
    },
  };
}

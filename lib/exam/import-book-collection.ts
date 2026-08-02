/**
 * Adapter for the multi-test "book collection" dialect — a whole PDF of IELTS
 * Reading papers extracted into one JSON file:
 *
 *   { meta, tests: [ { test_number, sections: [ { section, passage_title,
 *     passage_text, question_groups: [...] } ] } ] }
 *
 * Two things make this dialect harder than the single-paper one:
 *
 *  1. A group carries its questions in EITHER `questions[]` (one object per
 *     item) or `answers{}` (a number → key map plus a `text_with_gaps` blob).
 *     The second form has no per-question text at all, so the prompts have to
 *     be reconstructed by splitting the blob on its gap markers.
 *  2. The source is OCR'd, so some of it is damaged beyond repair — gap markers
 *     that swallowed their number ("orie2n2ti ng" is "orienting" with "22"
 *     interleaved), empty gap blobs, option lists with the rubric glued onto the
 *     last entry.
 *
 * The adapter therefore reports per-test problems instead of best-guessing.
 * `adaptBookCollection` returns the papers that converted cleanly and, for the
 * rest, the reasons — so a caller can import only what is fit to sit.
 */

import type { ChoiceOption } from "./types";
import type {
  ImportedGroup,
  ImportedPaper,
  ImportedPassage,
  ImportedQuestion,
} from "./import-schema";

/* -------------------------------------------------------------------------- */
/* Wire shape                                                                 */
/* -------------------------------------------------------------------------- */

interface BookQuestion {
  number?: number;
  text?: string;
  answer?: string | null;
  options?: string[];
}

interface BookGroup {
  type?: string;
  instruction?: string;
  questions_range?: string;
  questions?: BookQuestion[];
  /** Alternative to `questions`: a number → answer-key map. */
  answers?: Record<string, string | null>;
  /** The summary/table/flow-chart body the `answers` map refers to. */
  text_with_gaps?: string;
  /** Stem shared by every item in the group (multi-select questions). */
  question_text?: string;
  options?: string[];
}

interface BookSection {
  section?: number;
  passage_title?: string;
  passage_text?: string;
  question_groups?: BookGroup[];
}

interface BookTest {
  test_number?: number;
  sections?: BookSection[];
}

export interface BookCollection {
  meta?: { source?: string };
  tests?: BookTest[];
}

/** True when the payload is a collection of tests in the book dialect. */
export function isBookCollection(raw: unknown): boolean {
  if (typeof raw !== "object" || raw === null) return false;
  const tests = (raw as BookCollection).tests;
  return (
    Array.isArray(tests) &&
    tests.length > 0 &&
    typeof tests[0] === "object" &&
    tests[0] !== null &&
    Array.isArray((tests[0] as BookTest).sections)
  );
}

/* -------------------------------------------------------------------------- */
/* Type mapping                                                               */
/* -------------------------------------------------------------------------- */

const BOOK_TYPES: Record<string, string> = {
  true_false_notgiven: "true_false_not_given",
  yes_no_notgiven: "yes_no_not_given",
  multiple_choice: "multiple_choice",
  multiple_choice_multi: "mcq_multi",
  matching_features: "matching",
  matching_information: "matching",
  matching_headings: "matching_headings",
  sentence_endings: "sentence_endings",
  short_answer: "short_answer",
  summary_completion: "gap_fill",
  sentence_completion: "gap_fill",
  table_completion: "gap_fill",
  flowchart_completion: "gap_fill",
  note_completion: "gap_fill",
};

/** Types whose answer is a letter picked from a list rather than typed text. */
const LETTER_TYPES = new Set([
  "multiple_choice",
  "mcq_multi",
  "matching",
  "matching_headings",
  "sentence_endings",
  "true_false_not_given",
  "yes_no_not_given",
]);

/** Gap types: the answer is typed, so the prompt must show where the gap is. */
const GAP_TYPES = new Set(["gap_fill", "short_answer"]);

/** Types whose options the engine supplies itself (TRUE/FALSE/NOT GIVEN…). */
function isVerdict(type: string): boolean {
  return type === "true_false_not_given" || type === "yes_no_not_given";
}

/* -------------------------------------------------------------------------- */
/* Answer keys                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Expand a printed answer key into the engine's `|`-separated variants.
 *
 * Answer keys in these books use two conventions that would otherwise mark a
 * correct candidate wrong:
 *   "rock/ash"        — either word is accepted
 *   "(molten) rock"   — the bracketed word is optional
 * so "(molten) rock/ash" accepts "molten rock", "rock" and "ash".
 */
export function expandAnswerKey(raw: string): string {
  const variants = new Set<string>();

  for (const alternative of raw.split("/")) {
    const base = alternative.trim();
    if (!base) continue;
    variants.add(base.replace(/[()]/g, " ").replace(/\s+/g, " ").trim());
    // Same answer with every bracketed span dropped.
    const without = base.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    if (without) variants.add(without);
  }

  return Array.from(variants).filter(Boolean).join("|");
}

/* -------------------------------------------------------------------------- */
/* Options                                                                    */
/* -------------------------------------------------------------------------- */

/** Rubric that the extractor glued onto the tail of the last option. */
const RUBRIC_TAIL =
  /\s*(NB[:.]?\s*)?you may use any letter more than once.*$/i;

/**
 * `"A. General Electronics"` → `{ value: "A", label: "A. General Electronics" }`,
 * preserving roman numerals for heading lists (`"i. ..."` → value `"i"`).
 */
function cleanOption(raw: string, index: number): ChoiceOption {
  const trimmed = raw.replace(RUBRIC_TAIL, "").trim();
  const marked = trimmed.match(/^([A-Za-z]{1,4})\s*[.)]\s*(.+)$/);
  if (marked) {
    const value = marked[1];
    return { value, label: `${value}. ${marked[2].trim()}` };
  }
  const letter = String.fromCharCode(65 + index);
  return { value: letter, label: `${letter}. ${trimmed}` };
}

function cleanOptions(raw: string[] | undefined): ChoiceOption[] | undefined {
  if (!raw?.length) return undefined;
  const out = raw
    .map((o, i) => cleanOption(o, i))
    .filter((o) => o.label.replace(/^[A-Za-z]{1,4}\.\s*/, "").trim().length > 0);
  return out.length ? out : undefined;
}

/* -------------------------------------------------------------------------- */
/* Gap-text reconstruction                                                    */
/* -------------------------------------------------------------------------- */

/** Dots, ellipses, underscores and spaces — the marker around a gap number. */
const GAP_SEP = "(?:[.\\u2026_\\s]*)";

function locate(text: string, n: number, from: number): { start: number; end: number } | null {
  const re = new RegExp(`${GAP_SEP}(${n})${GAP_SEP}`, "g");
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index >= from) return { start: m.index, end: m.index + m[0].length };
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return null;
}

/**
 * Split a gap blob into one prompt per gap.
 *
 * Each prompt is the run of text since the previous gap, ending in the `___`
 * the renderer turns into an inline input. Returns null if any number cannot be
 * located — a partial split would silently mis-attribute text to the wrong
 * question, which is worse than declining.
 */
export function splitGapPrompts(
  text: string,
  numbers: number[]
): Map<number, string> | null {
  if (!text.trim()) return null;

  const found: { n: number; start: number; end: number }[] = [];
  let cursor = 0;
  for (const n of numbers) {
    const hit = locate(text, n, cursor);
    if (!hit) return null;
    found.push({ n, ...hit });
    cursor = hit.end;
  }

  const prompts = new Map<number, string>();
  found.forEach((g, i) => {
    const from = i === 0 ? 0 : found[i - 1].end;
    const before = text.slice(from, g.start).replace(/\s+/g, " ").trim();
    // The tail after the final gap completes the sentence.
    const tail =
      i === found.length - 1
        ? text.slice(g.end).replace(/\s+/g, " ").trim()
        : "";
    prompts.set(g.n, `${before} ___ ${tail}`.replace(/\s+/g, " ").trim());
  });
  return prompts;
}

/* -------------------------------------------------------------------------- */
/* Passage paragraph labels                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Bracket lettered paragraphs (`"A. By 'glorious'…"` → `"[A] By 'glorious'…"`),
 * which is the marker the passage reader renders in the margin and the only
 * thing a "which paragraph contains…" question can point at.
 *
 * Walks the expected sequence A, B, C… and tolerates an unlettered preamble,
 * because these papers usually open with an unlabelled lead paragraph. Returns
 * the labels it applied so the matching options can be derived from them.
 */
export function labelParagraphs(text: string): {
  text: string;
  letters: string[];
} {
  const paragraphs = text.split(/\n\s*\n/);
  const letters: string[] = [];
  let next = 0; // index into A, B, C…

  const out = paragraphs.map((p) => {
    const trimmed = p.trim();
    const expected = String.fromCharCode(65 + next);
    // "A. Body", "A Body" — but not a sentence that merely starts with "A ".
    const m = trimmed.match(new RegExp(`^${expected}\\s*[.)]\\s+(.+)$`, "s"));
    if (m) {
      letters.push(expected);
      next += 1;
      return `[${expected}] ${m[1]}`;
    }
    return trimmed;
  });

  return { text: out.join("\n\n"), letters };
}

/**
 * Options for a "which paragraph…" group: the passage's own paragraph letters.
 *
 * Falls back to the range printed in the rubric ("has six paragraphs, A-F"),
 * then to the span of letters the answer key actually uses, so a group is only
 * abandoned when nothing at all identifies the choices.
 */
function paragraphOptions(
  instruction: string,
  keys: string[],
  passageLetters: string[]
): ChoiceOption[] | undefined {
  const asOptions = (list: string[]) =>
    list.length ? list.map((l) => ({ value: l, label: l })) : undefined;

  if (passageLetters.length >= 2) return asOptions(passageLetters);

  const stated = instruction.match(/paragraphs?[,\s]+([A-Z])\s*[-–—]\s*([A-Z])/i);
  if (stated) {
    const from = stated[1].toUpperCase().charCodeAt(0);
    const to = stated[2].toUpperCase().charCodeAt(0);
    if (to >= from) {
      return asOptions(
        Array.from({ length: to - from + 1 }, (_, i) =>
          String.fromCharCode(from + i)
        )
      );
    }
  }

  const letters = keys
    .map((k) => k.trim().toUpperCase())
    .filter((k) => /^[A-Z]$/.test(k));
  if (letters.length === 0) return undefined;
  const max = Math.max(...letters.map((l) => l.charCodeAt(0)));
  return asOptions(
    Array.from({ length: max - 64 }, (_, i) => String.fromCharCode(65 + i))
  );
}

/* -------------------------------------------------------------------------- */
/* Word limits                                                                */
/* -------------------------------------------------------------------------- */

function wordLimitFrom(instruction: string): number | undefined {
  const t = instruction.toUpperCase();
  if (/ONE WORD ONLY|ONE WORD AND\/OR A NUMBER/.test(t)) return 1;
  if (/NO MORE THAN TWO WORDS|TWO WORDS AND\/OR A NUMBER/.test(t)) return 2;
  if (/NO MORE THAN THREE WORDS|THREE WORDS AND\/OR A NUMBER/.test(t)) return 3;
  return undefined;
}

/**
 * Strip the paper-based rubric the engine replaces with its own UI: the
 * "Questions 5–9" header it prints from the group range, and the answer-sheet
 * directions, which are meaningless on screen and otherwise bleed into the
 * question prompt when a group has no stem of its own.
 */
function tidyInstruction(raw: string): string {
  return raw
    .replace(/^\s*Questions?\s+\d+\s*(?:[-–—]|and|to)\s*\d*\s*[:.]?\s*/i, "")
    .replace(/\s*Write your answers?\s+in\s+box(?:es)?[^.]*\.?/gi, "")
    .replace(/\s*on your answer sheet\.?/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* Conversion                                                                 */
/* -------------------------------------------------------------------------- */

/** Every answer key in a group, whichever shape it arrived in. */
function keysOf(group: BookGroup): string[] {
  if (Array.isArray(group.questions) && group.questions.length > 0) {
    return group.questions
      .map((q) => q.answer)
      .filter((a): a is string => typeof a === "string")
      .map((a) => a.trim());
  }
  return Object.values(group.answers ?? {})
    .filter((a): a is string => typeof a === "string")
    .map((a) => a.trim());
}

const TFNG_SET = new Set(["TRUE", "FALSE", "NOT GIVEN"]);
const YNNG_SET = new Set(["YES", "NO", "NOT GIVEN"]);

/**
 * Repair the OCR's spelling of a TRUE/FALSE/YES/NO key.
 *
 * "TURE", "FASLE" and the truncated "NOT GIVE" all appear in this source. Left
 * alone they match no option, so the question is unanswerable and the mark
 * unreachable — worth fixing rather than dropping the group over a typo.
 */
export function normalizeVerdictKey(raw: string): string {
  const t = raw.trim().toUpperCase().replace(/\s+/g, " ");
  if (/^(TRUE|TURE|TRUR|TREU)$/.test(t)) return "TRUE";
  if (/^(FALSE|FASLE|FLASE|FALS)$/.test(t)) return "FALSE";
  if (/^(YES|YSE)$/.test(t)) return "YES";
  if (/^NO$/.test(t)) return "NO";
  if (/^NOT ?GIVE?N?$/.test(t)) return "NOT GIVEN";
  return t;
}

/**
 * Trust the answer keys over the declared type for TRUE/FALSE vs YES/NO.
 *
 * The extractor labels both families `true_false_notgiven`, so a group whose
 * keys are YES/NO would have been offered TRUE/FALSE buttons — every answer
 * unselectable and every mark lost.
 */
function resolveType(declared: string, keys: string[]): string {
  const verdicts = keys.map(normalizeVerdictKey);
  const allYN = verdicts.length > 0 && verdicts.every((k) => YNNG_SET.has(k));
  const allTF = verdicts.length > 0 && verdicts.every((k) => TFNG_SET.has(k));

  if (allYN && verdicts.some((k) => k === "YES" || k === "NO")) {
    return "yes_no_not_given";
  }
  if (allTF && verdicts.some((k) => k === "TRUE" || k === "FALSE")) {
    return "true_false_not_given";
  }
  // Declared as a verdict type but the keys are not a verdict vocabulary (or
  // are a mix) — leave it; the option check below will drop it if unanswerable.
  return declared;
}

function convertGroup(
  group: BookGroup,
  where: string,
  passageLetters: string[],
  problems: string[]
): ImportedGroup | null {
  const typeRaw = (group.type ?? "").trim();
  const declared = BOOK_TYPES[typeRaw] ?? BOOK_TYPES[typeRaw.toLowerCase()];
  if (!declared) {
    problems.push(`${where}: неизвестный тип группы "${typeRaw}"`);
    return null;
  }

  const rawKeys = keysOf(group);
  const type = resolveType(declared, rawKeys);

  const instruction = tidyInstruction(group.instruction ?? "");
  const rawInstruction = group.instruction ?? "";
  let sharedOptions = cleanOptions(group.options);

  // "Which paragraph contains…" never ships an option list — the choices are
  // the passage's own paragraph letters.
  if (!sharedOptions && typeRaw === "matching_information") {
    sharedOptions = paragraphOptions(rawInstruction, rawKeys, passageLetters);
  }

  // A stated word limit that the key itself breaks would mark a correct
  // candidate wrong, so the key wins and the limit is dropped.
  let wordLimit = wordLimitFrom(rawInstruction);
  if (
    wordLimit &&
    GAP_TYPES.has(type) &&
    rawKeys.some((k) =>
      expandAnswerKey(k)
        .split("|")
        .some((v) => v.trim().split(/\s+/).filter(Boolean).length > wordLimit!)
    )
  ) {
    wordLimit = undefined;
  }

  const questions: ImportedQuestion[] = [];

  // --- shape A: an explicit question list ---------------------------------
  if (Array.isArray(group.questions) && group.questions.length > 0) {
    for (const q of group.questions) {
      const number = q.number;
      if (typeof number !== "number" || !Number.isInteger(number)) {
        problems.push(`${where}: у вопроса нет номера`);
        continue;
      }
      if (q.answer == null || String(q.answer).trim() === "") {
        problems.push(`${where}: у вопроса ${number} нет ответа`);
        continue;
      }
      const isLetter = LETTER_TYPES.has(type);
      // Options belong only to letter questions, and never to a verdict group:
      // TRUE/FALSE/NOT GIVEN comes from the engine, so a stray A–D list left on
      // one of these would make every verdict answer unselectable.
      const perQuestion =
        isLetter && !isVerdict(type) ? cleanOptions(q.options) : undefined;
      const prompt = (q.text ?? "").replace(/\s+/g, " ").trim();
      if (!prompt) {
        problems.push(`${where}: у вопроса ${number} пустой текст`);
        continue;
      }
      questions.push({
        number,
        prompt: GAP_TYPES.has(type) ? ensureGapMarker(prompt) : prompt,
        answer: isVerdict(type)
          ? normalizeVerdictKey(String(q.answer))
          : isLetter
            ? String(q.answer).trim()
            : expandAnswerKey(String(q.answer)),
        options: perQuestion,
        wordLimit: GAP_TYPES.has(type) ? wordLimit : undefined,
      });
    }
  }

  // --- shape B: a number → key map plus a gap blob -------------------------
  else if (group.answers && Object.keys(group.answers).length > 0) {
    const numbers = Object.keys(group.answers)
      .map(Number)
      .filter((n) => Number.isInteger(n))
      .sort((a, b) => a - b);

    for (const n of numbers) {
      if (group.answers[String(n)] == null) {
        problems.push(`${where}: у вопроса ${n} нет ответа`);
      }
    }

    if (type === "mcq_multi") {
      // "Choose THREE letters" is ONE item worth one mark per letter, marked
      // without regard to order — not three independent single-answer items.
      const keys = numbers
        .map((n) => group.answers![String(n)])
        .filter((v): v is string => typeof v === "string" && v.trim() !== "")
        .map((v) => v.trim());
      if (keys.length !== numbers.length) return null;
      const stem = (group.question_text ?? instruction).replace(/\s+/g, " ").trim();
      questions.push({
        number: numbers[0],
        numberTo: numbers[numbers.length - 1],
        prompt: stem || `Выберите ${keys.length} варианта(ов).`,
        answer: keys,
        selectCount: keys.length,
      });
    } else if (LETTER_TYPES.has(type)) {
      const stem = (group.question_text ?? "").replace(/\s+/g, " ").trim();
      for (const n of numbers) {
        const key = group.answers[String(n)];
        if (key == null) continue;
        questions.push({
          number: n,
          prompt: stem || instruction || `Вопрос ${n}`,
          answer: isVerdict(type)
            ? normalizeVerdictKey(String(key))
            : String(key).trim(),
        });
      }
    } else {
      // Typed answers: the prompt has to come from the gap blob.
      const prompts = splitGapPrompts(group.text_with_gaps ?? "", numbers);
      if (!prompts) {
        problems.push(
          `${where}: не удалось восстановить текст пропусков для вопросов ${numbers[0]}–${numbers[numbers.length - 1]} (повреждён при распознавании)`
        );
        return null;
      }
      for (const n of numbers) {
        const key = group.answers[String(n)];
        if (key == null) continue;
        questions.push({
          number: n,
          prompt: ensureGapMarker(prompts.get(n) ?? ""),
          answer: expandAnswerKey(String(key)),
          wordLimit,
        });
      }
    }
  }

  if (questions.length === 0) return null;

  // A letter question is only answerable if every key is on offer. The source
  // loses option lines to OCR often enough that this has to be checked here:
  // otherwise the paper ships with marks no candidate can earn.
  if (LETTER_TYPES.has(type) && type !== "true_false_not_given" && type !== "yes_no_not_given") {
    for (const q of questions) {
      const offered = (q.options ?? sharedOptions ?? []).map((o) =>
        (typeof o === "string" ? o : o.value).toUpperCase()
      );
      if (offered.length === 0) {
        problems.push(
          `${where}: у вопроса ${q.number} нет вариантов ответа (список потерян при распознавании)`
        );
        return null;
      }
      const wanted = (Array.isArray(q.answer) ? q.answer : [q.answer]).map((a) =>
        String(a).trim().toUpperCase()
      );
      const missing = wanted.filter((w) => !offered.includes(w));
      if (missing.length > 0) {
        problems.push(
          `${where}: ответ ${missing.join(", ")} на вопрос ${q.number} отсутствует среди вариантов (${offered.join(", ")})`
        );
        return null;
      }
    }
  }

  return {
    type,
    instructions: instruction || undefined,
    wordLimit: GAP_TYPES.has(type) ? wordLimit : undefined,
    // Only non-verdict letter questions carry options. Leaving a stray list on
    // a typed group makes the validator check every word answer against it, so
    // the whole group reads as wrong.
    options: LETTER_TYPES.has(type) && !isVerdict(type) ? sharedOptions : undefined,
    questions,
  };
}

/** A gap question with no visible blank reads as a statement; add one. */
function ensureGapMarker(prompt: string): string {
  const normalised = prompt
    .replace(/[.…]{3,}/g, "___")
    .replace(/_{3,}/g, "___");
  return normalised.includes("___") ? normalised : `${normalised} ___`.trim();
}

/**
 * Renumber every question 1..N in passage order, preserving the width of
 * multi-mark items (a "choose TWO" keeps its two-number span).
 */
function renumberSequentially(passages: ImportedPassage[]): void {
  let next = 1;
  for (const p of passages) {
    for (const g of p.groups) {
      g.questions.sort((a, b) => a.number - b.number);
      for (const q of g.questions) {
        const width = q.numberTo ? q.numberTo - q.number + 1 : 1;
        q.number = next;
        q.numberTo = width > 1 ? next + width - 1 : undefined;
        next += width;
      }
    }
  }
}

export interface AdaptedBookPaper {
  testNumber: number;
  paper: ImportedPaper;
  /** Marks the paper is worth once damaged groups have been dropped. */
  marks: number;
  /** Groups omitted because the source was unusable, with the reason. */
  dropped: string[];
}

export interface BookAdaptResult {
  papers: AdaptedBookPaper[];
  /** Tests with nothing usable left at all. */
  rejected: { testNumber: number; problems: string[] }[];
}

/**
 * Convert every test in the collection.
 *
 * Groups whose source is damaged beyond repair are DROPPED rather than guessed
 * at, and reported in `dropped`. The paper is still returned with its reduced
 * mark total: every question that survives is answerable and marked correctly,
 * and the engine scales a short paper to its /40 band equivalent. Deciding
 * whether a given paper is complete enough to publish is the caller's call.
 */
export function adaptBookCollection(raw: unknown): BookAdaptResult {
  const papers: AdaptedBookPaper[] = [];
  const rejected: BookAdaptResult["rejected"] = [];

  if (!isBookCollection(raw)) {
    return { papers, rejected: [{ testNumber: 0, problems: ["Не формат книги."] }] };
  }

  const tests = (raw as BookCollection).tests ?? [];

  tests.forEach((test, ti) => {
    const testNumber = test.test_number ?? ti + 1;
    const problems: string[] = [];
    const passages: ImportedPassage[] = [];

    (test.sections ?? []).forEach((section, si) => {
      const where = `тест ${testNumber}, секция ${section.section ?? si + 1}`;
      const raw = (section.passage_text ?? "").trim();
      if (raw.length < 50) {
        problems.push(`${where}: слишком короткий текст пассажа`);
      }
      const { text, letters } = labelParagraphs(raw);

      const groups: ImportedGroup[] = [];
      for (const g of section.question_groups ?? []) {
        const converted = convertGroup(
          g,
          `${where}, ${g.questions_range ?? "?"}`,
          letters,
          problems
        );
        if (converted) groups.push(converted);
      }
      if (groups.length === 0) return;

      passages.push({
        number: section.section ?? si + 1,
        title: (section.passage_title ?? `Passage ${si + 1}`).trim(),
        text,
        groups,
      });
    });

    if (passages.length === 0) {
      rejected.push({
        testNumber,
        problems: problems.length ? problems : ["не удалось собрать ни одного пассажа"],
      });
      return;
    }

    // Dropping a group leaves a hole in the numbering (…7, then 14…). Close it
    // so the paper reads as a coherent 1..N: nothing else references the
    // original numbers — the gap prompts have theirs stripped and the passage
    // text never cites them.
    renumberSequentially(passages);

    const marks = passages.reduce(
      (n, p) =>
        n +
        p.groups.reduce(
          (m, g) =>
            m +
            g.questions.reduce(
              (k, q) => k + (Array.isArray(q.answer) ? q.answer.length : 1),
              0
            ),
          0
        ),
      0
    );

    papers.push({
      testNumber,
      marks,
      dropped: problems,
      paper: {
        id: `ielts-reading-practice-${String(testNumber).padStart(2, "0")}`,
        title: `IELTS Reading Practice Test ${testNumber}`,
        module: "reading",
        durationMinutes: 60,
        // Shown under the title in the runner. A short paper says so, rather
        // than presenting itself as a full 40-question test.
        attribution:
          marks === 40
            ? "IELTSMaterial Publishing · AI-generated practice set"
            : `IELTSMaterial Publishing · восстановлено ${marks} из 40 вопросов`,
        passages,
      },
    });
  });

  return { papers, rejected };
}

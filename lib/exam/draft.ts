/**
 * Conversion from the admin form's flat shape into an `ExamSectionFull`.
 *
 * Pure and side-effect free, so both the browser (live preview) and the API
 * route (validation before saving) run exactly the same logic.
 */

import type {
  ChoiceOption,
  ExamQuestionFull,
  ExamSectionFull,
  QuestionGroup,
  QuestionType,
} from "./types";

/** Types the builder can produce. A subset of what the engine renders. */
export type DraftQuestionType =
  | "true_false_not_given"
  | "yes_no_not_given"
  | "gap_fill"
  | "mcq_single";

export interface DraftQuestion {
  /** Local key for React lists; not persisted. */
  key: string;
  type: DraftQuestionType;
  prompt: string;
  answer: string;
  /** One option per line, e.g. "A. First choice". */
  optionsText: string;
  explanation: string;
}

export interface DraftPaper {
  id: string;
  title: string;
  passageTitle: string;
  passageSubtitle: string;
  passageText: string;
  durationMinutes: number;
  attribution: string;
  /** Word limit applied to gap-fill groups. */
  wordLimit: number;
  questions: DraftQuestion[];
}

export const QUESTION_TYPE_LABELS: Record<DraftQuestionType, string> = {
  true_false_not_given: "True / False / Not Given",
  yes_no_not_given: "Yes / No / Not Given",
  gap_fill: "Ввод слова (Notes completion)",
  mcq_single: "Выбор варианта (A, B, C, D)",
};

const TFNG_OPTIONS: ChoiceOption[] = [
  { value: "TRUE", label: "TRUE" },
  { value: "FALSE", label: "FALSE" },
  { value: "NOT GIVEN", label: "NOT GIVEN" },
];

const YNNG_OPTIONS: ChoiceOption[] = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
  { value: "NOT GIVEN", label: "NOT GIVEN" },
];

const DEFAULT_INSTRUCTIONS: Record<DraftQuestionType, string> = {
  true_false_not_given:
    "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
  yes_no_not_given:
    "Do the following statements agree with the claims of the writer? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
  gap_fill: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
  mcq_single: "Choose the correct letter, A, B, C or D.",
};

/** Parse "A. Something" lines into options; falls back to letters A, B, C… */
export function parseOptions(text: string): ChoiceOption[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const match = line.match(/^([A-Za-z])[.)]\s*(.+)$/);
      if (match) {
        return { value: match[1].toUpperCase(), label: line };
      }
      const letter = String.fromCharCode(65 + i);
      return { value: letter, label: `${letter}. ${line}` };
    });
}

export interface ValidationIssue {
  /** Question number, or null for a paper-level problem. */
  number: number | null;
  message: string;
}

export function validateDraft(draft: DraftPaper): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!draft.title.trim()) {
    issues.push({ number: null, message: "Укажите название теста." });
  }
  if (!draft.passageTitle.trim()) {
    issues.push({ number: null, message: "Укажите заголовок пассажа." });
  }
  if (draft.passageText.trim().length < 200) {
    issues.push({
      number: null,
      message: "Текст пассажа слишком короткий — вставьте полный текст.",
    });
  }
  if (draft.questions.length === 0) {
    issues.push({ number: null, message: "Добавьте хотя бы один вопрос." });
  }

  draft.questions.forEach((q, i) => {
    const n = i + 1;
    if (!q.prompt.trim()) {
      issues.push({ number: n, message: "Пустой текст вопроса." });
    }
    if (!q.answer.trim()) {
      issues.push({ number: n, message: "Не указан правильный ответ." });
      return;
    }

    if (q.type === "true_false_not_given") {
      const valid = TFNG_OPTIONS.map((o) => o.value);
      if (!valid.includes(q.answer.trim().toUpperCase())) {
        issues.push({
          number: n,
          message: "Ответ должен быть TRUE, FALSE или NOT GIVEN.",
        });
      }
    }

    if (q.type === "yes_no_not_given") {
      const valid = YNNG_OPTIONS.map((o) => o.value);
      if (!valid.includes(q.answer.trim().toUpperCase())) {
        issues.push({
          number: n,
          message: "Ответ должен быть YES, NO или NOT GIVEN.",
        });
      }
    }

    if (q.type === "mcq_single") {
      const options = parseOptions(q.optionsText);
      if (options.length < 2) {
        issues.push({ number: n, message: "Добавьте минимум два варианта." });
      } else if (
        !options.some(
          (o) => o.value === q.answer.trim().toUpperCase().replace(/[.)]$/, "")
        )
      ) {
        issues.push({
          number: n,
          message: `Ответ «${q.answer}» не совпадает ни с одним вариантом.`,
        });
      }
    }

    if (q.type === "gap_fill") {
      // Answers use "|" for interchangeable variants, so check each separately.
      const overLimit = q.answer
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean)
        .some((v) => v.split(/\s+/).length > draft.wordLimit);
      if (overLimit) {
        issues.push({
          number: n,
          message: `Ответ длиннее лимита в ${draft.wordLimit} сл. — студент не сможет его засчитать.`,
        });
      }
      if (!draft.passageText.toLowerCase().includes(
        q.answer.split("|")[0].trim().toLowerCase()
      )) {
        issues.push({
          number: n,
          message: `Слова «${q.answer.split("|")[0].trim()}» нет в тексте пассажа.`,
        });
      }
    }
  });

  return issues;
}

function optionsFor(q: DraftQuestion): ChoiceOption[] | undefined {
  if (q.type === "true_false_not_given") return TFNG_OPTIONS;
  if (q.type === "yes_no_not_given") return YNNG_OPTIONS;
  if (q.type === "mcq_single") return parseOptions(q.optionsText);
  return undefined;
}

const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ә: "a", ғ: "g", қ: "q", ң: "ng", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
};

/**
 * Build a filename-safe id.
 *
 * Cyrillic is transliterated rather than stripped: without this, a Russian or
 * Kazakh title reduces to nothing and every paper would collide on the same
 * fallback id.
 */
function slugify(input: string): string {
  const latin = input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in CYRILLIC_MAP ? CYRILLIC_MAP[ch] : ch))
    .join("");
  return (
    latin
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `paper-${Date.now().toString(36)}`
  );
}

/**
 * Build the engine payload.
 *
 * Consecutive questions of the same type become one group, which is how a real
 * paper reads — a single instruction line over a run of questions.
 */
export function draftToSection(draft: DraftPaper): ExamSectionFull {
  const groups: QuestionGroup<ExamQuestionFull>[] = [];

  draft.questions.forEach((q, i) => {
    const number = i + 1;
    const question: ExamQuestionFull = {
      id: `q${number}`,
      number,
      prompt: q.prompt.trim(),
      answer:
        q.type === "gap_fill"
          ? q.answer.trim()
          : q.answer.trim().toUpperCase(),
      explanation: q.explanation.trim() || undefined,
      options: q.type === "mcq_single" ? optionsFor(q) : undefined,
    };

    const last = groups[groups.length - 1];
    if (last && last.type === (q.type as QuestionType)) {
      last.questions.push(question);
      last.to = number;
      return;
    }

    groups.push({
      id: `g${groups.length + 1}`,
      type: q.type as QuestionType,
      from: number,
      to: number,
      instructions: DEFAULT_INSTRUCTIONS[q.type],
      wordLimit: q.type === "gap_fill" ? draft.wordLimit : undefined,
      options: q.type === "mcq_single" ? undefined : optionsFor(q),
      intro: q.type === "gap_fill" ? draft.passageTitle.trim() : undefined,
      questions: [question],
    });
  });

  return {
    id: draft.id.trim() || slugify(draft.title),
    skill: "reading",
    title: draft.title.trim(),
    durationMinutes: draft.durationMinutes,
    attribution: draft.attribution.trim(),
    passages: [
      {
        id: "p1",
        number: 1,
        title: draft.passageTitle.trim(),
        subtitle: draft.passageSubtitle.trim() || undefined,
        text: draft.passageText.trim(),
        groups,
      },
    ],
  };
}

/**
 * Split a pasted block of numbered lines into question prompts.
 * Accepts "1. Statement", "1) Statement" or one statement per line.
 */
export function parsePastedQuestions(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+\s*[.)]\s*/, "").trim())
    .filter(Boolean);
}

/** Split a pasted answer key ("1. TRUE" per line) into answers in order. */
export function parsePastedAnswers(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+\s*[.)]\s*/, "").trim())
    .filter(Boolean);
}

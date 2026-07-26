/**
 * Import format for an IELTS test paper, and its validator.
 *
 * The wire format is deliberately friendlier than the engine's internal shape:
 * question types accept short aliases (`true_false_ng`, `multiple_choice`,
 * `completion`), options may be plain strings, and per-group instructions are
 * optional with sensible defaults. `validateImport` reports every problem with
 * a JSON path so the admin UI can point at the offending field, then hands back
 * a normalised `ExamSectionFull` the engine can serve unchanged.
 */

import type {
  ChoiceOption,
  ExamQuestionFull,
  ExamSectionFull,
  QuestionGroup,
  QuestionType,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Wire format                                                                */
/* -------------------------------------------------------------------------- */

export interface ImportedQuestion {
  number: number;
  /** Range end when one item is worth several marks ("choose TWO letters"). */
  numberTo?: number;
  prompt: string;
  /** Accepted answer(s). Use `|` for interchangeable variants. */
  answer: string | string[];
  options?: (string | ChoiceOption)[];
  explanation?: string;
  wordLimit?: number;
  selectCount?: number;
}

export interface ImportedGroup {
  type: string;
  instructions?: string;
  wordLimit?: number;
  optionsTitle?: string;
  options?: (string | ChoiceOption)[];
  intro?: string;
  diagram?: { id: string; title: string; caption?: string };
  questions: ImportedQuestion[];
}

export interface ImportedPassage {
  /** 1-based position; defaults to array order. */
  number?: number;
  title: string;
  subtitle?: string;
  /** Body text. Paragraphs separated by a blank line; `[A]` marks a letter. */
  text?: string;
  audioUrl?: string;
  transcript?: string;
  groups: ImportedGroup[];
}

export interface ImportedPaper {
  id?: string;
  title: string;
  module: string;
  durationMinutes?: number;
  attribution?: string;
  passages: ImportedPassage[];
}

/* -------------------------------------------------------------------------- */
/* Aliases                                                                    */
/* -------------------------------------------------------------------------- */

/** Import aliases → engine question types. */
const TYPE_ALIASES: Record<string, QuestionType> = {
  true_false_ng: "true_false_not_given",
  true_false_not_given: "true_false_not_given",
  tfng: "true_false_not_given",
  yes_no_ng: "yes_no_not_given",
  yes_no_not_given: "yes_no_not_given",
  ynng: "yes_no_not_given",
  multiple_choice: "mcq_single",
  mcq: "mcq_single",
  mcq_single: "mcq_single",
  multiple_choice_multi: "mcq_multi",
  mcq_multi: "mcq_multi",
  matching_headings: "matching_headings",
  headings: "matching_headings",
  matching: "matching",
  matching_features: "matching",
  completion: "gap_fill",
  gap_fill: "gap_fill",
  notes_completion: "gap_fill",
  summary_completion: "gap_fill",
  sentence_endings: "sentence_endings",
  short_answer: "short_answer",
  labelling: "labelling",
  diagram_labelling: "labelling",
  map_labelling: "labelling",
};

const MODULE_ALIASES: Record<string, "reading" | "listening"> = {
  reading: "reading",
  Reading: "reading",
  listening: "listening",
  Listening: "listening",
};

export const SUPPORTED_TYPES = Object.keys(TYPE_ALIASES);

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

const DEFAULT_INSTRUCTIONS: Partial<Record<QuestionType, string>> = {
  true_false_not_given:
    "Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.",
  yes_no_not_given:
    "Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.",
  gap_fill: "Complete the notes below using words from the passage.",
  mcq_single: "Choose the correct letter, A, B, C or D.",
  mcq_multi: "Choose TWO letters.",
  matching_headings:
    "Choose the correct heading for each paragraph from the list below.",
  matching: "Match each statement with the correct option from the list below.",
  sentence_endings: "Complete each sentence with the correct ending.",
  short_answer: "Answer the questions below using words from the passage.",
  labelling: "Label the diagram below.",
};

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export interface ImportIssue {
  /** JSON path, e.g. `passages[0].groups[1].questions[2].answer`. */
  path: string;
  message: string;
}

export interface ImportResult {
  ok: boolean;
  issues: ImportIssue[];
  section?: ExamSectionFull;
  /** Totals for the confirmation summary. */
  summary?: {
    title: string;
    skill: "reading" | "listening";
    passages: number;
    questions: number;
    marks: number;
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
    щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  const latin = input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in map ? map[ch] : ch))
    .join("");
  return (
    latin
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `paper-${Date.now().toString(36)}`
  );
}

/** A bare token that is its own answer key: TRUE, NOT GIVEN, YES, i, iv… */
function isSelfLabelling(value: string): boolean {
  const t = value.trim();
  if (!t || t.length > 12) return false;
  // All-caps words (TRUE / NOT GIVEN) or a lone roman numeral.
  return /^[A-Z][A-Z ]*$/.test(t) || /^[ivxlcdm]+$/i.test(t);
}

function normalizeOptions(
  raw: (string | ChoiceOption)[] | undefined
): ChoiceOption[] | undefined {
  if (!raw?.length) return undefined;
  return raw.map((o, i) => {
    if (typeof o !== "string") return o;
    const trimmed = o.trim();
    // "A. Something" / "iv. Something" keeps its marker as the stored value.
    const match = trimmed.match(/^([A-Za-z]|[ivxlcdm]+)[.)]\s*(.+)$/);
    if (match) return { value: match[1], label: trimmed };
    // "TRUE" is already the answer key — assigning it a letter would break the
    // match against the key, so keep it verbatim.
    if (isSelfLabelling(trimmed)) return { value: trimmed, label: trimmed };
    const letter = String.fromCharCode(65 + i);
    return { value: letter, label: `${letter}. ${trimmed}` };
  });
}

function marksOf(answer: string | string[]): number {
  return Array.isArray(answer) ? answer.length : 1;
}

/**
 * Validate and normalise an uploaded paper.
 *
 * Never throws: any structural problem becomes an issue with a path, so the
 * UI can show all of them at once instead of failing on the first.
 */
export function validateImport(raw: unknown): ImportResult {
  const issues: ImportIssue[] = [];
  const push = (path: string, message: string) => issues.push({ path, message });

  if (!isObject(raw)) {
    return {
      ok: false,
      issues: [{ path: "", message: "Файл должен содержать JSON-объект." }],
    };
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) push("title", "Обязательное поле: название теста.");

  const moduleRaw =
    typeof raw.module === "string"
      ? raw.module
      : typeof raw.skill === "string"
        ? raw.skill
        : "";
  const skill = MODULE_ALIASES[moduleRaw.trim()] ?? MODULE_ALIASES[moduleRaw.trim().toLowerCase()];
  if (!skill) {
    push(
      "module",
      'Модуль должен быть "Reading" или "Listening" (получено: ' +
        (moduleRaw ? `"${moduleRaw}"` : "пусто") +
        ").")
    ;
  }

  const duration =
    typeof raw.durationMinutes === "number" ? raw.durationMinutes : undefined;
  if (duration !== undefined && (duration < 1 || duration > 240)) {
    push("durationMinutes", "Длительность должна быть от 1 до 240 минут.");
  }

  if (!Array.isArray(raw.passages) || raw.passages.length === 0) {
    push("passages", "Нужен хотя бы один пассаж или секция.");
    return { ok: false, issues };
  }

  const passages: ExamSectionFull["passages"] = [];
  const seenNumbers = new Map<number, string>();
  let totalMarks = 0;
  let totalQuestions = 0;

  raw.passages.forEach((rawPassage, pi) => {
    const pPath = `passages[${pi}]`;
    if (!isObject(rawPassage)) {
      push(pPath, "Пассаж должен быть объектом.");
      return;
    }

    const pTitle =
      typeof rawPassage.title === "string" ? rawPassage.title.trim() : "";
    if (!pTitle) push(`${pPath}.title`, "У пассажа нет заголовка.");

    const text = typeof rawPassage.text === "string" ? rawPassage.text : "";
    const audioUrl =
      typeof rawPassage.audioUrl === "string" ? rawPassage.audioUrl : undefined;

    // Reading needs a body; listening needs audio (or at least a transcript).
    if (skill === "reading" && text.trim().length < 50) {
      push(`${pPath}.text`, "Для Reading нужен текст пассажа (минимум 50 символов).");
    }
    if (skill === "listening" && !audioUrl && !rawPassage.transcript) {
      push(
        `${pPath}.audioUrl`,
        "Для Listening нужна ссылка на аудио либо транскрипт."
      );
    }

    if (!Array.isArray(rawPassage.groups) || rawPassage.groups.length === 0) {
      push(`${pPath}.groups`, "В пассаже нет групп вопросов.");
      return;
    }

    const groups: QuestionGroup<ExamQuestionFull>[] = [];

    rawPassage.groups.forEach((rawGroup, gi) => {
      const gPath = `${pPath}.groups[${gi}]`;
      if (!isObject(rawGroup)) {
        push(gPath, "Группа должна быть объектом.");
        return;
      }

      const typeRaw = typeof rawGroup.type === "string" ? rawGroup.type.trim() : "";
      const type = TYPE_ALIASES[typeRaw] ?? TYPE_ALIASES[typeRaw.toLowerCase()];
      if (!type) {
        push(
          `${gPath}.type`,
          `Неизвестный тип вопросов "${typeRaw}". Допустимые: ${SUPPORTED_TYPES.slice(0, 8).join(", ")} и другие.`
        );
        return;
      }

      if (!Array.isArray(rawGroup.questions) || rawGroup.questions.length === 0) {
        push(`${gPath}.questions`, "В группе нет вопросов.");
        return;
      }

      const sharedOptions =
        normalizeOptions(rawGroup.options as (string | ChoiceOption)[]) ??
        (type === "true_false_not_given"
          ? TFNG_OPTIONS
          : type === "yes_no_not_given"
            ? YNNG_OPTIONS
            : undefined);

      const questions: ExamQuestionFull[] = [];

      rawGroup.questions.forEach((rawQ, qi) => {
        const qPath = `${gPath}.questions[${qi}]`;
        if (!isObject(rawQ)) {
          push(qPath, "Вопрос должен быть объектом.");
          return;
        }

        const number = typeof rawQ.number === "number" ? rawQ.number : NaN;
        if (!Number.isInteger(number) || number < 1) {
          push(`${qPath}.number`, "Номер вопроса должен быть целым числом ≥ 1.");
          return;
        }

        const prompt = typeof rawQ.prompt === "string" ? rawQ.prompt.trim() : "";
        if (!prompt) push(`${qPath}.prompt`, "Пустой текст вопроса.");

        const answerRaw = rawQ.answer;
        const answer: string | string[] | null = Array.isArray(answerRaw)
          ? answerRaw.filter((a): a is string => typeof a === "string")
          : typeof answerRaw === "string"
            ? answerRaw
            : null;
        if (answer === null || (Array.isArray(answer) && answer.length === 0)) {
          push(`${qPath}.answer`, "Не указан правильный ответ.");
          return;
        }

        const numberTo =
          typeof rawQ.numberTo === "number" ? rawQ.numberTo : undefined;
        const span = marksOf(answer);
        if (Array.isArray(answer) && span > 1 && numberTo === undefined) {
          push(
            `${qPath}.numberTo`,
            `Ответ содержит ${span} вариантов — укажите numberTo (${number + span - 1}), иначе нумерация разъедется.`
          );
        }
        if (numberTo !== undefined && numberTo - number + 1 !== span) {
          push(
            `${qPath}.numberTo`,
            `numberTo не согласуется с числом ответов: диапазон ${number}–${numberTo} требует ${numberTo - number + 1} ответов, указано ${span}.`
          );
        }

        // Duplicate numbers across the whole paper break scoring silently.
        for (let n = number; n <= (numberTo ?? number); n++) {
          const prior = seenNumbers.get(n);
          if (prior) {
            push(`${qPath}.number`, `Номер ${n} уже использован в ${prior}.`);
          } else {
            seenNumbers.set(n, qPath);
          }
        }

        const perQuestionOptions = normalizeOptions(
          rawQ.options as (string | ChoiceOption)[]
        );
        const options = perQuestionOptions ?? sharedOptions;

        // A choice question with no options is unanswerable.
        const needsOptions: QuestionType[] = [
          "mcq_single",
          "mcq_multi",
          "matching",
          "matching_headings",
          "sentence_endings",
          "labelling",
          "true_false_not_given",
          "yes_no_not_given",
        ];
        if (needsOptions.includes(type) && !options?.length) {
          push(
            `${qPath}.options`,
            `Для типа "${type}" нужны варианты ответа — в группе или в самом вопросе.`
          );
        }

        // The key must match one of the offered options.
        if (options?.length) {
          const values = options.map((o) => o.value.toUpperCase());
          const keys = (Array.isArray(answer) ? answer : [answer]).flatMap((a) =>
            a.split("|").map((v) => v.trim().toUpperCase())
          );
          const unmatched = keys.filter((k) => !values.includes(k));
          if (unmatched.length) {
            push(
              `${qPath}.answer`,
              `Ответ ${unmatched.map((u) => `"${u}"`).join(", ")} не совпадает ни с одним вариантом (${values.join(", ")}).`
            );
          }
        }

        const wordLimit =
          typeof rawQ.wordLimit === "number" ? rawQ.wordLimit : undefined;
        const groupLimit =
          typeof rawGroup.wordLimit === "number" ? rawGroup.wordLimit : undefined;
        const effectiveLimit = wordLimit ?? groupLimit;
        if (
          effectiveLimit &&
          typeof answer === "string" &&
          answer
            .split("|")
            .some((v) => v.trim().split(/\s+/).length > effectiveLimit)
        ) {
          push(
            `${qPath}.answer`,
            `Ответ длиннее лимита в ${effectiveLimit} сл. — студент не сможет его засчитать.`
          );
        }

        questions.push({
          id: `p${pi + 1}q${number}`,
          number,
          numberTo,
          prompt,
          answer,
          explanation:
            typeof rawQ.explanation === "string" ? rawQ.explanation : undefined,
          options: perQuestionOptions,
          wordLimit,
          selectCount:
            typeof rawQ.selectCount === "number"
              ? rawQ.selectCount
              : Array.isArray(answer) && answer.length > 1
                ? answer.length
                : undefined,
        });
        totalQuestions += 1;
        totalMarks += span;
      });

      if (questions.length === 0) return;

      const numbers = questions.flatMap((q) => [q.number, q.numberTo ?? q.number]);
      groups.push({
        id: `p${pi + 1}g${gi + 1}`,
        type,
        from: Math.min(...numbers),
        to: Math.max(...numbers),
        instructions:
          typeof rawGroup.instructions === "string" && rawGroup.instructions.trim()
            ? rawGroup.instructions.trim()
            : (DEFAULT_INSTRUCTIONS[type] ?? "Ответьте на вопросы ниже."),
        wordLimit:
          typeof rawGroup.wordLimit === "number" ? rawGroup.wordLimit : undefined,
        optionsTitle:
          typeof rawGroup.optionsTitle === "string"
            ? rawGroup.optionsTitle
            : undefined,
        options: sharedOptions,
        intro: typeof rawGroup.intro === "string" ? rawGroup.intro : undefined,
        diagram: isObject(rawGroup.diagram)
          ? (rawGroup.diagram as { id: string; title: string; caption?: string })
          : undefined,
        questions,
      });
    });

    if (groups.length === 0) return;

    passages.push({
      id: `p${pi + 1}`,
      number:
        typeof rawPassage.number === "number" ? rawPassage.number : pi + 1,
      title: pTitle,
      subtitle:
        typeof rawPassage.subtitle === "string" ? rawPassage.subtitle : undefined,
      text,
      audioUrl,
      transcript:
        typeof rawPassage.transcript === "string"
          ? rawPassage.transcript
          : undefined,
      groups,
    });
  });

  if (passages.length === 0) {
    push("passages", "Ни один пассаж не прошёл проверку.");
  }

  // Numbering should be a contiguous run from 1 — a gap usually means a typo.
  if (seenNumbers.size > 0) {
    const sorted = Array.from(seenNumbers.keys()).sort((a, b) => a - b);
    const gaps: number[] = [];
    for (let n = 1; n <= sorted[sorted.length - 1]; n++) {
      if (!seenNumbers.has(n)) gaps.push(n);
    }
    if (sorted[0] !== 1) {
      push("passages", `Нумерация начинается с ${sorted[0]}, а не с 1.`);
    }
    if (gaps.length) {
      push(
        "passages",
        `Пропущены номера: ${gaps.slice(0, 10).join(", ")}${gaps.length > 10 ? "…" : ""}.`
      );
    }
  }

  if (issues.length > 0 || !skill) return { ok: false, issues };

  const id =
    typeof raw.id === "string" && raw.id.trim() ? slugify(raw.id) : slugify(title);

  return {
    ok: true,
    issues: [],
    section: {
      id,
      skill,
      title,
      durationMinutes: duration ?? (skill === "listening" ? 30 : 60),
      attribution:
        typeof raw.attribution === "string" && raw.attribution.trim()
          ? raw.attribution.trim()
          : "Импортированный материал центра",
      passages,
    },
    summary: {
      title,
      skill,
      passages: passages.length,
      questions: totalQuestions,
      marks: totalMarks,
    },
  };
}

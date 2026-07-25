/**
 * SERVER ONLY — builds targeted drills from the paper catalogue.
 *
 * A drill is a synthetic `ExamSection` that keeps only the question groups of
 * one type, pulled from every paper, together with the passages they belong to.
 * It is assembled deterministically, so the submit route can rebuild the exact
 * same drill from its id and mark it without storing anything.
 */

import { EXAM_SECTIONS } from "./papers";
import type {
  ExamPassage,
  ExamQuestionFull,
  ExamSectionFull,
  QuestionGroup,
  QuestionType,
} from "./types";

export const DRILL_ID_PREFIX = "drill:";

export interface DrillTypeMeta {
  type: QuestionType;
  label: string;
  ru: string;
  blurb: string;
}

/** Presentation for every drillable type, in the order they appear on a paper. */
export const DRILL_TYPES: DrillTypeMeta[] = [
  {
    type: "true_false_not_given",
    label: "True / False / Not Given",
    ru: "Верно / Неверно / Не сказано",
    blurb:
      "Отличать противоречие тексту от отсутствия информации — самая частая потеря баллов.",
  },
  {
    type: "yes_no_not_given",
    label: "Yes / No / Not Given",
    ru: "Согласие с мнением автора",
    blurb: "То же различие, но про взгляды автора, а не про факты.",
  },
  {
    type: "matching_headings",
    label: "Matching Headings",
    ru: "Подбор заголовков",
    blurb: "Определять главную мысль абзаца и не поддаваться на слова-ловушки.",
  },
  {
    type: "gap_fill",
    label: "Notes / Summary Completion",
    ru: "Заполнение пропусков",
    blurb: "Точное слово из текста и строгое соблюдение лимита слов.",
  },
  {
    type: "mcq_single",
    label: "Multiple Choice",
    ru: "Выбор одного варианта",
    blurb: "Отсекать похожие, но неточные варианты.",
  },
  {
    type: "mcq_multi",
    label: "Multiple Choice (несколько)",
    ru: "Выбор нескольких вариантов",
    blurb: "Задания на две буквы: каждая верная буква приносит балл.",
  },
  {
    type: "matching",
    label: "Matching Features",
    ru: "Сопоставление",
    blurb: "Соотносить утверждения с людьми, теориями или разделами текста.",
  },
  {
    type: "sentence_endings",
    label: "Sentence Endings",
    ru: "Завершение предложений",
    blurb: "Держать в голове и смысл, и грамматику продолжения.",
  },
  {
    type: "labelling",
    label: "Diagram / Map Labelling",
    ru: "Схемы и карты",
    blurb: "Переводить описание в пространственную картинку.",
  },
  {
    type: "short_answer",
    label: "Short Answer",
    ru: "Короткий ответ",
    blurb: "Отвечать на вопрос словами из текста в рамках лимита.",
  },
];

export interface DrillSummary extends DrillTypeMeta {
  /** Marks available across the catalogue. */
  questions: number;
  /** How many passages the questions are spread over. */
  passages: number;
  minutes: number;
}

function marksIn(group: QuestionGroup<ExamQuestionFull>): number {
  return group.questions.reduce(
    (n, q) => n + (Array.isArray(q.answer) ? q.answer.length : 1),
    0
  );
}

/** Roughly a minute and a quarter per mark, which matches exam pacing. */
function minutesFor(marks: number): number {
  return Math.max(5, Math.round((marks * 1.25) / 5) * 5);
}

/** Every drill that currently has material, with its size. */
export function listDrills(): DrillSummary[] {
  return DRILL_TYPES.map((meta) => {
    let questions = 0;
    let passages = 0;
    for (const paper of Object.values(EXAM_SECTIONS)) {
      for (const passage of paper.passages) {
        const groups = passage.groups.filter((g) => g.type === meta.type);
        if (groups.length === 0) continue;
        passages += 1;
        questions += groups.reduce((n, g) => n + marksIn(g), 0);
      }
    }
    return { ...meta, questions, passages, minutes: minutesFor(questions) };
  }).filter((d) => d.questions > 0);
}

export function drillMeta(type: string): DrillTypeMeta | null {
  return DRILL_TYPES.find((d) => d.type === type) ?? null;
}

export function isDrillId(id: string): boolean {
  return id.startsWith(DRILL_ID_PREFIX);
}

export function drillId(type: string): string {
  return `${DRILL_ID_PREFIX}${type}`;
}

/**
 * Assemble the drill for a question type.
 *
 * Questions are renumbered 1..N so the paper reads as one continuous set, and
 * ids are namespaced by their source paper so two papers can never collide.
 */
export function buildDrillSection(type: string): ExamSectionFull | null {
  const meta = drillMeta(type);
  if (!meta) return null;

  const passages: ExamPassage<ExamQuestionFull>[] = [];
  let counter = 0;

  // Object.values over a registry built from a fixed array — stable order.
  for (const paper of Object.values(EXAM_SECTIONS)) {
    for (const passage of paper.passages) {
      const matching = passage.groups.filter((g) => g.type === meta.type);
      if (matching.length === 0) continue;

      const groups: QuestionGroup<ExamQuestionFull>[] = matching.map((g) => {
        const from = counter + 1;
        const questions = g.questions.map((q) => {
          const number = counter + 1;
          const span = Array.isArray(q.answer) ? q.answer.length : 1;
          counter += span;
          return {
            ...q,
            id: `${paper.id}::${q.id}`,
            number,
            numberTo: span > 1 ? number + span - 1 : undefined,
          };
        });
        return {
          ...g,
          id: `${paper.id}::${g.id}`,
          from,
          to: counter,
          questions,
        };
      });

      passages.push({
        ...passage,
        id: `${paper.id}::${passage.id}`,
        number: passages.length + 1,
        groups,
      });
    }
  }

  if (counter === 0) return null;

  return {
    id: drillId(type),
    skill: "reading",
    title: `Тренировка: ${meta.label}`,
    durationMinutes: minutesFor(counter),
    attribution: `${meta.ru} — ${counter} вопросов из ${passages.length} текстов каталога EduFlow.`,
    passages,
  };
}

/**
 * Course syllabus: the fixed 24-lesson IELTS programme and where each group
 * currently stands in it.
 *
 * Design note: a lesson's status is derived from the group's current lesson
 * rather than stored on the lesson itself. Storing both would let them drift —
 * a group could end up with two "current" lessons, or none — so the pointer is
 * the single source of truth and `lessonStatus` reads it.
 */

import type { Skill } from "./types";

export const TOTAL_LESSONS = 24;

export type LessonStatus = "completed" | "current" | "upcoming";
export type LessonSkill = Skill | "general";

export interface LessonMaterial {
  id: string;
  title: string;
  /** `pdf` renders in the embedded viewer; `link` opens in a new tab. */
  kind: "pdf" | "link";
  url: string;
  /** Human-readable size, shown next to the download action. */
  sizeLabel?: string;
}

export interface Lesson {
  number: number;
  title: string;
  summary: string;
  skill: LessonSkill;
  materials: LessonMaterial[];
}

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  completed: "Пройден",
  current: "Текущий",
  upcoming: "Предстоит",
};

export const LESSON_SKILL_LABELS: Record<LessonSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
  general: "Общее",
};

/** The programme every group in the centre follows, in order. */
export const LESSONS: Lesson[] = [
  {
    number: 1,
    title: "Знакомство с форматом и диагностика",
    summary:
      "Структура четырёх секций, критерии оценивания и что именно даёт балл. Диагностический срез, чтобы зафиксировать стартовый уровень.",
    skill: "general",
    materials: [],
  },
  {
    number: 2,
    title: "Listening Section 1: формы и заполнение пропусков",
    summary:
      "Бытовой диалог, числа, даты и имена по буквам. Отработка написания ответа ровно в том виде, в каком он звучит.",
    skill: "listening",
    materials: [],
  },
  {
    number: 3,
    title: "Reading: скимминг, сканирование и тайм-менеджмент",
    summary:
      "Как за двадцать минут пройти текст с тринадцатью вопросами: чтение ради общей идеи против поиска конкретного факта.",
    skill: "reading",
    materials: [],
  },
  {
    number: 4,
    title: "Writing Task 1: описание графиков и трендов",
    summary:
      "Структура отчёта, язык динамики (rise, plateau, fluctuate) и обязательный обзорный абзац перед цифрами.",
    skill: "writing",
    materials: [],
  },
  {
    number: 5,
    title: "Speaking Part 1: беглость в бытовых темах",
    summary:
      "Короткие вопросы о себе, работе и городе. Учимся отвечать двумя-тремя предложениями вместо односложного «yes».",
    skill: "speaking",
    materials: [],
  },
  {
    number: 6,
    title: "Listening Section 2: карты и планы",
    summary:
      "Ориентация в пространстве на слух: предлоги места, повороты и направления. Разбор типичных ловушек с «left / right».",
    skill: "listening",
    materials: [],
  },
  {
    number: 7,
    title: "Reading: True / False / Not Given",
    summary:
      "Ключевое различие между противоречием тексту и отсутствием информации — самый частый источник потерянных баллов.",
    skill: "reading",
    materials: [],
  },
  {
    number: 8,
    title: "Writing Task 1: сравнение и группировка данных",
    summary:
      "Как выбрать значимое и не пересказывать каждую цифру. Группировка категорий и язык сравнения.",
    skill: "writing",
    materials: [],
  },
  {
    number: 9,
    title: "Speaking Part 2: развёрнутый монолог",
    summary:
      "Минута на подготовку, две на ответ. Схема расширения по 5W1H, чтобы не замолчать на шестидесятой секунде.",
    skill: "speaking",
    materials: [],
  },
  {
    number: 10,
    title: "Reading: Matching Headings",
    summary:
      "Определение главной мысли абзаца, работа с дистракторами и порядок действий: сначала заголовки, потом текст.",
    skill: "reading",
    materials: [],
  },
  {
    number: 11,
    title: "IELTS Writing Task 2: Cause & Effect Essays",
    summary:
      "Эссе о причинах и следствиях: как отделить причину от симптома, выстроить логическую цепочку и не скатиться в перечисление. Разбираем структуру, язык причинности и типичные ошибки в постановке проблемы.",
    skill: "writing",
    materials: [
      {
        id: "m-11-handout",
        title: "Cause & Effect Essays — раздаточный материал",
        kind: "pdf",
        url: "/materials/lesson-11-cause-and-effect.pdf",
        sizeLabel: "PDF",
      },
    ],
  },
  {
    number: 12,
    title: "Listening Section 3: академический диалог",
    summary:
      "Разговор двух-трёх студентов с преподавателем: смена говорящих, согласие и возражение, исправления по ходу речи.",
    skill: "listening",
    materials: [],
  },
  {
    number: 13,
    title: "Reading: Multiple Choice и Matching Features",
    summary:
      "Отсечение похожих, но неточных вариантов. Сопоставление утверждений с исследователями и теориями.",
    skill: "reading",
    materials: [],
  },
  {
    number: 14,
    title: "Writing Task 2: Opinion Essays",
    summary:
      "Чёткая позиция во введении и её удержание во всех абзацах. Разница между «agree» и «partly agree» на письме.",
    skill: "writing",
    materials: [],
  },
  {
    number: 15,
    title: "Speaking Part 3: аргументация и абстрактные темы",
    summary:
      "Обсуждение общества, технологий и образования. Приёмы «it depends» и разворота вопроса, когда нет готового мнения.",
    skill: "speaking",
    materials: [],
  },
  {
    number: 16,
    title: "Listening Section 4: академическая лекция",
    summary:
      "Монолог без пауз и смены голосов. Конспектирование по ключевым существительным и удержание внимания после третьей минуты.",
    skill: "listening",
    materials: [],
  },
  {
    number: 17,
    title: "Reading: Summary Completion",
    summary:
      "Заполнение краткого пересказа словами из текста: грамматическая форма пропуска и строгий лимит слов.",
    skill: "reading",
    materials: [],
  },
  {
    number: 18,
    title: "Writing Task 2: Discussion Essays",
    summary:
      "Обе точки зрения плюс собственная. Как сбалансировать абзацы и не потерять своё мнение в пересказе чужих.",
    skill: "writing",
    materials: [],
  },
  {
    number: 19,
    title: "Лексика: тематические поля и коллокации",
    summary:
      "Работа с частотными темами экзамена. Замена высокочастотных глаголов и естественная сочетаемость вместо словаря синонимов.",
    skill: "general",
    materials: [],
  },
  {
    number: 20,
    title: "Грамматика: сложные конструкции для 7.0+",
    summary:
      "Условные предложения, относительные придаточные и пассив. Разнообразие структур без потери точности.",
    skill: "general",
    materials: [],
  },
  {
    number: 21,
    title: "Reading: Sentence Endings и Diagram Labelling",
    summary:
      "Завершение предложений по смыслу и грамматике, подписи к схемам и процессам.",
    skill: "reading",
    materials: [],
  },
  {
    number: 22,
    title: "Writing: типичные ошибки и самопроверка",
    summary:
      "Чек-лист последних трёх минут: артикли, согласование, лимит слов. Разбор работ группы по четырём критериям.",
    skill: "writing",
    materials: [],
  },
  {
    number: 23,
    title: "Speaking: полная симуляция интервью",
    summary:
      "Все три части подряд в условиях реального времени, с записью и разбором по критериям.",
    skill: "speaking",
    materials: [],
  },
  {
    number: 24,
    title: "Полный mock-экзамен и разбор",
    summary:
      "Четыре секции в экзаменационном режиме, подсчёт итогового балла и индивидуальный план на оставшееся время.",
    skill: "general",
    materials: [],
  },
];

/** Where each group currently is. Groups absent here start at lesson 1. */
export const GROUP_CURRENT_LESSON: Record<string, number> = {
  "IELTS 62": 11,
  "IELTS 63 (Weekend)": 7,
  "Intermediate 45": 15,
  "Pre-Intermediate 12": 4,
  "Advanced 34": 20,
};

export function currentLessonFor(groupName: string): number {
  return GROUP_CURRENT_LESSON[groupName] ?? 1;
}

export function lessonStatus(
  lessonNumber: number,
  currentLesson: number
): LessonStatus {
  if (lessonNumber < currentLesson) return "completed";
  if (lessonNumber === currentLesson) return "current";
  return "upcoming";
}

/**
 * Course progress as a percentage of the programme reached.
 *
 * Uses the current lesson's position rather than lessons finished, so being on
 * lesson 11 of 24 reads as 45%. Truncated, so the bar never claims a lesson
 * that has not been started.
 */
export function courseProgress(
  currentLesson: number,
  total: number = TOTAL_LESSONS
): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.floor((currentLesson / total) * 100));
}

export function findLesson(number: number): Lesson | undefined {
  return LESSONS.find((l) => l.number === number);
}

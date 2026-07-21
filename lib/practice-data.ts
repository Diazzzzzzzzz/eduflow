import type { Skill } from "./types";

export type Difficulty = "Лёгкий" | "Средний" | "Сложный";

export interface PracticeModule {
  id: string;
  section: Skill;
  title: string;
  /** Minutes */
  duration: number;
  /** Question / task count */
  questions: number;
  difficulty: Difficulty;
  description: string;
}

/** Per-section presentation metadata. English section name kept recognizable. */
export const SECTION_META: Record<
  Skill,
  { name: string; ru: string; blurb: string }
> = {
  listening: {
    name: "Listening",
    ru: "Аудирование",
    blurb: "4 секции, 40 вопросов, аудио звучит один раз.",
  },
  reading: {
    name: "Reading",
    ru: "Чтение",
    blurb: "3 текста, 40 вопросов, 60 минут на весь модуль.",
  },
  writing: {
    name: "Writing",
    ru: "Письмо",
    blurb: "Task 1 (описание данных) и Task 2 (эссе-рассуждение).",
  },
  speaking: {
    name: "Speaking",
    ru: "Говорение",
    blurb: "3 части: интервью, монолог по карточке и дискуссия.",
  },
};

/** Fixed order for rendering sections. */
export const SECTION_ORDER: Skill[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

export const PRACTICE_MODULES: PracticeModule[] = [
  // Listening
  {
    id: "lis-full",
    section: "listening",
    title: "Полный тест: Sections 1–4",
    duration: 30,
    questions: 40,
    difficulty: "Средний",
    description:
      "Полная симуляция аудирования — от бытового диалога до академической лекции.",
  },
  {
    id: "lis-s3",
    section: "listening",
    title: "Section 3: Академическая дискуссия",
    duration: 10,
    questions: 10,
    difficulty: "Сложный",
    description:
      "Диалог студентов и преподавателя. Тренировка на удержание нескольких говорящих.",
  },
  {
    id: "lis-maps",
    section: "listening",
    title: "Карты и планы (Section 2)",
    duration: 8,
    questions: 10,
    difficulty: "Средний",
    description: "Ориентация по описанию: лево/право, повороты, названия объектов.",
  },
  // Reading
  {
    id: "read-full",
    section: "reading",
    title: "Academic Reading: полный тест",
    duration: 60,
    questions: 40,
    difficulty: "Средний",
    description: "Три академических текста с полным набором типов заданий.",
  },
  {
    id: "read-tfng",
    section: "reading",
    title: "True / False / Not Given",
    duration: 15,
    questions: 13,
    difficulty: "Сложный",
    description:
      "Отработка самого коварного типа: отличать «ложь» от «нет информации».",
  },
  {
    id: "read-headings",
    section: "reading",
    title: "Matching Headings",
    duration: 12,
    questions: 8,
    difficulty: "Средний",
    description: "Подбор заголовков к абзацам — работа с главной мыслью абзаца.",
  },
  // Writing
  {
    id: "wr-task1",
    section: "writing",
    title: "Task 1: Описание графика",
    duration: 20,
    questions: 1,
    difficulty: "Средний",
    description:
      "Опишите линейный график минимум в 150 слов: обзор, ключевые тренды, данные.",
  },
  {
    id: "wr-task2",
    section: "writing",
    title: "Task 2: Эссе-рассуждение",
    duration: 40,
    questions: 1,
    difficulty: "Сложный",
    description:
      "Эссе на 250+ слов: чёткая позиция, аргументы, примеры и вывод.",
  },
  // Speaking
  {
    id: "sp-p1",
    section: "speaking",
    title: "Part 1: Интервью",
    duration: 5,
    questions: 8,
    difficulty: "Лёгкий",
    description: "Короткие вопросы о себе, учёбе, привычках и интересах.",
  },
  {
    id: "sp-p2",
    section: "speaking",
    title: "Part 2: Монолог по карточке",
    duration: 4,
    questions: 1,
    difficulty: "Средний",
    description: "1 минута на подготовку и до 2 минут монолога по теме карточки.",
  },
  {
    id: "sp-p3",
    section: "speaking",
    title: "Part 3: Дискуссия",
    duration: 5,
    questions: 6,
    difficulty: "Сложный",
    description: "Абстрактные вопросы по теме Part 2 — глубина и развёрнутость.",
  },
];

export const DIFFICULTY_VARIANT: Record<
  Difficulty,
  "success" | "default" | "warning"
> = {
  Лёгкий: "success",
  Средний: "default",
  Сложный: "warning",
};

import { GROUPS, STUDENTS } from "./mock-data";
import type { Skill } from "./types";

export type HomeworkSection = Skill | "general";
export type SubmissionStatus = "assigned" | "submitted" | "graded";
export type AttendanceStatus = "present" | "absent" | "late";

export interface GroupInfo {
  name: string;
  schedule: string;
}

export interface Homework {
  id: string;
  groupName: string;
  title: string;
  description: string;
  section: HomeworkSection;
  dueDate: string; // ISO date
  createdAt: string; // ISO date
  /** Assigned to these students only; when absent, the whole group gets it. */
  assignedStudentIds?: string[];
  /** Minimum word count for written tasks, shown and enforced in the editor. */
  minWords?: number;
}

/** The four IELTS Writing marking criteria, each scored 1.0–9.0. */
export interface WritingCriteria {
  taskAchievement: number;
  coherence: number;
  lexical: number;
  grammar: number;
}

export interface Submission {
  id: string;
  homeworkId: string;
  studentId: string;
  content: string;
  status: SubmissionStatus;
  band: number | null;
  feedback: string | null;
  submittedAt: string | null;
  /** Per-criterion marks; only set for graded writing tasks. */
  criteria?: WritingCriteria | null;
}

export const WRITING_CRITERIA: {
  key: keyof WritingCriteria;
  label: string;
  short: string;
  hint: string;
}[] = [
  {
    key: "taskAchievement",
    label: "Task Achievement",
    short: "TA",
    hint: "Полнота ответа на вопрос, чёткая позиция, развитие идей.",
  },
  {
    key: "coherence",
    label: "Coherence & Cohesion",
    short: "CC",
    hint: "Логика изложения, деление на абзацы, связки.",
  },
  {
    key: "lexical",
    label: "Lexical Resource",
    short: "LR",
    hint: "Диапазон и точность лексики, словообразование.",
  },
  {
    key: "grammar",
    label: "Grammatical Range & Accuracy",
    short: "GRA",
    hint: "Разнообразие конструкций, точность грамматики и пунктуации.",
  },
];

/** Valid marks for a criterion: 1.0 to 9.0 in half-band steps. */
export const CRITERION_STEPS: number[] = Array.from(
  { length: 17 },
  (_, i) => 1 + i * 0.5
);

/**
 * Overall Writing band: the mean of the four criteria rounded to the nearest
 * half band, which is how the official descriptors combine them.
 */
export function criteriaToBand(c: WritingCriteria): number {
  const mean =
    (c.taskAchievement + c.coherence + c.lexical + c.grammar) / 4;
  return Math.round(mean * 2) / 2;
}

export function countEssayWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
}

export const GROUP_SCHEDULES: Record<string, string> = {
  "IELTS 62": "Вт, Чт, Сб — 19:00",
  "IELTS 63 (Weekend)": "Пн, Ср, Пт — 16:30",
  "Intermediate 45": "Пн, Ср, Пт — 19:30",
  "Pre-Intermediate 12": "Сб, Вс — 11:00",
  "Advanced 34": "Вт, Чт — 19:00",
};

export const GROUP_LIST: GroupInfo[] = GROUPS.map((name) => ({
  name,
  schedule: GROUP_SCHEDULES[name] ?? "",
}));

export const SECTION_LABELS: Record<HomeworkSection, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
  general: "Общее",
};

export const HOMEWORK_SEED: Homework[] = [
  {
    id: "hw-01",
    groupName: "IELTS 62",
    title: "Writing Task 2: Эссе о технологиях",
    description:
      "Напишите эссе (250+ слов): согласны ли вы, что технологии делают людей менее общительными? Приведите аргументы и примеры.",
    section: "writing",
    dueDate: "2026-08-05",
    createdAt: "2026-07-20",
  },
  {
    id: "hw-02",
    groupName: "IELTS 62",
    title: "Reading: True / False / Not Given",
    description: "Отработайте 13 вопросов TFNG и запишите ответы с обоснованием.",
    section: "reading",
    dueDate: "2026-08-02",
    createdAt: "2026-07-21",
  },
  {
    id: "hw-03",
    groupName: "IELTS 63 (Weekend)",
    title: "Listening: Sections 3–4",
    description: "Прослушайте академические записи и заполните пропуски.",
    section: "listening",
    dueDate: "2026-08-03",
    createdAt: "2026-07-19",
  },
  {
    id: "hw-04",
    groupName: "Intermediate 45",
    title: "Writing Task 1: Описание графика",
    description: "Опишите линейный график минимум в 150 слов: обзор и ключевые тренды.",
    section: "writing",
    dueDate: "2026-08-04",
    createdAt: "2026-07-20",
  },
  {
    id: "hw-05",
    groupName: "Intermediate 45",
    title: "Speaking Part 2: Монолог",
    description: "Запишите 2-минутный монолог по карточке о любимом месте.",
    section: "speaking",
    dueDate: "2026-08-06",
    createdAt: "2026-07-22",
  },
  {
    id: "hw-06",
    groupName: "Pre-Intermediate 12",
    title: "Словарь: Unit 5",
    description: "Выучите 30 слов из юнита 5 и составьте с ними предложения.",
    section: "general",
    dueDate: "2026-08-01",
    createdAt: "2026-07-18",
  },
  {
    id: "hw-07",
    groupName: "Advanced 34",
    title: "Writing Task 2: Эссе-мнение",
    description: "Эссе о плюсах и минусах глобализации, 250+ слов, чёткая позиция.",
    section: "writing",
    dueDate: "2026-08-07",
    createdAt: "2026-07-21",
  },
  {
    id: "hw-08",
    groupName: "IELTS 62",
    title: "Writing Task 2: Плата за высшее образование",
    description:
      "Some people believe that university education should be free for everyone, while others think that students should pay for higher education. Discuss both views and give your own opinion.",
    section: "writing",
    dueDate: "2026-08-08",
    createdAt: "2026-07-25",
    // Individual task for Арман — his Writing is the weakest section.
    assignedStudentIds: ["st-01"],
    minWords: 250,
  },
];

/**
 * Build one submission per (homework, student-in-group). For demo variety the
 * first student of each homework is 'graded' and the second is 'submitted';
 * the rest stay 'assigned'.
 */
export function buildSubmissionSeed(
  roster: { id: string; name: string; group: string }[] = STUDENTS
): Submission[] {
  /**
   * `assignedStudentIds` holds mock ids (st-01…), but the live roster is keyed
   * by database UUIDs. Resolve through the demo cohort's names so an individual
   * assignment lands on the right person in both modes.
   */
  const resolveTargets = (mockIds: string[]) => {
    const names = new Set(
      STUDENTS.filter((s) => mockIds.includes(s.id)).map((s) => s.name)
    );
    return roster.filter(
      (s) => mockIds.includes(s.id) || names.has(s.name)
    );
  };

  const rows: Submission[] = [];
  for (const hw of HOMEWORK_SEED) {
    const individual = hw.assignedStudentIds?.length
      ? resolveTargets(hw.assignedStudentIds)
      : null;
    // An individually assigned task starts untouched, so the student can
    // actually sit down and write it.
    if (individual) {
      rows.push(
        ...individual.map((student) => ({
          id: `sub-${hw.id}-${student.id}`,
          homeworkId: hw.id,
          studentId: student.id,
          content: "",
          status: "assigned" as SubmissionStatus,
          band: null,
          feedback: null,
          submittedAt: null,
          criteria: null,
        }))
      );
      continue;
    }

    const groupStudents = roster.filter((s) => s.group === hw.groupName);
    groupStudents.forEach((student, i) => {
      let status: SubmissionStatus = "assigned";
      let content = "";
      let band: number | null = null;
      let feedback: string | null = null;
      let submittedAt: string | null = null;
      if (i === 0) {
        status = "graded";
        content = "Работа выполнена и отправлена на проверку.";
        band = 6.5;
        feedback = "Хорошая структура. Поработайте над связками между абзацами.";
        submittedAt = hw.createdAt;
      } else if (i === 1) {
        status = "submitted";
        content = "Черновик ответа отправлен.";
        submittedAt = hw.createdAt;
      }
      rows.push({
        id: `sub-${hw.id}-${student.id}`,
        homeworkId: hw.id,
        studentId: student.id,
        content,
        status,
        band,
        feedback,
        submittedAt,
      });
    });
  }
  return rows;
}

export const SUBMISSION_SEED: Submission[] = buildSubmissionSeed();

/** Overdue = still assigned and past the due date (compare on the client). */
export function isOverdue(sub: Submission, hw: Homework, today: string): boolean {
  return sub.status === "assigned" && !!hw.dueDate && hw.dueDate < today;
}

/** Russian status label + Badge tone for a submission. `today` is client-side. */
export function submissionStatusMeta(
  sub: Submission,
  hw: Homework,
  today: string
): { label: string; tone: "success" | "default" | "secondary" | "destructive" } {
  if (sub.status === "graded") return { label: "Сдано", tone: "success" };
  if (sub.status === "submitted") return { label: "На проверке", tone: "default" };
  if (isOverdue(sub, hw, today)) return { label: "Просрочено", tone: "destructive" };
  return { label: "Назначено", tone: "secondary" };
}


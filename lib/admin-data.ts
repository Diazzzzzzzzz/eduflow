/**
 * Staff roster and group ownership.
 *
 * Fixed ids so re-seeding replaces rows instead of duplicating them, matching
 * the convention in `scripts/gen-seed.ts`.
 */

export type StaffRole = "owner" | "admin" | "director" | "teacher";

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: StaffRole;
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Владелец",
  admin: "Администратор",
  director: "Директор",
  teacher: "Преподаватель",
};

const teacherUuid = (n: number) =>
  `22222222-2222-2222-2222-${String(n).padStart(12, "0")}`;

export const TEACHERS: Teacher[] = [
  {
    // Kept at the original seeded id: students already reference this teacher.
    id: "22222222-2222-2222-2222-222222222222",
    name: "Дана Искакова",
    initials: "ДИ",
    email: "dana.iskakova@example.com",
    role: "director",
  },
  {
    id: teacherUuid(2),
    name: "Ержан Абдрахманов",
    initials: "ЕА",
    email: "yerzhan.abdrakhmanov@example.com",
    role: "teacher",
  },
  {
    id: teacherUuid(3),
    name: "Салтанат Жумабаева",
    initials: "СЖ",
    email: "saltanat.zhumabayeva@example.com",
    role: "teacher",
  },
  {
    id: teacherUuid(4),
    name: "Асхат Ибрагимов",
    initials: "АИ",
    email: "askhat.ibragimov@example.com",
    role: "teacher",
  },
];

/** Which teacher runs which group. */
export const GROUP_TEACHER: Record<string, string> = {
  "IELTS 62": TEACHERS[0].id,
  "IELTS 63 (Weekend)": TEACHERS[1].id,
  "Intermediate 45": TEACHERS[2].id,
  "Pre-Intermediate 12": TEACHERS[3].id,
  "Advanced 34": TEACHERS[1].id,
};

export function teacherById(id: string | null | undefined): Teacher | undefined {
  return TEACHERS.find((t) => t.id === id);
}

export function teacherForGroup(groupName: string): Teacher | undefined {
  return teacherById(GROUP_TEACHER[groupName]);
}

/**
 * Demo homework awaiting review, as hours since submission.
 *
 * Seeded relative to apply time so the director's "waiting N hours" column
 * shows plausible ages instead of a frozen date.
 */
export const PENDING_REVIEW_SEED: {
  id: string;
  homeworkId: string;
  studentName: string;
  hoursAgo: number;
}[] = [
  {
    id: "hw-pending-1",
    homeworkId: "hw-01",
    studentName: "Арман Калибеков",
    hoursAgo: 4,
  },
  {
    id: "hw-pending-2",
    homeworkId: "hw-01",
    studentName: "Мадина Оспанова",
    hoursAgo: 9,
  },
  {
    id: "hw-pending-3",
    homeworkId: "hw-02",
    studentName: "Алина Нургалиева",
    hoursAgo: 27,
  },
  {
    id: "hw-pending-4",
    homeworkId: "hw-03",
    studentName: "Мадина Есенова",
    hoursAgo: 52,
  },
  {
    id: "hw-pending-5",
    homeworkId: "hw-07",
    studentName: "Аружан Мукашева",
    hoursAgo: 6,
  },
];

/** Reviews older than this are flagged to the director. */
export const REVIEW_SLA_HOURS = 24;

export function reviewIsLate(hoursWaiting: number): boolean {
  return hoursWaiting > REVIEW_SLA_HOURS;
}

/** "4 часа" / "2 дня" — plural-aware, no date library. */
export function formatWaiting(hours: number): string {
  if (hours < 1) return "меньше часа";
  if (hours < 24) {
    const h = Math.floor(hours);
    const mod10 = h % 10;
    const mod100 = h % 100;
    if (mod10 === 1 && mod100 !== 11) return `${h} час`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
      return `${h} часа`;
    return `${h} часов`;
  }
  const d = Math.floor(hours / 24);
  const mod10 = d % 10;
  const mod100 = d % 100;
  if (mod10 === 1 && mod100 !== 11) return `${d} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return `${d} дня`;
  return `${d} дней`;
}

/**
 * Server-side access to the course syllabus.
 *
 * Reads from Supabase when configured, otherwise serves the bundled programme,
 * matching the fallback convention in `lib/data/students.ts`.
 */

import { createAdminClient } from "@/lib/supabase/server";
import {
  currentLessonFor,
  LESSONS,
  TOTAL_LESSONS,
  type Lesson,
  type LessonSkill,
} from "@/lib/lessons-data";

const CENTER_ID = "11111111-1111-1111-1111-111111111111";

export interface Course {
  lessons: Lesson[];
  currentLesson: number;
  total: number;
  source: "supabase" | "mock";
}

interface LessonRow {
  number: number;
  title: string;
  summary: string | null;
  skill: string;
  material_title: string | null;
  material_url: string | null;
}

function rowToLesson(row: LessonRow): Lesson {
  return {
    number: row.number,
    title: row.title,
    summary: row.summary ?? "",
    skill: (row.skill as LessonSkill) ?? "general",
    materials:
      row.material_url && row.material_title
        ? [
            {
              id: `m-${row.number}`,
              title: row.material_title,
              kind: row.material_url.toLowerCase().endsWith(".pdf")
                ? "pdf"
                : "link",
              url: row.material_url,
            },
          ]
        : [],
  };
}

function mockCourse(groupName: string): Course {
  return {
    lessons: LESSONS,
    currentLesson: currentLessonFor(groupName),
    total: TOTAL_LESSONS,
    source: "mock",
  };
}

export async function getCourse(groupName: string): Promise<Course> {
  const supabase = createAdminClient();
  if (!supabase) return mockCourse(groupName);

  try {
    // Kept as separate awaits: inside Promise.all TypeScript collapses the two
    // differently-shaped query builders into `never`.
    const lessonsRes = await supabase
      .from("lessons")
      .select("number, title, summary, skill, material_title, material_url")
      .eq("center_id", CENTER_ID)
      .order("number");

    // The hand-written Database shape in lib/supabase/types.ts is minimal, so a
    // filtered `.maybeSingle()` infers as `never`; the codebase casts at this
    // boundary (see lib/data/students.ts and lib/data/cambridge.ts).
    const groupRes = await supabase
      .from("groups")
      .select("current_lesson")
      .eq("name", groupName)
      .maybeSingle();
    const groupRow = groupRes.data as unknown as {
      current_lesson: number | null;
    } | null;

    // An empty syllabus means the seed hasn't run — the bundled programme is
    // the better answer than an empty course screen.
    if (lessonsRes.error || !lessonsRes.data?.length) return mockCourse(groupName);

    const lessons = lessonsRes.data.map((r) => rowToLesson(r as LessonRow));
    const current =
      !groupRes.error && groupRow?.current_lesson
        ? Number(groupRow.current_lesson)
        : currentLessonFor(groupName);

    return {
      lessons,
      currentLesson: Math.min(Math.max(current, 1), lessons.length),
      total: lessons.length,
      source: "supabase",
    };
  } catch {
    return mockCourse(groupName);
  }
}

export async function setCurrentLesson(
  groupName: string,
  lessonNumber: number
): Promise<{ persisted: boolean; currentLesson: number }> {
  const supabase = createAdminClient();
  if (!supabase) return { persisted: false, currentLesson: lessonNumber };

  try {
    const { error } = await supabase
      .from("groups")
      .update({ current_lesson: lessonNumber } as never)
      .eq("name", groupName);
    return { persisted: !error, currentLesson: lessonNumber };
  } catch {
    return { persisted: false, currentLesson: lessonNumber };
  }
}

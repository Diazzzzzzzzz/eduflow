"use client";

import * as React from "react";
import {
  currentLessonFor,
  LESSONS,
  TOTAL_LESSONS,
  type Lesson,
} from "@/lib/lessons-data";

export interface CourseState {
  lessons: Lesson[];
  currentLesson: number;
  total: number;
  status: "loading" | "ready" | "error";
  /** Move the group to another lesson (staff only, enforced server-side). */
  setCurrentLesson: (n: number) => Promise<{ ok: boolean; error?: string }>;
  saving: boolean;
  reload: () => void;
}

/**
 * Loads the syllabus for a group.
 *
 * Starts empty rather than pre-filled with the bundled programme: painting a
 * course and then swapping it is the same flicker the roster had.
 */
export function useCourse(groupName: string | undefined): CourseState {
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [currentLesson, setCurrent] = React.useState(0);
  const [total, setTotal] = React.useState(TOTAL_LESSONS);
  const [status, setStatus] = React.useState<CourseState["status"]>("loading");
  const [saving, setSaving] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!groupName) return;
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const res = await fetch(
          `/api/lessons?group=${encodeURIComponent(groupName)}`
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          lessons: Lesson[];
          currentLesson: number;
          total: number;
        };
        if (cancelled) return;
        setLessons(data.lessons ?? []);
        setCurrent(data.currentLesson ?? 1);
        setTotal(data.total ?? data.lessons?.length ?? TOTAL_LESSONS);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        // The syllabus is identical for every group, so the bundled copy is a
        // safe offline view; only the group's position could be stale.
        setLessons(LESSONS);
        setCurrent(currentLessonFor(groupName));
        setTotal(TOTAL_LESSONS);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [groupName, tick]);

  const setCurrentLesson = React.useCallback(
    async (n: number) => {
      if (!groupName) return { ok: false, error: "Группа не выбрана" };
      setSaving(true);
      const previous = currentLesson;
      setCurrent(n); // optimistic
      try {
        const res = await fetch("/api/lessons", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group: groupName, currentLesson: n }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setCurrent(previous);
          return { ok: false, error: body.error ?? "Не удалось сохранить" };
        }
        return { ok: true };
      } catch {
        setCurrent(previous);
        return { ok: false, error: "Нет соединения с сервером" };
      } finally {
        setSaving(false);
      }
    },
    [groupName, currentLesson]
  );

  return {
    lessons,
    currentLesson,
    total,
    status,
    setCurrentLesson,
    saving,
    reload: () => setTick((t) => t + 1),
  };
}

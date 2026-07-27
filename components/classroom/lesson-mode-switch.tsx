"use client";

import { BookOpen, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClassroom, type LessonMode } from "./classroom-provider";

const OPTIONS: {
  id: LessonMode;
  label: string;
  short: string;
  hint: string;
  icon: typeof BookOpen;
}[] = [
  {
    id: "solo",
    label: "Самостоятельное прохождение",
    short: "Самостоятельно",
    hint: "Работа над тестом без преподавателя",
    icon: BookOpen,
  },
  {
    id: "live",
    label: "Урок с учителем",
    short: "Live Class",
    hint: "Подключает окно видеосвязи с преподавателем",
    icon: Radio,
  },
];

/**
 * Switches between working alone and a live lesson.
 *
 * Live mode is what mounts the call widget, so this is the only entry point to
 * it — there is no way to end up with a call window and no way back out.
 */
export function LessonModeSwitch({ className }: { className?: string }) {
  const { mode, setMode } = useClassroom();

  return (
    <div
      role="radiogroup"
      aria-label="Режим урока"
      className={cn(
        "flex items-center gap-0.5 rounded-xl border bg-secondary/60 p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ id, label, short, hint, icon: Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            title={hint}
            onClick={() => setMode(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? id === "live"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{short}</span>
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

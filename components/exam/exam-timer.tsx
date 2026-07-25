"use client";

import { AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExamSession } from "./exam-session";

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Section countdown. Turns amber under ten minutes and red under five, the
 * points at which candidates are warned in a real test room.
 */
export function ExamTimer() {
  const { remaining } = useExamSession();

  if (remaining === null) {
    return (
      <span className="tabular inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
        <AlarmClock className="h-3.5 w-3.5" /> --:--
      </span>
    );
  }

  const critical = remaining <= 300;
  const low = remaining <= 600;

  return (
    <span
      role="timer"
      aria-live={critical ? "assertive" : "off"}
      className={cn(
        "tabular inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        critical
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : low
            ? "border-warning/40 bg-warning/10 text-warning"
            : "border-border bg-card text-foreground"
      )}
    >
      <AlarmClock className={cn("h-3.5 w-3.5", critical && "animate-pulse-dot")} />
      {format(remaining)}
      <span className="sr-only">осталось до конца секции</span>
    </span>
  );
}

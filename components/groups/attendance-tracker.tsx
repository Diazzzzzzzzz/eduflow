"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useGroups, attendanceKey } from "@/components/groups/groups-provider";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/group-data";
import type { Student } from "@/lib/types";

const OPTIONS: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "present", label: "Присут.", tone: "bg-success/15 text-success ring-success/30" },
  { value: "late", label: "Опоздал", tone: "bg-warning/15 text-warning ring-warning/30" },
  { value: "absent", label: "Отсут.", tone: "bg-destructive/15 text-destructive ring-destructive/30" },
];

export function AttendanceTracker({ students }: { students: Student[] }) {
  const { attendance, setAttendance } = useGroups();
  const [date, setDate] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  // Resolve "today" on the client to avoid an SSR/CSR hydration mismatch.
  React.useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  const [error, setError] = React.useState<string | null>(null);

  // The provider applies the mark optimistically and rolls it back if the
  // server refuses, so this only needs to surface that refusal.
  async function mark(studentId: string, status: AttendanceStatus) {
    if (!date) return;
    setSaved(false);
    setError(null);
    try {
      await setAttendance(studentId, date, status);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить отметку."
      );
    }
  }

  const present = students.filter(
    (s) => (attendance[attendanceKey(s.id, date)] ?? "present") !== "absent"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="att-date" className="text-sm text-muted-foreground">
            Дата
          </label>
          <input
            id="att-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          На занятии: <span className="tabular font-medium text-foreground">{present}</span> из{" "}
          {students.length}
        </p>
      </div>

      <div className="space-y-2">
        {students.map((s) => {
          const current = date
            ? attendance[attendanceKey(s.id, date)] ?? "present"
            : "present";
          return (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {s.initials}
                </span>
                <span className="text-sm font-medium">{s.name}</span>
              </div>
              <div className="flex gap-1.5">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => mark(s.id, opt.value)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
                      current === opt.value
                        ? opt.tone
                        : "bg-card text-muted-foreground ring-border hover:bg-secondary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Every click persists immediately; the old "save" button only flipped
          local state and stored nothing, which would now be misleading. */}
      <div className="flex items-center justify-end gap-3 text-sm">
        {error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : saved ? (
          <p className="flex items-center gap-1.5 text-success">
            <Check className="h-4 w-4" /> Сохранено в журнале
          </p>
        ) : (
          <p className="text-muted-foreground">
            Отметки сохраняются автоматически.
          </p>
        )}
      </div>
    </div>
  );
}

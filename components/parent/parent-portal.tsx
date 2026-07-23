"use client";

import * as React from "react";
import {
  CalendarCheck2,
  Check,
  MessageCircle,
  Quote,
  Send,
  Share2,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { BandChip } from "@/components/band-chip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBand, SKILL_LABELS } from "@/lib/band";
import { formatDayMonth, formatDayMonthYear } from "@/lib/date";
import { useMounted } from "@/lib/use-mounted";
import { SKILLS } from "@/lib/types";

export function ParentPortal() {
  const { students, activeStudent, activeStudentId, setActiveStudentId } =
    useApp();
  const s = activeStudent;
  const latest = s.mockTests[s.mockTests.length - 1];
  const firstName = s.name.split(" ")[0];
  const [shared, setShared] = React.useState<null | "whatsapp" | "telegram">(
    null
  );

  function share(channel: "whatsapp" | "telegram") {
    setShared(channel);
    setTimeout(() => setShared(null), 2000);
  }

  // "Week of" is relative to today, so it can only be resolved on the client —
  // rendering it during SSR would mismatch the build-time prerender.
  const mounted = useMounted();
  const weekOf = mounted ? formatDayMonth(new Date().toISOString()) : null;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">
            Еженедельный отчёт
          </h1>
          <p className="text-sm text-muted-foreground">
            Предпросмотр отчёта для родителей
          </p>
        </div>
        <Select value={activeStudentId} onValueChange={setActiveStudentId}>
          <SelectTrigger className="w-40" aria-label="Choose student">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {students.map((st) => (
              <SelectItem key={st.id} value={st.id}>
                {st.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Phone-style report card */}
      <div
        className="animate-fade-up overflow-hidden rounded-3xl border bg-card shadow-raised"
        style={{ animationDelay: "100ms" }}
      >
        {/* Message header */}
        <div className="flex items-center gap-3 border-b bg-secondary/50 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary ring-1 ring-inset ring-primary/30">
            {s.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">{s.name}</p>
            <p className="text-xs text-muted-foreground">
              EduFlow{weekOf ? ` · Неделя ${weekOf}` : ""}
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" />
            В графике
          </span>
        </div>

        <div className="space-y-5 p-5">
          {/* Attendance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CalendarCheck2 className="h-4 w-4 text-success" />
                Посещаемость за неделю
              </span>
              <span className="tabular text-sm font-semibold text-success">
                {s.attendance}%
              </span>
            </div>
            <Progress
              value={s.attendance}
              indicatorClassName="bg-success"
              aria-label="Weekly attendance"
            />
          </div>

          {/* Last mock score card */}
          <div className="rounded-2xl border bg-secondary/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{latest.label}</p>
                <p className="mt-0.5 text-sm font-medium">Последний mock-экзамен</p>
              </div>
              <BandChip band={latest.overall} target={s.targetBand} size="lg" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {SKILLS.map((skill) => (
                <div
                  key={skill}
                  className="rounded-lg bg-card px-2 py-2.5 text-center ring-1 ring-inset ring-border"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {SKILL_LABELS[skill][0]}
                  </p>
                  <p className="tabular mt-1 font-display text-sm font-semibold">
                    {formatBand(latest[skill])}
                  </p>
                </div>
              ))}
            </div>
            <p className="tabular mt-3 text-center text-xs text-muted-foreground">
              Целевой балл: {formatBand(s.targetBand)} · Экзамен{" "}
              {formatDayMonthYear(s.examDate)}
            </p>
          </div>

          {/* Teacher note */}
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <Quote className="h-3.5 w-3.5" />
              Комментарий преподавателя
            </div>
            <p className="mt-2 text-sm leading-relaxed">{s.teacherNote}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              — Дана Искакова, академический директор
            </p>
          </div>

          {/* Share actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant={shared === "whatsapp" ? "success" : "default"}
              className="w-full"
              onClick={() => share("whatsapp")}
            >
              {shared === "whatsapp" ? (
                <>
                  <Check /> Отправлено
                </>
              ) : (
                <>
                  <MessageCircle /> WhatsApp
                </>
              )}
            </Button>
            <Button
              variant={shared === "telegram" ? "success" : "secondary"}
              className="w-full"
              onClick={() => share("telegram")}
            >
              {shared === "telegram" ? (
                <>
                  <Check /> Отправлено
                </>
              ) : (
                <>
                  <Send /> Telegram
                </>
              )}
            </Button>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Share2 className="h-3 w-3" />
            Родители получают этот отчёт каждую пятницу в 18:00
          </p>
        </div>
      </div>
    </div>
  );
}

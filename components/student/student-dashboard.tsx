"use client";

import {
  BookOpenCheck,
  CalendarClock,
  Headphones,
  Mic,
  PenLine,
  Target,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { BandChip } from "@/components/band-chip";
import { SkillLineChart } from "@/components/charts/skill-line-chart";
import { SkillRadarChart } from "@/components/charts/skill-radar-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBand, SKILL_LABELS } from "@/lib/band";
import { formatLongDate } from "@/lib/date";
import { useMounted } from "@/lib/use-mounted";
import type { Skill } from "@/lib/types";

const SKILL_ICONS: Record<Skill, typeof Headphones> = {
  listening: Headphones,
  reading: BookOpenCheck,
  writing: PenLine,
  speaking: Mic,
};

const PRIORITY_VARIANT = {
  high: "warning",
  medium: "default",
  low: "secondary",
} as const;

const PRIORITY_LABELS = {
  high: "высокий приоритет",
  medium: "средний приоритет",
  low: "низкий приоритет",
} as const;

export function StudentDashboard() {
  const { students, activeStudent, activeStudentId, setActiveStudentId } =
    useApp();
  const s = activeStudent;
  const first = s.mockTests[0];
  const latest = s.mockTests[s.mockTests.length - 1];

  // Progress from starting band toward target
  const span = Math.max(s.targetBand - first.overall, 0.5);
  const pct = Math.min(
    Math.max(((latest.overall - first.overall) / span) * 100, 0),
    100
  );

  // Countdown depends on today, so resolve it client-side only to keep the
  // server prerender and first client render in agreement.
  const mounted = useMounted();
  const examTime = new Date(s.examDate + "T00:00:00").getTime();
  const daysLeft = mounted
    ? Math.max(Math.ceil((examTime - Date.now()) / 86_400_000), 0)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Прогресс: {s.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{s.group}</p>
        </div>
        <Select value={activeStudentId} onValueChange={setActiveStudentId}>
          <SelectTrigger className="w-60" aria-label="Choose student">
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

      {/* Target progress */}
      <Card className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 text-primary" />
              Прогресс к цели
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Текущий балл</p>
                <p className="tabular font-serif text-5xl font-medium">
                  {formatBand(latest.overall)}
                </p>
              </div>
              <div className="pb-1 text-muted-foreground">→</div>
              <div>
                <p className="text-xs text-muted-foreground">Целевой балл</p>
                <p className="tabular font-serif text-5xl font-medium text-primary">
                  {formatBand(s.targetBand)}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Progress value={pct} aria-label="Прогресс к целевому баллу" />
              <p className="tabular text-xs text-muted-foreground">
                {Math.round(pct)}% пути от {formatBand(first.overall)} (первый
                mock) до цели
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-3 md:flex-col md:justify-center">
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/40 px-4 py-3">
              <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Ожидаемый экзамен</p>
                <p className="text-sm font-medium">
                  {formatLongDate(s.examDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/40 px-4 py-3">
              <span className="tabular font-display text-xl font-bold text-primary">
                {daysLeft ?? "—"}
              </span>
              <p className="text-xs text-muted-foreground">
                дней до
                <br /> экзамена
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <CardHeader>
            <CardTitle className="font-display">
              Динамика за 6 месяцев
            </CardTitle>
            <CardDescription>
              Баллы по секциям за последние {s.mockTests.length} mock-экзаменов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillLineChart tests={s.mockTests} />
          </CardContent>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
          <CardHeader>
            <CardTitle className="font-display">
              Сильные и слабые стороны
            </CardTitle>
            <CardDescription>
              Последний mock и цель {formatBand(s.targetBand)} (пунктир)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillRadarChart latest={latest} target={s.targetBand} />
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="animate-fade-up space-y-3" style={{ animationDelay: "320ms" }}>
        <div>
          <h2 className="font-display text-lg font-semibold">
            Рекомендации по слабым местам
          </h2>
          <p className="text-sm text-muted-foreground">
            На основе последних трёх mock-экзаменов
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {s.recommendations.map((r) => {
            const Icon = SKILL_ICONS[r.skill];
            return (
              <Card
                key={r.id}
                className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {SKILL_LABELS[r.skill]}
                    </div>
                    <Badge variant={PRIORITY_VARIANT[r.priority]}>
                      {PRIORITY_LABELS[r.priority]}
                    </Badge>
                  </div>
                  <p className="font-medium leading-snug">{r.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {r.detail}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

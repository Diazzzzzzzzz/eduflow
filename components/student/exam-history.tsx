"use client";

import * as React from "react";
import { Bot, GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { BandChip } from "@/components/band-chip";
import { OverallTrendChart } from "@/components/charts/overall-trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBand, SKILL_LABELS } from "@/lib/band";
import { formatDayMonthYear } from "@/lib/date";
import { SKILLS, type MockTest, type Skill } from "@/lib/types";

const SECTION_TIP: Record<Skill, string> = {
  listening:
    "Тренируйте Section 4: заполнение пропусков по академическим лекциям с записью ключевых существительных.",
  reading:
    "Работайте над скоростью: ограничивайте время на каждый текст и практикуйте беглый просмотр.",
  writing:
    "Усиливайте связность абзацев и грамматическую точность, проверяя работу под таймер.",
  speaking:
    "Развивайте ответы по схеме «мнение → причина → пример», чтобы они звучали дольше и увереннее.",
};

function weakestSkill(t: MockTest): Skill {
  return SKILLS.reduce((w, s) => (t[s] < t[w] ? s : w), SKILLS[0]);
}

export function ExamHistory() {
  const { activeStudent } = useApp();
  const tests = activeStudent.mockTests;
  const [review, setReview] = React.useState<MockTest | null>(null);

  const ordered = [...tests].sort((a, b) => b.date.localeCompare(a.date));
  const first = tests[0];
  const latest = tests[tests.length - 1];
  const best = Math.max(...tests.map((t) => t.overall));
  const delta = latest.overall - first.overall;

  const stats = [
    {
      label: "Пройдено тестов",
      value: String(tests.length),
      icon: GraduationCap,
    },
    {
      label: "Лучший балл",
      value: formatBand(best),
      icon: TrendingUp,
    },
    {
      label: "Рост с первого mock",
      value: `${delta >= 0 ? "+" : ""}${formatBand(delta)}`,
      icon: Sparkles,
    },
  ];

  const weak = review ? weakestSkill(review) : null;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((st, i) => (
          <Card
            key={st.label}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {st.label}
                </p>
                <p className="tabular mt-1 font-display text-2xl font-bold">
                  {st.value}
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <st.icon className="h-4.5 w-4.5" size={18} />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trajectory */}
      <Card className="animate-fade-up" style={{ animationDelay: "160ms" }}>
        <CardHeader>
          <CardTitle className="font-display">Траектория общего балла</CardTitle>
          <CardDescription>
            Динамика итогового балла за {tests.length} mock-экзаменов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OverallTrendChart tests={tests} />
        </CardContent>
      </Card>

      {/* History table */}
      <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <CardHeader>
          <CardTitle className="font-display">Все попытки</CardTitle>
          <CardDescription>
            Разбивка по секциям L / R / W / S и итоговый балл каждого теста
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Дата</TableHead>
                <TableHead>Тест</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">S</TableHead>
                <TableHead className="text-center">Общий</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDayMonthYear(t.date)}
                  </TableCell>
                  <TableCell className="font-medium">{t.label}</TableCell>
                  {SKILLS.map((skill) => (
                    <TableCell key={skill} className="tabular text-center text-sm">
                      {formatBand(t[skill])}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <BandChip
                      band={t.overall}
                      target={activeStudent.targetBand}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReview(t)}
                    >
                      Разбор
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review modal */}
      <Dialog open={!!review} onOpenChange={(open) => !open && setReview(null)}>
        <DialogContent>
          {review && weak && (
            <>
              <DialogHeader>
                <DialogTitle>{review.label}</DialogTitle>
                <DialogDescription>
                  Экзамен от {formatDayMonthYear(review.date)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-4 gap-2">
                {SKILLS.map((skill) => (
                  <div
                    key={skill}
                    className="rounded-lg border bg-secondary/40 px-2 py-2.5 text-center"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {SKILL_LABELS[skill]}
                    </p>
                    <p className="tabular mt-1 font-display text-sm font-semibold">
                      {formatBand(review[skill])}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-secondary/40 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Итоговый балл
                </span>
                <BandChip
                  band={review.overall}
                  target={activeStudent.targetBand}
                  size="lg"
                />
              </div>

              {/* AI feedback */}
              <div className="space-y-2 rounded-lg border border-primary/25 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
                  <Bot className="h-3.5 w-3.5" /> AI-разбор
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">
                      Самая слабая секция — {SKILL_LABELS[weak]} (
                      {formatBand(review[weak])}). {SECTION_TIP[weak]}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">
                      {review.overall >= activeStudent.targetBand
                        ? `Итог ${formatBand(review.overall)} — целевой балл ${formatBand(activeStudent.targetBand)} достигнут. Держите форму.`
                        : `До целевого балла ${formatBand(activeStudent.targetBand)} осталось ${formatBand(activeStudent.targetBand - review.overall)}.`}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Teacher note */}
              <div className="space-y-1.5 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" /> Комментарий
                  преподавателя
                </div>
                <p className="text-sm leading-relaxed">
                  {activeStudent.teacherNote}
                </p>
              </div>

              <Badge variant="secondary" className="w-fit">
                Демо-отзыв
              </Badge>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

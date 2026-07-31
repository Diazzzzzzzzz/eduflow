"use client";

import {
  CalendarCheck2,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/components/app-provider";
import { centerStats } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** «в 1 группе / в 3 группах / в 5 группах» — russian plural for the hint. */
function groupNoun(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "группе";
  return "группах";
}

export function OverviewCards() {
  const { students } = useApp();
  const stats = centerStats(students);

  const cards = [
    {
      label: "Активные студенты",
      value: String(stats.totalStudents),
      hint: `в ${stats.groupCount} ${groupNoun(stats.groupCount)}`,
      icon: Users,
      tone: "text-primary bg-primary/15 ring-primary/30",
    },
    {
      label: "Средний балл",
      value: stats.avgBand.toFixed(1),
      // Real movement between each student's last two mocks, not a slogan.
      hint:
        stats.bandDelta === 0
          ? "без изменений к прошлому mock"
          : `${stats.bandDelta > 0 ? "+" : ""}${stats.bandDelta.toFixed(1)} к прошлому mock`,
      icon: TrendingUp,
      tone: "text-accent bg-accent/15 ring-accent/30",
    },
    {
      label: "Достижение целей",
      value: `${stats.targetMetRate}%`,
      hint: "в пределах 0.5 от целевого балла",
      icon: Target,
      tone: "text-success bg-success/15 ring-success/30",
    },
    {
      label: "Посещаемость",
      value: `${stats.attendance}%`,
      hint: "за последние 4 недели",
      icon: CalendarCheck2,
      tone: "text-warning bg-warning/15 ring-warning/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <Card
          key={card.label}
          className="animate-fade-up transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <p className="tabular mt-2 font-display text-3xl font-bold">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </div>
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
                card.tone
              )}
            >
              <card.icon className="h-4.5 w-4.5" size={18} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

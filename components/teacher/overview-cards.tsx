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

export function OverviewCards() {
  const { students } = useApp();
  const stats = centerStats(students);

  const cards = [
    {
      label: "Active students",
      value: String(stats.totalStudents),
      hint: `${stats.cohortSize} in your cohort`,
      icon: Users,
      tone: "text-primary bg-primary/15 ring-primary/30",
    },
    {
      label: "Average band score",
      value: stats.avgBand.toFixed(1),
      hint: "+0.4 vs last term",
      icon: TrendingUp,
      tone: "text-accent bg-accent/15 ring-accent/30",
    },
    {
      label: "Target met rate",
      value: `${stats.targetMetRate}%`,
      hint: "within 0.5 of target band",
      icon: Target,
      tone: "text-success bg-success/15 ring-success/30",
    },
    {
      label: "Attendance rate",
      value: `${stats.attendance}%`,
      hint: "past 4 weeks",
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

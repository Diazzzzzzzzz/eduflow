"use client";

import { OverviewCards } from "@/components/teacher/overview-cards";
import { Gradebook } from "@/components/teacher/gradebook";
import { WritingEvaluator } from "@/components/teacher/writing-evaluator";
import { TeacherNav } from "@/components/teacher/teacher-nav";

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <TeacherNav />
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Добрый день, Дана
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Как ваш центр показывает себя в этом семестре.
        </p>
      </div>
      <OverviewCards />
      <Gradebook />
      <WritingEvaluator />
    </div>
  );
}

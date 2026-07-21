"use client";

import { OverviewCards } from "@/components/teacher/overview-cards";
import { Gradebook } from "@/components/teacher/gradebook";
import { WritingEvaluator } from "@/components/teacher/writing-evaluator";

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Good afternoon, Dana
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s how your center is tracking this term.
        </p>
      </div>
      <OverviewCards />
      <Gradebook />
      <WritingEvaluator />
    </div>
  );
}

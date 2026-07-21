"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Clock,
  Headphones,
  ListChecks,
  Mic,
  PenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DIFFICULTY_VARIANT,
  PRACTICE_MODULES,
  SECTION_META,
  SECTION_ORDER,
  type PracticeModule,
} from "@/lib/practice-data";
import type { Skill } from "@/lib/types";

const SECTION_ICONS: Record<Skill, typeof Headphones> = {
  listening: Headphones,
  reading: BookOpenCheck,
  writing: PenLine,
  speaking: Mic,
};

function moduleCountLabel(m: PracticeModule) {
  return m.questions === 1 ? "1 задание" : `${m.questions} вопр.`;
}

export function PracticeHub() {
  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h2 className="font-display text-lg font-semibold">Практика по секциям</h2>
        <p className="text-sm text-muted-foreground">
          Выберите модуль, чтобы открыть тренировочный интерфейс. Задания
          демонстрационные — реальные варианты появятся позже.
        </p>
      </div>

      {SECTION_ORDER.map((section, si) => {
        const meta = SECTION_META[section];
        const Icon = SECTION_ICONS[section];
        const modules = PRACTICE_MODULES.filter((m) => m.section === section);
        return (
          <section
            key={section}
            className="animate-fade-up space-y-3"
            style={{ animationDelay: `${si * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <Icon className="h-4.5 w-4.5" size={18} />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold leading-tight">
                  {meta.name}{" "}
                  <span className="text-muted-foreground">· {meta.ru}</span>
                </h3>
                <p className="text-xs text-muted-foreground">{meta.blurb}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((m) => (
                <Link
                  key={m.id}
                  href={`/student/practice/${section}`}
                  className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium leading-snug">{m.title}</p>
                        <Badge variant={DIFFICULTY_VARIANT[m.difficulty]}>
                          {m.difficulty}
                        </Badge>
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                        {m.description}
                      </p>
                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="tabular inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {m.duration} мин
                          </span>
                          <span className="tabular inline-flex items-center gap-1">
                            <ListChecks className="h-3.5 w-3.5" />{" "}
                            {moduleCountLabel(m)}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                          Начать
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

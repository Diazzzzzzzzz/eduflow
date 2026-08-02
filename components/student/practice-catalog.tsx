"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Headphones,
  Layers,
  ListChecks,
  Mic,
  PenLine,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PaperListing } from "@/lib/exam/service";
import { CATALOG_SECTIONS, type SectionId } from "@/lib/catalog-data";

const SECTION_ICONS: Record<SectionId, typeof Layers> = {
  all: Layers,
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

/** Russian plural: 1 тест, 2 теста, 5 тестов. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function PracticeCatalog({
  papers = [],
}: {
  /** Papers the exam engine can actually open, from the server. */
  papers?: PaperListing[];
}) {
  const [section, setSection] = React.useState<SectionId>("all");

  const meta = CATALOG_SECTIONS.find((s) => s.id === section)!;
  const countFor = (id: SectionId) =>
    id === "all" ? papers.length : papers.filter((p) => p.skill === id).length;

  const visiblePapers = papers.filter(
    (p) => section === "all" || p.skill === section
  );

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left column — section sidebar */}
      <aside className="col-span-12 lg:col-span-3">
        <div className="space-y-1.5 lg:sticky lg:top-24">
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Секции
          </p>
          {CATALOG_SECTIONS.map((s) => {
            const Icon = SECTION_ICONS[s.id];
            const active = s.id === section;
            const count = countFor(s.id);
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="text-sm font-medium">{s.en}</span>
                  <span
                    className={cn(
                      "text-[11px]",
                      active ? "text-primary/80" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </span>
                {/* The real number of openable papers, so a section with none
                    says so here rather than after a click. */}
                <span
                  className={cn(
                    "tabular shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                    count === 0
                      ? "text-muted-foreground/60"
                      : active
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Drills sit beside the sections: same navigation, different unit of
              practice — one question type instead of one paper. */}
          <div className="pt-3">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Точечная практика
            </p>
            <Link
              href="/student/practice/drills"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Target className="h-4 w-4 shrink-0" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-medium">По типам вопросов</span>
                <span className="text-[11px]">
                  TFNG, Headings, MCQ и другие
                </span>
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Right column — the papers themselves */}
      <div className="col-span-12 space-y-4 lg:col-span-9">
        <div className="animate-fade-up">
          <h2 className="font-display text-lg font-semibold">
            {meta.en}{" "}
            <span className="text-muted-foreground">· {meta.label}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {visiblePapers.length > 0 ? (
              <>
                {visiblePapers.length}{" "}
                {plural(visiblePapers.length, "тест", "теста", "тестов")} с
                проверкой ответов и подсчётом балла.{" "}
                <span className="tabular">{meta.duration}</span>.
              </>
            ) : (
              <>Здесь пока нет тестов.</>
            )}
          </p>
        </div>

        {visiblePapers.length > 0 ? (
          <div key={`papers-${section}`} className="animate-fade-up space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {visiblePapers.map((p) => (
                <Card key={p.id} className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-tight">{p.title}</p>
                      <Badge variant={p.imported ? "secondary" : "success"}>
                        {p.imported ? "Импортирован" : "Готов"}
                      </Badge>
                    </div>
                    <p className="tabular flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {p.durationMinutes} мин
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ListChecks className="h-3.5 w-3.5" /> {p.questions}{" "}
                        {plural(p.questions, "вопрос", "вопроса", "вопросов")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" /> {p.passages}{" "}
                        {plural(p.passages, "текст", "текста", "текстов")}
                      </span>
                    </p>
                    <Link
                      href={`/student/practice/${p.skill}?paper=${encodeURIComponent(p.id)}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "mt-auto w-full"
                      )}
                    >
                      Начать тест
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <EmptySection label={meta.label} />
        )}
      </div>
    </div>
  );
}

/** Honest placeholder for a section with nothing to open yet. */
function EmptySection({ label }: { label: string }) {
  return (
    <Card className="animate-fade-up">
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <BookOpen className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium">Тестов в разделе «{label}» пока нет</p>
          <p className="mx-auto mt-1 max-w-[42ch] text-sm text-muted-foreground">
            Они появятся, как только центр их загрузит. Сейчас доступны тесты в
            разделе «Чтение».
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  Clock,
  Headphones,
  Layers,
  ListChecks,
  Mic,
  PenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CAMBRIDGE_BOOKS,
  CATALOG_SECTIONS,
  TESTS_PER_BOOK,
  progressFor,
  statusLabel,
  statusTone,
  type SectionId,
} from "@/lib/catalog-data";

const SECTION_ICONS: Record<SectionId, typeof Layers> = {
  full: Layers,
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

export function PracticeCatalog() {
  const [section, setSection] = React.useState<SectionId>("full");
  const [openBook, setOpenBook] = React.useState<number>(CAMBRIDGE_BOOKS[0]);

  const meta = CATALOG_SECTIONS.find((s) => s.id === section)!;

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
                <span className="flex flex-col leading-tight">
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
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right column — Cambridge catalog */}
      <div className="col-span-12 space-y-4 lg:col-span-9">
        <div className="animate-fade-up">
          <h2 className="font-display text-lg font-semibold">
            {meta.en}{" "}
            <span className="text-muted-foreground">· {meta.label}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Cambridge IELTS 20–12 · выберите тест и начните.{" "}
            <span className="tabular">
              {meta.duration} • {meta.questions}
            </span>
            .
          </p>
        </div>

        {/* key=section remounts the list so it fades in on section change */}
        <div key={section} className="animate-fade-up space-y-3">
          {CAMBRIDGE_BOOKS.map((book) => {
            const open = openBook === book;
            const doneCount = TESTS_PER_BOOK.filter(
              (t) => progressFor(book, t).status === "done"
            ).length;
            return (
              <Card key={book} className="overflow-hidden">
                <button
                  onClick={() => setOpenBook(open ? -1 : book)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-secondary/40"
                >
                  <div>
                    <p className="font-display font-semibold">
                      Cambridge IELTS {book} Academic
                    </p>
                    <p className="text-xs text-muted-foreground">
                      4 теста · пройдено {doneCount}/4
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180"
                    )}
                  />
                </button>

                {open && (
                  <CardContent className="grid gap-3 border-t pt-4 sm:grid-cols-2">
                    {TESTS_PER_BOOK.map((t) => {
                      const p = progressFor(book, t);
                      return (
                        <div
                          key={t}
                          className="flex flex-col gap-2 rounded-lg border p-3 transition-shadow hover:shadow-card"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">
                              Cambridge {book} — Test {t}
                            </p>
                            <Badge variant={statusTone(p)} className="whitespace-nowrap">
                              {statusLabel(p)}
                            </Badge>
                          </div>
                          <p className="tabular flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {meta.duration}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <ListChecks className="h-3.5 w-3.5" /> {meta.questions}
                            </span>
                          </p>
                          <Link
                            href={`/student/practice/${meta.engine}`}
                            className={cn(
                              buttonVariants({ size: "sm" }),
                              "mt-1 w-full"
                            )}
                          >
                            Начать тест
                          </Link>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

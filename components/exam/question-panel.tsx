"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamPassage, QuestionGroup } from "@/lib/exam/types";
import { ExamDiagramView } from "./diagrams";
import { QuestionRenderer } from "./question-renderers";
import { useExamSession } from "./exam-session";

function GroupBlock({ group }: { group: QuestionGroup }) {
  const { answers } = useExamSession();
  const answered = group.questions.filter(
    (q) => answers[q.id] !== undefined
  ).length;

  return (
    <section
      aria-labelledby={`group-${group.id}`}
      className="space-y-3 border-t pt-5 first:border-t-0 first:pt-0"
    >
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            id={`group-${group.id}`}
            className="font-display text-sm font-bold"
          >
            Questions {group.from}
            {group.to > group.from && `–${group.to}`}
          </h3>
          <span className="tabular shrink-0 text-xs text-muted-foreground">
            {answered}/{group.questions.length}
          </span>
        </div>
        <p className="rounded-md bg-secondary/60 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          {group.instructions}
        </p>
      </div>

      {group.diagram && (
        <figure className="space-y-2">
          <figcaption className="text-sm font-medium">
            {group.diagram.title}
          </figcaption>
          <ExamDiagramView id={group.diagram.id} />
          {group.diagram.caption && (
            <p className="text-xs text-muted-foreground">
              {group.diagram.caption}
            </p>
          )}
        </figure>
      )}

      {group.options && group.optionsTitle && (
        <div className="rounded-lg border bg-secondary/40 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {group.optionsTitle}
          </p>
          <ul className="space-y-1 text-sm">
            {group.options.map((opt) => (
              <li key={opt.value}>{opt.label}</li>
            ))}
          </ul>
        </div>
      )}

      {group.intro && (
        <p className="font-display text-sm font-semibold">{group.intro}</p>
      )}

      <div className="space-y-2">
        {group.questions.map((q) => (
          <QuestionRenderer key={q.id} group={group} question={q} />
        ))}
      </div>
    </section>
  );
}

export function QuestionPanel({
  passage,
  scrollRef,
}: {
  passage: ExamPassage;
  /** Exposed so the shell can link this pane's scrolling to the text pane. */
  scrollRef?: React.RefObject<HTMLDivElement>;
}) {
  const { answers } = useExamSession();
  const all = passage.groups.flatMap((g) => g.questions);
  const answered = all.filter((q) => answers[q.id] !== undefined).length;
  const from = passage.groups[0]?.from ?? 0;
  const lastGroup = passage.groups[passage.groups.length - 1];
  const to = lastGroup?.to ?? 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Вопросы
          </p>
          <p className="tabular font-display text-base font-semibold">
            {from}–{to}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-[width] duration-300",
                answered === all.length && "bg-success"
              )}
              style={{ width: `${(answered / Math.max(all.length, 1)) * 100}%` }}
            />
          </div>
          <span className="tabular text-xs text-muted-foreground">
            {answered}/{all.length}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="slim-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4"
      >
        <p className="flex items-start gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Ответы сохраняются автоматически. Отмечайте флажком вопросы, к которым
          хотите вернуться.
        </p>
        {passage.groups.map((g) => (
          <GroupBlock key={g.id} group={g} />
        ))}
      </div>
    </div>
  );
}

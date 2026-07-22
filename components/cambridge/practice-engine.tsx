"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SECTION_META } from "@/lib/practice-data";
import type { CambridgeTest } from "@/lib/cambridge-types";
import type { Skill } from "@/lib/types";
import { ReadingEngine } from "./reading-engine";
import { ListeningEngine } from "./listening-engine";
import { WritingEngine } from "./writing-engine";
import { SpeakingEngine } from "./speaking-engine";
import { useElapsed } from "./use-timer";

const ENGINES: Record<Skill, (p: { test: CambridgeTest }) => React.ReactElement> = {
  reading: ReadingEngine,
  listening: ListeningEngine,
  writing: WritingEngine,
  speaking: SpeakingEngine,
};

export function PracticeEngine({ section }: { section: Skill }) {
  const meta = SECTION_META[section];
  const [test, setTest] = React.useState<CambridgeTest | null>(null);
  const [state, setState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const elapsed = useElapsed();

  React.useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`/api/cambridge?section=${section}`)
      .then((r) => r.json())
      .then((j: { test?: CambridgeTest }) => {
        if (cancelled) return;
        if (j.test) {
          setTest(j.test);
          setState("ready");
        } else {
          setState("error");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [section]);

  const Engine = ENGINES[section];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/student/practice"
            className="flex h-8 w-8 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            aria-label="Назад к практике"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="font-display text-lg font-semibold leading-tight">
              {meta.name}{" "}
              <span className="text-muted-foreground">· {meta.ru}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {test ? test.title : "Тренировочная сессия"}
            </p>
          </div>
          <Badge>Демо</Badge>
        </div>
        <span className="tabular inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Clock className="h-3.5 w-3.5 text-primary" /> {elapsed}
        </span>
      </div>

      {state === "loading" && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {state === "error" && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Не удалось загрузить тест. Попробуйте обновить страницу.
          </CardContent>
        </Card>
      )}

      {state === "ready" && test && <Engine test={test} />}
    </div>
  );
}

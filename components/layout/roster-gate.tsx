"use client";

import { AlertTriangle, RotateCw, Users } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Holds back page content until the roster has actually loaded.
 *
 * Every workspace screen derives from `students` — group membership, the
 * student picker, centre KPIs. Rendering them against a placeholder roster
 * makes the page paint one cohort and then visibly replace it, so this shows
 * a skeleton for that window instead. Chrome (top bar, footer) stays put, so
 * only the content area is affected.
 */
export function RosterGate({ children }: { children: React.ReactNode }) {
  const { rosterStatus, students, reloadRoster } = useApp();

  if (rosterStatus === "loading") return <RosterSkeleton />;

  if (rosterStatus === "error") {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium">Не удалось загрузить список студентов</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Проверьте соединение — данные центра не были получены.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reloadRoster}>
            <RotateCw /> Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium">В центре пока нет студентов</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Добавьте студентов в базу, чтобы увидеть группы, журнал и
              аналитику.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

/** Neutral placeholder shaped like the workspace: header, cards, then a list. */
function RosterSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-live="polite">
      <span className="sr-only">Загружаем данные центра…</span>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-60 rounded-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1 max-w-[220px]" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

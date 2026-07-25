import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listDrills } from "@/lib/exam/drills";

export const dynamic = "force-dynamic";

/**
 * Drill catalogue: one card per question type, sized by how much material the
 * paper catalogue currently holds for it.
 */
export default function DrillsPage() {
  const drills = listDrills();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-3">
          <Link
            href="/student/practice"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            aria-label="Назад к практике"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="font-display text-lg font-semibold leading-tight">
              Тренировка по типам вопросов
            </h2>
            <p className="text-sm text-muted-foreground">
              Отрабатывайте один формат заданий подряд — вопросы собраны из всех
              текстов каталога.
            </p>
          </div>
        </div>
      </div>

      {drills.length === 0 ? (
        <div className="rounded-lg border border-dashed py-14 text-center">
          <p className="font-medium">Пока нет материала для тренировок</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Добавьте тест через админку — вопросы автоматически попадут в
            соответствующие категории.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {drills.map((drill, i) => (
            <Link
              key={drill.type}
              href={`/student/practice/drills/${drill.type}`}
              className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card
                className="h-full animate-fade-up transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-card-hover"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      <Target className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>

                  <div className="flex-1">
                    <p className="font-display font-semibold leading-tight">
                      {drill.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {drill.ru}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {drill.blurb}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
                    <span className="tabular font-medium text-foreground">
                      {drill.questions} вопрос
                      {drill.questions % 10 === 1 && drill.questions % 100 !== 11
                        ? ""
                        : "ов"}
                    </span>
                    <span className="tabular inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> ~{drill.minutes} мин
                    </span>
                    <span className="tabular ml-auto">
                      {drill.passages} текст
                      {drill.passages % 10 === 1 && drill.passages % 100 !== 11
                        ? ""
                        : drill.passages % 10 >= 2 &&
                            drill.passages % 10 <= 4 &&
                            (drill.passages % 100 < 10 ||
                              drill.passages % 100 >= 20)
                          ? "а"
                          : "ов"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

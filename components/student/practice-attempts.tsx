import Link from "next/link";
import { History } from "lucide-react";
import { BandChip } from "@/components/band-chip";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { plural } from "@/lib/plural";
import type { ExamAttempt } from "@/lib/data/exam-attempts";

const SKILL_LABEL: Record<ExamAttempt["skill"], string> = {
  reading: "Чтение",
  listening: "Аудирование",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} мин ${s} с` : `${s} с`;
}

/**
 * Attempts at practice papers, as recorded by the exam engine.
 *
 * Separate from the mock-exam table above it: a mock is a full four-skill sitting
 * entered by a teacher, whereas this is one paper the student ran themselves and
 * the engine marked.
 */
export function PracticeAttempts({ attempts }: { attempts: ExamAttempt[] }) {
  if (attempts.length === 0) {
    return (
      <Card className="animate-fade-up" style={{ animationDelay: "320ms" }}>
        <CardHeader>
          <CardTitle className="font-display">Практика по секциям</CardTitle>
          <CardDescription>
            Здесь появятся тесты, которые вы пройдёте самостоятельно.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <History className="h-5 w-5" />
          </span>
          <p className="max-w-[40ch] text-sm text-muted-foreground">
            Вы ещё не проходили тесты в разделе «Практика». Результат
            сохраняется автоматически сразу после сдачи.
          </p>
          <Link
            href="/student/practice"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Выбрать тест
          </Link>
        </CardContent>
      </Card>
    );
  }

  const best = attempts.reduce(
    (b, a) => (a.band != null && (b == null || a.band > b) ? a.band : b),
    null as number | null
  );

  return (
    <Card className="animate-fade-up" style={{ animationDelay: "320ms" }}>
      <CardHeader>
        <CardTitle className="font-display">Практика по секциям</CardTitle>
        <CardDescription>
          {attempts.length}{" "}
          {plural(attempts.length, "попытка", "попытки", "попыток")}
          {best != null && <> · лучший балл {best.toFixed(1)}</>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Дата</TableHead>
                <TableHead>Тест</TableHead>
                <TableHead>Секция</TableHead>
                <TableHead className="text-center">Верно</TableHead>
                <TableHead className="text-center">Время</TableHead>
                <TableHead className="text-center">Балл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="tabular whitespace-nowrap text-xs text-muted-foreground">
                    {formatWhen(a.completedAt)}
                  </TableCell>
                  <TableCell className="min-w-[14rem] text-sm font-medium">
                    {a.paperTitle}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {SKILL_LABEL[a.skill]}
                  </TableCell>
                  <TableCell className="tabular text-center text-sm">
                    {a.correct}/{a.total}
                  </TableCell>
                  <TableCell className="tabular whitespace-nowrap text-center text-xs text-muted-foreground">
                    {formatDuration(a.durationSeconds)}
                  </TableCell>
                  <TableCell className="text-center">
                    {a.band != null ? (
                      <BandChip band={a.band} size="sm" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

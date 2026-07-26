"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  FileJson,
  FileUp,
  Loader2,
  Package,
  RotateCw,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDayMonthYear } from "@/lib/date";
import type { PaperSummary } from "@/lib/data/exam-papers";
import type { ImportIssue } from "@/lib/exam/import-schema";

interface BundledPaper {
  slug: string;
  title: string;
  skill: "reading" | "listening";
  durationMinutes: number;
  passages: number;
  questions: number;
}

interface Catalog {
  imported: PaperSummary[];
  bundled: BundledPaper[];
}

const SKILL_LABEL: Record<string, string> = {
  reading: "Reading",
  listening: "Listening",
};

export function TestCatalog() {
  const [data, setData] = React.useState<Catalog | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [busy, setBusy] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<PaperSummary | null>(
    null
  );

  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/tests");
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as Catalog);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function togglePublished(paper: PaperSummary) {
    setBusy(paper.slug);
    try {
      await fetch("/api/admin/tests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: paper.slug, published: !paper.published }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function remove(paper: PaperSummary) {
    setBusy(paper.slug);
    try {
      await fetch(`/api/admin/tests?slug=${encodeURIComponent(paper.slug)}`, {
        method: "DELETE",
      });
      setConfirmDelete(null);
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (status === "loading") return <CatalogSkeleton />;

  if (status === "error" || !data) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <p className="font-medium">Не удалось загрузить каталог тестов</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RotateCw /> Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Тесты
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Каталог экзаменационных работ центра. Импортированные тесты сразу
            попадают в практику студентов.
          </p>
        </div>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          К панели директора
        </Link>
      </div>

      <ImportDropzone onImported={load} />

      {/* Imported */}
      <Card className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <CardHeader>
          <CardTitle className="font-display">
            Импортированные
            <span className="tabular ml-2 text-sm font-normal text-muted-foreground">
              {data.imported.length}
            </span>
          </CardTitle>
          <CardDescription>
            Хранятся в базе центра. Скрытые тесты не видны студентам.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.imported.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <FileJson className="h-5 w-5" />
              </span>
              <p className="font-medium">Импортированных тестов пока нет</p>
              <p className="max-w-[42ch] text-sm text-muted-foreground">
                Загрузите JSON-файл выше — он будет проверен по схеме и сразу
                появится в каталоге практики.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Название</TableHead>
                  <TableHead>Модуль</TableHead>
                  <TableHead className="text-center">Пассажи</TableHead>
                  <TableHead className="text-center">Вопросы</TableHead>
                  <TableHead>Загрузил</TableHead>
                  <TableHead className="text-center">Статус</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.imported.map((p) => (
                  <TableRow key={p.slug}>
                    <TableCell>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.slug} · {formatDayMonthYear(p.updatedAt.slice(0, 10))}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{SKILL_LABEL[p.skill]}</Badge>
                    </TableCell>
                    <TableCell className="tabular text-center text-sm">
                      {p.passages}
                    </TableCell>
                    <TableCell className="tabular text-center text-sm">
                      {p.questions}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.importedBy ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={p.published ? "success" : "secondary"}>
                        {p.published ? "Опубликован" : "Скрыт"}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-52 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/student/practice/${p.skill}?paper=${encodeURIComponent(p.slug)}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" })
                          )}
                        >
                          Открыть
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy === p.slug}
                          onClick={() => void togglePublished(p)}
                          aria-label={
                            p.published ? "Скрыть от студентов" : "Опубликовать"
                          }
                        >
                          {p.published ? <EyeOff /> : <Eye />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={busy === p.slug}
                          onClick={() => setConfirmDelete(p)}
                          aria-label="Удалить тест"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bundled */}
      <Card className="animate-fade-up" style={{ animationDelay: "140ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Package className="h-4 w-4 text-muted-foreground" />
            Встроенные материалы
          </CardTitle>
          <CardDescription>
            Поставляются с платформой и доступны студентам, пока не загружены
            свои. Управляются в коде, а не отсюда.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.bundled.map((p) => (
              <li
                key={p.slug}
                className="flex flex-wrap items-center gap-3 rounded-lg border bg-secondary/30 p-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {p.title}
                  </span>
                  <span className="tabular block text-xs text-muted-foreground">
                    {SKILL_LABEL[p.skill]} · {p.passages} пассаж(а) ·{" "}
                    {p.questions} вопросов · {p.durationMinutes} мин
                  </span>
                </span>
                <Link
                  href={`/student/practice/${p.skill}?paper=${encodeURIComponent(p.slug)}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  Открыть
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить тест?</DialogTitle>
            <DialogDescription>
              «{confirmDelete?.title}» будет удалён из базы вместе с вопросами и
              ключами. Студенты потеряют к нему доступ. Действие необратимо.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={!!busy}
              onClick={() => confirmDelete && void remove(confirmDelete)}
            >
              <Trash2 /> Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface Preview {
  fileName: string;
  paper: unknown;
  summary: {
    title: string;
    skill: string;
    passages: number;
    questions: number;
    marks: number;
  };
}

function ImportDropzone({ onImported }: { onImported: () => void }) {
  const [dragging, setDragging] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [issues, setIssues] = React.useState<ImportIssue[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<Preview | null>(null);
  const [done, setDone] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function reset() {
    setIssues(null);
    setError(null);
    setPreview(null);
    setDone(null);
  }

  /** Parse locally, then validate on the server before offering to save. */
  async function handleFile(file: File) {
    reset();
    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Нужен файл с расширением .json");
      return;
    }
    setChecking(true);
    try {
      const text = await file.text();
      let paper: unknown;
      try {
        paper = JSON.parse(text);
      } catch (e) {
        setError(
          `Файл не разбирается как JSON: ${e instanceof Error ? e.message : "ошибка синтаксиса"}`
        );
        return;
      }

      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper, dryRun: true }),
      });
      const body = (await res.json()) as {
        valid?: boolean;
        summary?: Preview["summary"];
        error?: string;
        issues?: ImportIssue[];
      };
      if (!res.ok) {
        setError(body.error ?? "Файл не прошёл проверку");
        setIssues(body.issues ?? null);
        return;
      }
      setPreview({ fileName: file.name, paper, summary: body.summary! });
    } finally {
      setChecking(false);
    }
  }

  async function commit() {
    if (!preview) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper: preview.paper }),
      });
      const body = (await res.json()) as {
        slug?: string;
        replaced?: boolean;
        error?: string;
        issues?: ImportIssue[];
      };
      if (!res.ok) {
        setError(body.error ?? "Не удалось сохранить");
        setIssues(body.issues ?? null);
        return;
      }
      setDone(
        body.replaced
          ? `Тест «${preview.summary.title}» обновлён.`
          : `Тест «${preview.summary.title}» импортирован.`
      );
      setPreview(null);
      onImported();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="animate-fade-up">
      <CardContent className="space-y-4 p-5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary/20"
          )}
        >
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
              dragging
                ? "bg-primary/15 text-primary"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {checking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileUp className="h-5 w-5" />
            )}
          </span>
          <div>
            <p className="font-medium">
              {checking
                ? "Проверяем файл…"
                : "Перетащите JSON-файл теста сюда"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Файл проверяется по схеме до сохранения — ничего не попадёт в базу
              без валидации.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={checking}
            onClick={() => inputRef.current?.click()}
          >
            <Upload /> Импортировать тест (JSON)
          </Button>
        </div>

        {done && (
          <p className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {done}
          </p>
        )}

        {error && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        {issues && issues.length > 0 && (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-3">
            <p className="text-sm font-medium text-warning">
              Ошибки в файле ({issues.length})
            </p>
            <ul className="mt-2 space-y-1.5">
              {issues.slice(0, 12).map((issue, i) => (
                <li key={i} className="text-xs">
                  <code className="rounded bg-card px-1 py-0.5 text-[11px] text-muted-foreground">
                    {issue.path || "корень"}
                  </code>{" "}
                  <span className="text-muted-foreground">{issue.message}</span>
                </li>
              ))}
              {issues.length > 12 && (
                <li className="text-xs text-muted-foreground">
                  …и ещё {issues.length - 12}
                </li>
              )}
            </ul>
          </div>
        )}

        {preview && (
          <div className="rounded-lg border bg-secondary/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Файл прошёл проверку
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {preview.fileName}
                </p>
              </div>
              <div className="tabular flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{SKILL_LABEL[preview.summary.skill] ?? preview.summary.skill}</span>
                <span>{preview.summary.passages} пассаж(а)</span>
                <span>{preview.summary.questions} вопросов</span>
                <span>{preview.summary.marks} баллов</span>
              </div>
            </div>
            <p className="mt-2 font-display font-semibold">
              {preview.summary.title}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button disabled={saving} onClick={() => void commit()}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" /> Сохранение…
                  </>
                ) : (
                  <>
                    <FileJson /> Сохранить в базу
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset}>
                Отмена
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-live="polite">
      <span className="sr-only">Загружаем каталог тестов…</span>
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-32 w-full rounded-xl" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-5 w-44" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="ml-auto h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

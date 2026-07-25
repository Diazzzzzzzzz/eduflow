"use client";

import { CheckCircle2, CircleDashed, FileText, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  LESSON_SKILL_LABELS,
  LESSON_STATUS_LABELS,
  type Lesson,
  type LessonStatus,
} from "@/lib/lessons-data";
import { PdfViewer } from "./pdf-viewer";

const STATUS_ICON: Record<LessonStatus, typeof CheckCircle2> = {
  completed: CheckCircle2,
  current: PlayCircle,
  upcoming: CircleDashed,
};

const STATUS_VARIANT = {
  completed: "success",
  current: "default",
  upcoming: "secondary",
} as const;

/** Lesson detail with its materials rendered inline. */
export function LessonDialog({
  lesson,
  status,
  total,
  onClose,
}: {
  lesson: Lesson | null;
  status: LessonStatus;
  total: number;
  onClose: () => void;
}) {
  const Icon = lesson ? STATUS_ICON[status] : CircleDashed;
  const pdf = lesson?.materials.find((m) => m.kind === "pdf");
  const links = lesson?.materials.filter((m) => m.kind === "link") ?? [];

  return (
    <Dialog open={!!lesson} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        {lesson && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset",
                    status === "completed" &&
                      "bg-success/10 text-success ring-success/25",
                    status === "current" &&
                      "bg-primary/10 text-primary ring-primary/25",
                    status === "upcoming" &&
                      "bg-secondary text-muted-foreground ring-border"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <Badge variant={STATUS_VARIANT[status]}>
                  {LESSON_STATUS_LABELS[status]}
                </Badge>
                <Badge variant="secondary">
                  {LESSON_SKILL_LABELS[lesson.skill]}
                </Badge>
              </div>
              <DialogTitle className="pt-1 text-left">
                {lesson.title}
              </DialogTitle>
              <DialogDescription className="tabular text-left">
                Урок {lesson.number} из {total}
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {lesson.summary}
            </p>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Материалы
              </p>

              {pdf ? (
                <PdfViewer url={pdf.url} title={pdf.title} />
              ) : links.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-medium">Материалов пока нет</p>
                  <p className="max-w-[38ch] text-xs text-muted-foreground">
                    Преподаватель приложит раздаточные материалы к этому уроку —
                    они появятся здесь.
                  </p>
                </div>
              ) : null}

              {links.length > 0 && (
                <ul className="space-y-1.5">
                  {links.map((m) => (
                    <li key={m.id}>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {m.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

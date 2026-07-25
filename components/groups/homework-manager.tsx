"use client";

import * as React from "react";
import { CalendarClock, Plus } from "lucide-react";
import { useGroups } from "@/components/groups/groups-provider";
import { GradeDialog } from "@/components/groups/grade-dialog";
import { EssayReviewDialog } from "@/components/teacher/essay-review";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatBand } from "@/lib/band";
import { formatDayMonthYear } from "@/lib/date";
import {
  SECTION_LABELS,
  submissionStatusMeta,
  type HomeworkSection,
  type Submission,
} from "@/lib/group-data";
import type { Student } from "@/lib/types";

const SECTIONS: HomeworkSection[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
  "general",
];

function CreateHomeworkDialog({ groupName }: { groupName: string }) {
  const { createHomework } = useGroups();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [section, setSection] = React.useState<HomeworkSection>("writing");
  const [dueDate, setDueDate] = React.useState("");

  function save() {
    if (!title.trim()) return;
    createHomework({ groupName, title: title.trim(), description, section, dueDate });
    setOpen(false);
    setTitle("");
    setDescription("");
    setSection("writing");
    setDueDate("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Создать задание
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новое домашнее задание</DialogTitle>
          <DialogDescription>
            Задание получат все студенты группы {groupName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hw-title">Название</Label>
            <Input
              id="hw-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. Writing Task 2: Эссе о технологиях"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hw-desc">Описание</Label>
            <Textarea
              id="hw-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Что нужно сделать…"
              className="min-h-[90px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="hw-section">Секция IELTS</Label>
              <Select
                value={section}
                onValueChange={(v) => setSection(v as HomeworkSection)}
              >
                <SelectTrigger id="hw-section">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SECTION_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hw-due">Срок сдачи</Label>
              <Input
                id="hw-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={save} disabled={!title.trim()}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HomeworkManager({
  groupName,
  students,
}: {
  groupName: string;
  students: Student[];
}) {
  const { homework, submissions } = useGroups();
  const [grade, setGrade] = React.useState<Submission | null>(null);
  const [today, setToday] = React.useState("");

  React.useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  const groupHomework = homework.filter((h) => h.groupName === groupName);
  const nameById = React.useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s.name])),
    [students]
  );
  // The task behind the submission being marked — decides which reviewer opens.
  const gradeHomework = grade
    ? homework.find((h) => h.id === grade.homeworkId)
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Домашние задания ({groupHomework.length})</p>
        <CreateHomeworkDialog groupName={groupName} />
      </div>

      {groupHomework.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          Заданий пока нет. Создайте первое.
        </div>
      ) : (
        groupHomework.map((hw) => {
          const subs = submissions.filter((s) => s.homeworkId === hw.id);
          const graded = subs.filter((s) => s.status === "graded").length;
          const submitted = subs.filter((s) => s.status !== "assigned").length;
          return (
            <Card key={hw.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{hw.title}</p>
                      <Badge variant="secondary">{SECTION_LABELS[hw.section]}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {hw.description}
                    </p>
                  </div>
                  {hw.dueDate && (
                    <span className="tabular inline-flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" /> до{" "}
                      {formatDayMonthYear(hw.dueDate)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Сдали: {submitted}/{subs.length} · Проверено: {graded}
                </p>

                <div className="space-y-1.5">
                  {subs.map((sub) => {
                    const meta = submissionStatusMeta(sub, hw, today);
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="font-medium">
                          {nameById[sub.studentId] ?? "—"}
                        </span>
                        <div className="flex items-center gap-2">
                          {sub.band != null && (
                            <span className="tabular text-xs text-muted-foreground">
                              {formatBand(sub.band)}
                            </span>
                          )}
                          <Badge variant={meta.tone}>{meta.label}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGrade(sub)}
                          >
                            Проверить
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Writing gets the four-criteria essay reviewer; everything else the
          single-band dialog. */}
      <GradeDialog
        submission={gradeHomework?.section === "writing" ? null : grade}
        studentName={grade ? nameById[grade.studentId] ?? "" : ""}
        onClose={() => setGrade(null)}
      />
      <EssayReviewDialog
        submission={gradeHomework?.section === "writing" ? grade : null}
        homework={gradeHomework ?? null}
        studentName={grade ? nameById[grade.studentId] ?? "" : ""}
        onClose={() => setGrade(null)}
      />
    </div>
  );
}

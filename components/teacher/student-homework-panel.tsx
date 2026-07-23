"use client";

import * as React from "react";
import { CalendarClock, Plus } from "lucide-react";
import { useGroups } from "@/components/groups/groups-provider";
import { GradeDialog } from "@/components/groups/grade-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function statusMeta(status: Submission["status"]): {
  label: string;
  tone: "success" | "default" | "secondary";
} {
  if (status === "graded") return { label: "Сдано", tone: "success" };
  if (status === "submitted") return { label: "На проверке", tone: "default" };
  return { label: "Не сдано", tone: "secondary" };
}

function AssignHomeworkDialog({ student }: { student: Student }) {
  const { createHomework } = useGroups();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [section, setSection] = React.useState<HomeworkSection>("writing");
  const [dueDate, setDueDate] = React.useState("");
  const [target, setTarget] = React.useState<"individual" | "group">("individual");

  function save() {
    if (!title.trim()) return;
    createHomework({
      groupName: student.group,
      title: title.trim(),
      description,
      section,
      dueDate,
      assignToStudentIds: target === "individual" ? [student.id] : undefined,
    });
    setOpen(false);
    setTitle("");
    setDescription("");
    setSection("writing");
    setDueDate("");
    setTarget("individual");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Задать домашнее задание
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новое задание</DialogTitle>
          <DialogDescription>
            Индивидуально для {student.name} или всей группе {student.group}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { v: "individual", l: "Только студенту" },
                { v: "group", l: "Всей группе" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setTarget(o.v)}
                className={
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors " +
                  (target === o.v
                    ? "border-primary bg-primary/10 text-primary"
                    : "bg-card text-muted-foreground hover:bg-secondary")
                }
              >
                {o.l}
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="a-title">Название</Label>
            <Input
              id="a-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. Writing Task 2: Эссе"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="a-desc">Задание</Label>
            <Textarea
              id="a-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Текст задания / что приложить…"
              className="min-h-[90px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="a-section">Секция IELTS</Label>
              <Select
                value={section}
                onValueChange={(v) => setSection(v as HomeworkSection)}
              >
                <SelectTrigger id="a-section">
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
              <Label htmlFor="a-due">Срок сдачи</Label>
              <Input
                id="a-due"
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
            Задать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StudentHomeworkPanel({ student }: { student: Student }) {
  const { homework, submissions } = useGroups();
  const [grade, setGrade] = React.useState<Submission | null>(null);

  const rows = homework
    .filter((h) => h.groupName === student.group)
    .map((h) => ({
      hw: h,
      sub: submissions.find(
        (s) => s.homeworkId === h.id && s.studentId === student.id
      ),
    }))
    .filter((r): r is { hw: (typeof r)["hw"]; sub: Submission } => !!r.sub);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Домашние задания ({rows.length})</p>
        <AssignHomeworkDialog student={student} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          Заданий пока нет. Нажмите «Задать домашнее задание».
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map(({ hw, sub }) => {
            const meta = statusMeta(sub.status);
            return (
              <li key={hw.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{hw.title}</p>
                      <Badge variant="secondary">
                        {SECTION_LABELS[hw.section]}
                      </Badge>
                    </div>
                    {hw.dueDate && (
                      <p className="tabular mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" /> до{" "}
                        {formatDayMonthYear(hw.dueDate)}
                      </p>
                    )}
                  </div>
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
                      Проверить работу
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <GradeDialog
        submission={grade}
        studentName={student.name}
        onClose={() => setGrade(null)}
      />
    </div>
  );
}

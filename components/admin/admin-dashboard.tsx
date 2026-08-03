"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  RotateCw,
  Shuffle,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { BandChip } from "@/components/band-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatBand } from "@/lib/band";
import {
  formatWaiting,
  reviewIsLate,
  REVIEW_SLA_HOURS,
  STAFF_ROLE_LABELS,
} from "@/lib/admin-data";
import type { AdminOverview } from "@/lib/data/admin";
import { TeacherDetailDialog } from "@/components/admin/teacher-detail-dialog";

type Tab = "teachers" | "students";

export function AdminDashboard() {
  const [data, setData] = React.useState<AdminOverview | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );

  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as AdminOverview);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (status === "loading") return <DashboardSkeleton />;

  if (status === "error" || !data) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <p className="font-medium">Не удалось загрузить сводку центра</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RotateCw /> Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Панель директора
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Сводка по школе: успеваемость, загрузка преподавателей и очередь
          проверок.
        </p>
      </div>

      <KpiRow kpis={data.kpis} />
      <GroupsOverview groups={data.groups} />

      <div className="grid gap-4 xl:grid-cols-2">
        <PendingReviews items={data.pendingReviews} />
        <TeacherActivity teachers={data.teachers} />
      </div>

      <UserManagement data={data} onChanged={load} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function KpiRow({ kpis }: { kpis: AdminOverview["kpis"] }) {
  const cards = [
    {
      label: "Активные студенты",
      value: String(kpis.activeStudents),
      hint: "во всех группах центра",
      icon: Users,
      tone: "text-primary bg-primary/10 ring-primary/20",
    },
    {
      label: "Активные группы",
      value: String(kpis.activeGroups),
      hint: "с набранными студентами",
      icon: Layers,
      tone: "text-accent bg-accent/10 ring-accent/20",
    },
    {
      label: "Средний балл",
      value: formatBand(kpis.averageBand),
      hint: "по последним mock-экзаменам",
      icon: TrendingUp,
      tone: "text-success bg-success/10 ring-success/20",
    },
    {
      label: "Посещаемость",
      value: `${kpis.attendance}%`,
      hint:
        kpis.onTimeHomework === null
          ? "домашние вовремя — нет сданных работ"
          : `домашние вовремя — ${kpis.onTimeHomework}%`,
      icon: CheckCircle2,
      tone: "text-warning bg-warning/10 ring-warning/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <Card
          key={c.label}
          className="animate-fade-up transition-shadow hover:shadow-card-hover"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
              <p className="tabular mt-2 font-display text-3xl font-bold">
                {c.value}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {c.hint}
              </p>
            </div>
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
                c.tone
              )}
            >
              <c.icon className="h-4 w-4" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function GroupsOverview({ groups }: { groups: AdminOverview["groups"] }) {
  return (
    <Card className="animate-fade-up" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <CardTitle className="font-display">Группы</CardTitle>
        <CardDescription>
          Преподаватель, наполненность, место в программе и средний балл.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* A wide table must scroll inside its card, not push the page sideways. */}
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Группа</TableHead>
              <TableHead>Преподаватель</TableHead>
              <TableHead className="text-center">Студенты</TableHead>
              <TableHead>Программа</TableHead>
              <TableHead className="text-center">Средний балл</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => {
              const pct = Math.round((g.currentLesson / g.totalLessons) * 100);
              return (
                <TableRow key={g.name}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
                        {g.teacherInitials}
                      </span>
                      <span className="text-sm">{g.teacherName}</span>
                    </span>
                  </TableCell>
                  <TableCell className="tabular text-center text-sm">
                    {/* Capacity is a stored setting; without one, show the
                        headcount alone rather than inventing a denominator. */}
                    {g.capacity === null ? g.students : `${g.students}/${g.capacity}`}
                  </TableCell>
                  <TableCell className="min-w-[10rem]">
                    <div className="space-y-1">
                      <span className="tabular text-xs text-muted-foreground">
                        Урок {g.currentLesson}/{g.totalLessons}
                      </span>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <BandChip band={g.averageBand} size="sm" />
                  </TableCell>
                  <TableCell className="w-10 text-right">
                    <Link
                      href={`/teacher/groups/${encodeURIComponent(g.name)}`}
                      aria-label={`Открыть группу ${g.name}`}
                      className="inline-flex text-muted-foreground transition-colors hover:text-primary"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

function PendingReviews({ items }: { items: AdminOverview["pendingReviews"] }) {
  const late = items.filter((i) => reviewIsLate(i.hoursWaiting));

  return (
    <Card className="animate-fade-up" style={{ animationDelay: "260ms" }}>
      {/* flex-wrap + min-w-0: the badges are `shrink-0`, so on a narrow screen
          they used to push this header — and with it the page — wider than the
          viewport. */}
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <CardTitle className="font-display">На проверке</CardTitle>
          <CardDescription>
            Работы, ожидающие фидбека преподавателя.
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="secondary">{items.length}</Badge>
          {late.length > 0 && (
            <Badge variant="warning">{late.length} просрочено</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium">Очередь пуста</p>
            <p className="text-xs text-muted-foreground">
              Все сданные работы проверены.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((r) => {
              const overdue = reviewIsLate(r.hoursWaiting);
              return (
                <li
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3",
                    overdue ? "border-warning/40 bg-warning/5" : "bg-card"
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {r.studentName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {r.taskTitle} · {r.groupName} · {r.teacherName}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "tabular inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                      overdue
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : "text-muted-foreground"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    {formatWaiting(r.hoursWaiting)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Просроченным считается фидбек дольше {REVIEW_SLA_HOURS} часов.
        </p>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

function TeacherActivity({ teachers }: { teachers: AdminOverview["teachers"] }) {
  return (
    <Card className="animate-fade-up" style={{ animationDelay: "320ms" }}>
      <CardHeader>
        <CardTitle className="font-display">Загрузка преподавателей</CardTitle>
        <CardDescription>
          Группы, студенты и задержки с проверкой по каждому.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-lg border bg-card p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {t.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.name}</p>
              <p className="tabular truncate text-xs text-muted-foreground">
                {STAFF_ROLE_LABELS[t.role]} ·{" "}
                {t.groups.length ? t.groups.join(", ") : "без групп"} ·{" "}
                {t.students} студ.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {t.overdue > 0 ? (
                <Badge variant="warning">{t.overdue} просрочено</Badge>
              ) : t.pending > 0 ? (
                <Badge variant="default">{t.pending} на проверке</Badge>
              ) : (
                <Badge variant="success">без задержек</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

function UserManagement({
  data,
  onChanged,
}: {
  data: AdminOverview;
  onChanged: () => void;
}) {
  const [tab, setTab] = React.useState<Tab>("students");
  const [addOpen, setAddOpen] = React.useState<null | "student" | "teacher">(
    null
  );
  const [moving, setMoving] = React.useState<
    AdminOverview["students"][number] | null
  >(null);
  const [openTeacher, setOpenTeacher] = React.useState<
    AdminOverview["teachers"][number] | null
  >(null);

  const groupNames = data.groups.map((g) => g.name);

  return (
    <Card className="animate-fade-up" style={{ animationDelay: "380ms" }}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="font-display">Пользователи</CardTitle>
          <CardDescription>
            Состав центра: студенты и преподаватели.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
            {(
              [
                ["students", `Студенты (${data.students.length})`],
                ["teachers", `Преподаватели (${data.teachers.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  tab === id
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setAddOpen("student")}>
            <UserPlus /> Добавить студента
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddOpen("teacher")}
          >
            <Plus /> Добавить учителя
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
        {tab === "students" ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Студент</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Группа</TableHead>
                <TableHead className="text-center">Балл</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
                        {s.initials}
                      </span>
                      <span className="text-sm font-medium">{s.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{s.group}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <BandChip band={s.band} size="sm" />
                  </TableCell>
                  <TableCell className="w-32 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMoving(s)}
                    >
                      <Shuffle /> В группу
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Преподаватель</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Группы</TableHead>
                <TableHead className="text-center">Студенты</TableHead>
                <TableHead className="w-24 text-right">Аналитика</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.teachers.map((t) => (
                <TableRow
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Аналитика преподавателя ${t.name}`}
                  onClick={() => setOpenTeacher(t)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenTeacher(t);
                    }
                  }}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <TableCell>
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {t.initials}
                      </span>
                      <span className="text-sm font-medium">{t.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.email || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={t.role === "teacher" ? "secondary" : "default"}
                    >
                      {STAFF_ROLE_LABELS[t.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.groups.length ? t.groups.join(", ") : "—"}
                  </TableCell>
                  <TableCell className="tabular text-center text-sm">
                    {t.students}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTeacher(t);
                      }}
                    >
                      <BarChart3 /> Подробнее
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </div>
      </CardContent>

      <AddPersonDialog
        kind={addOpen}
        groups={groupNames}
        onClose={() => setAddOpen(null)}
        onDone={onChanged}
      />
      <TeacherDetailDialog
        teacher={openTeacher}
        onClose={() => setOpenTeacher(null)}
      />
      <MoveStudentDialog
        student={moving}
        groups={groupNames}
        onClose={() => setMoving(null)}
        onDone={onChanged}
      />
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

function AddPersonDialog({
  kind,
  groups,
  onClose,
  onDone,
}: {
  kind: "student" | "teacher" | null;
  groups: string[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [group, setGroup] = React.useState(groups[0] ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (kind) {
      setName("");
      setEmail("");
      setGroup(groups[0] ?? "");
      setError(null);
    }
  }, [kind, groups]);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name, email, group }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Не удалось сохранить");
        return;
      }
      onDone();
      onClose();
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!kind} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {kind === "teacher" ? "Добавить преподавателя" : "Добавить студента"}
          </DialogTitle>
          <DialogDescription>
            Запись появится в составе центра. Доступ в портал выдаётся отдельно.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="person-name">Имя и фамилия</Label>
            <Input
              id="person-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Айгерим Сатыбалдиева"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="person-email">
              Email{" "}
              <span className="font-normal text-muted-foreground">
                (необязательно)
              </span>
            </Label>
            <Input
              id="person-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          {kind === "student" && (
            <div className="grid gap-1.5">
              <Label htmlFor="person-group">Группа</Label>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger id="person-group">
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            disabled={!name.trim() || saving}
            onClick={() => void submit()}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" /> Сохранение…
              </>
            ) : (
              <>
                <GraduationCap /> Добавить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MoveStudentDialog({
  student,
  groups,
  onClose,
  onDone,
}: {
  student: AdminOverview["students"][number] | null;
  groups: string[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [group, setGroup] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (student) {
      setGroup(student.group);
      setError(null);
    }
  }, [student]);

  async function submit() {
    if (!student) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, group }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Не удалось перевести");
        return;
      }
      onDone();
      onClose();
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!student} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {student && (
          <>
            <DialogHeader>
              <DialogTitle>Перевести в другую группу</DialogTitle>
              <DialogDescription>
                {student.name} · сейчас в «{student.group}»
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-1.5">
              <Label htmlFor="move-group">Новая группа</Label>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger id="move-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button
                disabled={saving || group === student.group}
                onClick={() => void submit()}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" /> Перевод…
                  </>
                ) : (
                  <>
                    <Shuffle /> Перевести
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-live="polite">
      <span className="sr-only">Загружаем сводку центра…</span>
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 flex-1 max-w-[200px]" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

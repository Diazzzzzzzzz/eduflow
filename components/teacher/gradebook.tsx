"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Minus, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { BandChip } from "@/components/band-chip";
import { AddResultDialog } from "@/components/teacher/add-result-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBand } from "@/lib/band";
import { formatDayMonth } from "@/lib/date";
import type { Student } from "@/lib/types";

const ALL_GROUPS = "all";

function Trend({ student }: { student: Student }) {
  const tests = student.mockTests;
  if (tests.length < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
  const delta =
    tests[tests.length - 1].overall - tests[tests.length - 2].overall;
  if (delta > 0)
    return (
      <span className="tabular inline-flex items-center gap-1 text-xs font-medium text-success">
        <TrendingUp className="h-3.5 w-3.5" /> +{formatBand(delta)}
      </span>
    );
  if (delta < 0)
    return (
      <span className="tabular inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <TrendingDown className="h-3.5 w-3.5" /> {formatBand(delta)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="h-3.5 w-3.5" /> 0.0
    </span>
  );
}

export function Gradebook({ groupName }: { groupName?: string } = {}) {
  const { students } = useApp();
  const router = useRouter();
  const [group, setGroup] = React.useState<string>(ALL_GROUPS);
  const [query, setQuery] = React.useState("");

  // Filter options come from the roster the session is actually allowed to
  // see (a teacher: their groups; leadership: the centre) — the hardcoded
  // GROUPS list showed every seeded group to everyone.
  const groupOptions = React.useMemo(
    () => Array.from(new Set(students.map((s) => s.group))).sort(),
    [students]
  );
  // When scoped to a group, the journal is filtered strictly to that group and
  // the group filter + add button are hidden (owned by the group header).
  const scoped = !!groupName;

  // Row click opens the dedicated full-screen student report (stays in the
  // Teacher context — never the Student persona).
  function openStudent(student: Student) {
    const gid = encodeURIComponent(groupName ?? student.group);
    router.push(`/teacher/groups/${gid}/students/${student.id}`);
  }

  const filtered = students.filter((s) => {
    const inGroup = scoped
      ? s.group === groupName
      : group === ALL_GROUPS || s.group === group;
    const matches = s.name.toLowerCase().includes(query.trim().toLowerCase());
    return inGroup && matches;
  });

  return (
    <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
      <CardHeader className="flex-row flex-wrap items-end justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="font-display">Журнал Mock-экзаменов</CardTitle>
          <CardDescription>
            Последние баллы по секциям у каждого студента — нажмите на строку,
            чтобы открыть карточку студента.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск студентов…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-48 pl-8"
              aria-label="Поиск студентов"
            />
          </div>
          {!scoped && (
            <>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger className="w-56" aria-label="Фильтр по группе">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_GROUPS}>Все группы</SelectItem>
                  {groupOptions.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AddResultDialog />
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
            <p className="font-medium">Нет студентов по этому фильтру</p>
            <p className="text-sm text-muted-foreground">
              Выберите другую группу или очистите поиск, чтобы увидеть весь
              поток.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setGroup(ALL_GROUPS);
                setQuery("");
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Студент</TableHead>
                <TableHead>Группа</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">S</TableHead>
                <TableHead className="text-center">Общий</TableHead>
                <TableHead className="text-center">Динамика</TableHead>
                <TableHead className="text-center">Цель</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const last = s.mockTests[s.mockTests.length - 1];
                return (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => openStudent(s)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                          {s.initials}
                        </span>
                        <div>
                          <p className="font-medium leading-tight">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Экзамен {formatDayMonth(s.examDate)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {s.group.replace("IELTS ", "")}
                      </Badge>
                    </TableCell>
                    {(["listening", "reading", "writing", "speaking"] as const).map(
                      (skill) => (
                        <TableCell key={skill} className="text-center">
                          <span className="tabular text-sm">
                            {formatBand(last[skill])}
                          </span>
                        </TableCell>
                      )
                    )}
                    <TableCell className="text-center">
                      <BandChip band={last.overall} target={s.targetBand} size="sm" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Trend student={s} />
                    </TableCell>
                    <TableCell className="tabular text-center text-sm text-muted-foreground">
                      {formatBand(s.targetBand)}
                    </TableCell>
                    <TableCell className="w-10 text-right">
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

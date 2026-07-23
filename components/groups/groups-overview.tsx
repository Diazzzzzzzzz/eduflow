"use client";

import { CalendarDays, ChevronRight, Users } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GROUP_LIST } from "@/lib/group-data";
import { formatBand } from "@/lib/band";

/** Derive a level label from the group name for the level badge. */
function levelOf(name: string): string {
  if (name.startsWith("Pre-Intermediate")) return "Pre-Intermediate";
  if (name.startsWith("Intermediate")) return "Intermediate";
  if (name.startsWith("Advanced")) return "Advanced";
  return "IELTS";
}

export function GroupsOverview({ onSelect }: { onSelect: (name: string) => void }) {
  const { students } = useApp();

  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <h2 className="font-display text-lg font-semibold">Группы центра</h2>
        <p className="text-sm text-muted-foreground">
          Откройте группу, чтобы увидеть журнал, домашние задания и посещаемость.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GROUP_LIST.map((group, i) => {
          const members = students.filter((s) => s.group === group.name);
          const avgBand = members.length
            ? members.reduce(
                (a, s) => a + (s.mockTests[s.mockTests.length - 1]?.overall ?? 0),
                0
              ) / members.length
            : 0;
          const attendance = members.length
            ? Math.round(
                members.reduce((a, s) => a + s.attendance, 0) / members.length
              )
            : 0;
          return (
            <Card
              key={group.name}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(group.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(group.name);
              }}
              className="group animate-fade-up cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-semibold">
                      {group.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" /> {group.schedule}
                    </p>
                  </div>
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {levelOf(group.name)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t pt-3">
                  <div>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Users className="h-3 w-3" /> Студенты
                    </p>
                    <p className="tabular mt-0.5 font-display text-lg font-bold">
                      {members.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Средний балл
                    </p>
                    <p className="tabular mt-0.5 font-display text-lg font-bold text-primary">
                      {formatBand(Math.round(avgBand * 10) / 10)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Посещаемость
                    </p>
                    <p className="tabular mt-0.5 font-display text-lg font-bold text-success">
                      {attendance}%
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(group.name);
                  }}
                >
                  Открыть группу
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

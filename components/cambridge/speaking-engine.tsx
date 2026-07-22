"use client";

import * as React from "react";
import { Info, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CambridgeTest } from "@/lib/cambridge-types";

export function SpeakingEngine({ test }: { test: CambridgeTest }) {
  const [recording, setRecording] = React.useState(false);
  return (
    <div className="space-y-4">
      {test.passages.map((part) => (
        <Card key={part.id}>
          <CardContent className="space-y-2 p-5">
            <Badge variant="secondary">{part.title}</Badge>
            <p className="text-sm leading-relaxed">{part.textContent}</p>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <button
            onClick={() => setRecording((v) => !v)}
            aria-label={recording ? "Остановить запись" : "Начать запись"}
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full ring-4 transition-all",
              recording
                ? "animate-pulse-dot bg-destructive text-destructive-foreground ring-destructive/20"
                : "bg-primary text-primary-foreground ring-primary/20 hover:-translate-y-0.5"
            )}
          >
            <Mic className="h-6 w-6" />
          </button>
          <p className="text-sm font-medium">
            {recording ? "Идёт запись…" : "Нажмите, чтобы записать ответ"}
          </p>
          <p className="tabular text-xs text-muted-foreground">
            {recording ? "00:14" : "00:00"} / 02:00
          </p>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        Запись демонстрационная. Реальная загрузка аудио и оценка появятся позже.
      </div>
    </div>
  );
}

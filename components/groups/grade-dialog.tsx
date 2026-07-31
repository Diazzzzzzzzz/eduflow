"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useGroups } from "@/components/groups/groups-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BAND_STEPS, formatBand } from "@/lib/band";
import type { Submission } from "@/lib/group-data";

/** Review a submission: read the answer, assign a band, leave feedback, mark checked. */
export function GradeDialog({
  submission,
  studentName,
  onClose,
}: {
  submission: Submission | null;
  studentName: string;
  onClose: () => void;
}) {
  const { gradeSubmission } = useGroups();
  const [band, setBand] = React.useState<string>("");
  const [feedback, setFeedback] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setBand(submission?.band != null ? String(submission.band) : "");
    setFeedback(submission?.feedback ?? "");
  }, [submission?.id, submission?.band, submission?.feedback]);

  return (
    <Dialog open={!!submission} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {submission && (
          <>
            <DialogHeader>
              <DialogTitle>Проверка работы</DialogTitle>
              <DialogDescription>{studentName}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="rounded-lg border bg-secondary/40 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Ответ студента
                </p>
                <p className="mt-1 text-sm">
                  {submission.content || "— (работа ещё не отправлена)"}
                </p>
              </div>
              <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                <Label htmlFor="grade-band">Балл</Label>
                <Select value={band} onValueChange={setBand}>
                  <SelectTrigger id="grade-band" className="w-28">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {BAND_STEPS.filter((b) => b > 0).map((b) => (
                      <SelectItem key={b} value={String(b)}>
                        {formatBand(b)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grade-fb">Комментарий</Label>
                <Textarea
                  id="grade-fb"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Отзыв для студента (например, по Writing Task 2)…"
                  className="min-h-[90px]"
                />
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Отмена
              </Button>
              <Button
                disabled={!band || saving}
                onClick={async () => {
                  setSaving(true);
                  setError(null);
                  try {
                    await gradeSubmission(
                      submission.id,
                      Number(band),
                      feedback.trim()
                    );
                    onClose();
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Не удалось сохранить оценку."
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Check /> {saving ? "Сохранение…" : "Отметить проверенным"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

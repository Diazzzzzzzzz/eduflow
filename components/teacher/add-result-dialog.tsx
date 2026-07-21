"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { BandChip } from "@/components/band-chip";
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
import { BAND_STEPS, calcOverall, formatBand, SKILL_LABELS } from "@/lib/band";
import { SKILLS, type Skill, type SkillScores } from "@/lib/types";

const EMPTY: SkillScores = { listening: 0, reading: 0, writing: 0, speaking: 0 };

export function AddResultDialog({
  defaultStudentId,
}: {
  defaultStudentId?: string;
}) {
  const { students, addMockResult } = useApp();
  const [open, setOpen] = React.useState(false);
  const [studentId, setStudentId] = React.useState(
    defaultStudentId ?? students[0].id
  );
  const [label, setLabel] = React.useState("");
  const [scores, setScores] = React.useState<SkillScores>(EMPTY);
  const [saved, setSaved] = React.useState(false);

  const complete = SKILLS.every((s) => scores[s] > 0);
  const overall = complete ? calcOverall(scores) : null;

  function reset() {
    setScores(EMPTY);
    setLabel("");
    setSaved(false);
  }

  function handleSave() {
    addMockResult(
      studentId,
      scores,
      label.trim() || "Mock — Extra Practice",
      new Date().toISOString().slice(0, 10)
    );
    setSaved(true);
    setTimeout(() => {
      setOpen(false);
      reset();
    }, 900);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add mock test result
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add mock test result</DialogTitle>
          <DialogDescription>
            Enter section bands in 0.5 steps. The overall band is calculated
            with official IELTS rounding.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="student">Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger id="student">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="label">Test label</Label>
            <Input
              id="label"
              placeholder="e.g. Mock #7 — Cambridge 19 Test 2"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SKILLS.map((skill: Skill) => (
              <div key={skill} className="grid gap-2">
                <Label htmlFor={skill}>{SKILL_LABELS[skill]}</Label>
                <Select
                  value={scores[skill] ? String(scores[skill]) : undefined}
                  onValueChange={(v) =>
                    setScores((prev) => ({ ...prev, [skill]: Number(v) }))
                  }
                >
                  <SelectTrigger id={skill}>
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
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-secondary/50 px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">
              Overall band
            </span>
            {overall !== null ? (
              <BandChip band={overall} size="lg" />
            ) : (
              <span className="text-sm text-muted-foreground">
                Enter all four sections
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={saved ? "success" : "default"}
            disabled={!complete || saved}
            onClick={handleSave}
          >
            {saved ? "Saved" : "Save result"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

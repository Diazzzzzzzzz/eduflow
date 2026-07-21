import type { SkillScores } from "./types";

/**
 * IELTS overall band: mean of the four skills rounded to the nearest 0.5,
 * with .25 and .75 rounding up (official IELTS rounding convention).
 */
export function calcOverall(scores: SkillScores): number {
  const avg =
    (scores.listening + scores.reading + scores.writing + scores.speaking) / 4;
  return Math.round(avg * 2) / 2;
}

export function formatBand(band: number): string {
  return band.toFixed(1);
}

/** All valid band inputs for a section score, 0.0 → 9.0 in 0.5 steps. */
export const BAND_STEPS: number[] = Array.from(
  { length: 19 },
  (_, i) => i * 0.5
);

export type BandTone = "success" | "primary" | "warning" | "muted";

/** Color tone for a band score chip relative to a target. */
export function bandTone(band: number, target?: number): BandTone {
  if (target !== undefined) {
    if (band >= target) return "success";
    if (band >= target - 0.5) return "primary";
    return "warning";
  }
  if (band >= 7) return "success";
  if (band >= 6) return "primary";
  if (band > 0) return "warning";
  return "muted";
}

export const SKILL_LABELS: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

// Hardcoded hex (not CSS vars): SVG attributes can't resolve var().
// Rich -600 tones read as "financial dashboard" on the light canvas.
export const SKILL_COLORS: Record<string, string> = {
  listening: "#2563EB", // royal blue
  reading: "#0891B2", // deep teal
  writing: "#D97706", // warm amber
  speaking: "#059669", // rich emerald
};

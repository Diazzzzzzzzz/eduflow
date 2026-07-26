/**
 * SERVER ONLY — the boundary between answer keys and the browser.
 *
 * Everything the client is allowed to see passes through `toPublicSection`,
 * which drops `answer` and `explanation` from every question. Scoring happens
 * here too, so a candidate cannot read the keys out of the network tab.
 */

import { findSectionBySkill, EXAM_SECTIONS } from "./papers";
import { buildDrillSection, DRILL_ID_PREFIX, isDrillId } from "./drills";
import { getFirstStoredPaper, getStoredPaper } from "@/lib/data/exam-papers";
import { scoreSection } from "./scoring";
import type {
  AnswerMap,
  ExamResult,
  ExamSection,
  ExamSectionFull,
} from "./types";

/** Strip answer keys, returning the payload that is safe to send out. */
export function toPublicSection(full: ExamSectionFull): ExamSection {
  return {
    ...full,
    passages: full.passages.map((p) => ({
      ...p,
      // The transcript is a key of sorts for listening — hold it back too.
      transcript: undefined,
      groups: p.groups.map((g) => ({
        ...g,
        questions: g.questions.map((q) => {
          const { answer, explanation, ...pub } = q;
          void answer;
          void explanation;
          return pub;
        }),
      })),
    })),
  };
}

/**
 * Resolve a paper by id or skill.
 *
 * Order matters: drills are synthesised, then imported papers from the
 * database, then the bundled originals. Imported papers win over bundled ones
 * for a bare skill lookup, so a centre that has uploaded its own material sees
 * that rather than the demo paper.
 */
export async function loadFullSection(input: {
  sectionId?: string | null;
  skill?: string | null;
}): Promise<ExamSectionFull | null> {
  if (input.sectionId) {
    // Deterministic rebuild, so the submit route can mark a drill without any
    // server-side session.
    if (isDrillId(input.sectionId)) {
      return buildDrillSection(input.sectionId.slice(DRILL_ID_PREFIX.length));
    }
    const stored = await getStoredPaper(input.sectionId);
    if (stored) return stored;
    if (EXAM_SECTIONS[input.sectionId]) return EXAM_SECTIONS[input.sectionId];
  }

  if (input.skill === "reading" || input.skill === "listening") {
    const stored = await getFirstStoredPaper(input.skill);
    if (stored) return stored;
  }
  if (input.skill) return findSectionBySkill(input.skill);
  return null;
}

export function gradeSection(
  full: ExamSectionFull,
  answers: AnswerMap,
  durationSeconds?: number
): ExamResult {
  return scoreSection(full, answers, durationSeconds);
}

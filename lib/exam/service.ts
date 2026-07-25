/**
 * SERVER ONLY — the boundary between answer keys and the browser.
 *
 * Everything the client is allowed to see passes through `toPublicSection`,
 * which drops `answer` and `explanation` from every question. Scoring happens
 * here too, so a candidate cannot read the keys out of the network tab.
 */

import { findSectionBySkill, EXAM_SECTIONS } from "./papers";
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

export function loadFullSection(input: {
  sectionId?: string | null;
  skill?: string | null;
}): ExamSectionFull | null {
  if (input.sectionId && EXAM_SECTIONS[input.sectionId]) {
    return EXAM_SECTIONS[input.sectionId];
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

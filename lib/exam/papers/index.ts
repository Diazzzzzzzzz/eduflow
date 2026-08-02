/**
 * SERVER ONLY — the catalogue of exam papers, answer keys included.
 *
 * Every paper here is original EduFlow material. Licensed content can be added
 * as another `ExamSectionFull`, or loaded from the database, without any change
 * to the engine.
 */

import { DEMO_READING_SECTION } from "../demo-exam";
import { RUNNING_SHOE_SECTION } from "./running-shoe";
import { ACADEMIC_READING_1_SECTION } from "./academic-reading-1";
import { ACADEMIC_READING_3_SECTION } from "./academic-reading-3";
import { ACADEMIC_READING_4_SECTION } from "./academic-reading-4";
import { ACADEMIC_READING_5_SECTION } from "./academic-reading-5";
import { READING_PRACTICE_SET } from "./reading-practice-set";
import type { ExamSectionFull } from "../types";

const PAPERS: ExamSectionFull[] = [
  DEMO_READING_SECTION,
  RUNNING_SHOE_SECTION,
  ACADEMIC_READING_1_SECTION,
  ACADEMIC_READING_3_SECTION,
  ACADEMIC_READING_4_SECTION,
  ACADEMIC_READING_5_SECTION,
  ...READING_PRACTICE_SET,
];

export const EXAM_SECTIONS: Record<string, ExamSectionFull> =
  Object.fromEntries(PAPERS.map((p) => [p.id, p]));

export function findSectionBySkill(skill: string): ExamSectionFull | null {
  return PAPERS.find((p) => p.skill === skill) ?? null;
}

/** Summary of every paper for a skill — enough to build a catalogue. */
export function listPapers(skill?: string) {
  return PAPERS.filter((p) => !skill || p.skill === skill).map((p) => ({
    id: p.id,
    title: p.title,
    skill: p.skill,
    durationMinutes: p.durationMinutes,
    passages: p.passages.length,
    questions: p.passages.reduce(
      (n, pass) =>
        n +
        pass.groups.reduce(
          (m, g) =>
            m +
            g.questions.reduce(
              (k, q) => k + (Array.isArray(q.answer) ? q.answer.length : 1),
              0
            ),
          0
        ),
      0
    ),
  }));
}

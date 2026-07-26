/**
 * Writes a ready-to-import example file in the wire format described by
 * lib/exam/import-schema.ts.
 *
 *   npx tsx scripts/gen-import-sample.ts
 *
 * Generated from an original EduFlow paper so the sample is genuinely valid —
 * importing it exercises the whole pipeline end to end.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { RUNNING_SHOE_SECTION } from "../lib/exam/papers/running-shoe";
import type { ExamSectionFull } from "../lib/exam/types";

const OUT = "content/import-samples/eduflow-reading-test1.json";

/** Engine type → the alias documented for the import format. */
const TYPE_TO_ALIAS: Record<string, string> = {
  true_false_not_given: "true_false_ng",
  yes_no_not_given: "yes_no_ng",
  mcq_single: "multiple_choice",
  mcq_multi: "multiple_choice_multi",
  gap_fill: "completion",
  matching_headings: "matching_headings",
  matching: "matching",
  sentence_endings: "sentence_endings",
  short_answer: "short_answer",
  labelling: "diagram_labelling",
};

function toWireFormat(section: ExamSectionFull) {
  return {
    id: "eduflow-reading-test-1",
    title: "EduFlow Reading — Test 1",
    module: section.skill === "reading" ? "Reading" : "Listening",
    durationMinutes: section.durationMinutes,
    attribution:
      "Оригинальный материал EduFlow. Пример файла для импорта в /admin/tests.",
    passages: section.passages.map((p) => ({
      number: p.number,
      title: p.title,
      subtitle: p.subtitle,
      text: p.text,
      groups: p.groups.map((g) => ({
        type: TYPE_TO_ALIAS[g.type] ?? g.type,
        instructions: g.instructions,
        wordLimit: g.wordLimit,
        optionsTitle: g.optionsTitle,
        options: g.options?.map((o) => o.label),
        intro: g.intro,
        questions: g.questions.map((q) => ({
          number: q.number,
          numberTo: q.numberTo,
          prompt: q.prompt,
          answer: q.answer,
          explanation: q.explanation,
        })),
      })),
    })),
  };
}

mkdirSync("content/import-samples", { recursive: true });
const wire = toWireFormat(RUNNING_SHOE_SECTION);
writeFileSync(OUT, JSON.stringify(wire, null, 2) + "\n", "utf8");

const questions = wire.passages.reduce(
  (n, p) => n + p.groups.reduce((m, g) => m + g.questions.length, 0),
  0
);
console.log(`✓ ${OUT} — ${wire.passages.length} passage(s), ${questions} questions`);

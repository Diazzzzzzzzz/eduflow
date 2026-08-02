import { describe, it, expect } from "vitest";
import raw from "@/content/import-samples/ielts-reading-test-1.json";
import { adaptExternalPaper, isExternalPaperFormat } from "./import-adapters";
import { validateImport } from "./import-schema";
import { scoreSection } from "./scoring";
import type { AnswerMap, ExamSectionFull } from "./types";

/**
 * The real paper is the fixture: these assertions are about the actual file
 * shipped in content/import-samples, so a bad edit to it fails the suite.
 */
function build(): ExamSectionFull {
  const adapted = adaptExternalPaper(raw);
  expect(adapted.issues).toEqual([]);
  const result = validateImport(adapted.paper);
  expect(result.issues).toEqual([]);
  expect(result.section).toBeDefined();
  return result.section!;
}

describe("adaptExternalPaper — IELTS Academic Reading Practice Test 1", () => {
  it("recognises the authoring dialect", () => {
    expect(isExternalPaperFormat(raw)).toBe(true);
    expect(isExternalPaperFormat({ passages: [{ groups: [] }] })).toBe(false);
  });

  it("passes the engine's own validator with no issues", () => {
    const section = build();
    expect(section.skill).toBe("reading");
    expect(section.durationMinutes).toBe(60);
    expect(section.passages).toHaveLength(3);
  });

  it("is worth exactly 40 marks, numbered 1–40 with no gaps", () => {
    const section = build();
    const marks: number[] = [];
    for (const p of section.passages) {
      for (const g of p.groups) {
        for (const q of g.questions) {
          const span = Array.isArray(q.answer) ? q.answer.length : 1;
          for (let n = q.number; n < q.number + span; n++) marks.push(n);
        }
      }
    }
    expect(marks).toHaveLength(40);
    expect([...marks].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 40 }, (_, i) => i + 1)
    );
  });

  it("collapses a repeated 'choose TWO letters' key into one 2-mark item", () => {
    // The source file lists Q23 and Q24 as separate rows that each carry the
    // full ["B","D"] key. Left alone that is 4 marks for a 2-mark item.
    const section = build();
    const all = section.passages.flatMap((p) =>
      p.groups.flatMap((g) => g.questions)
    );
    const q23 = all.find((q) => q.number === 23);
    expect(q23).toBeDefined();
    expect(q23!.numberTo).toBe(24);
    expect(q23!.answer).toEqual(["B", "D"]);
    expect(q23!.selectCount).toBe(2);
    // 24 must not also exist as its own item.
    expect(all.filter((q) => q.number === 24)).toHaveLength(0);

    const q25 = all.find((q) => q.number === 25);
    expect(q25!.numberTo).toBe(26);
    expect(q25!.answer).toEqual(["A", "E"]);
  });

  it("normalises gap markers to the ___ the renderer splits on", () => {
    const section = build();
    const gapQuestions = section.passages
      .flatMap((p) => p.groups)
      .filter((g) => g.type === "gap_fill")
      .flatMap((g) => g.questions);
    expect(gapQuestions.length).toBeGreaterThan(0);
    for (const q of gapQuestions) {
      expect(q.prompt).toContain("___");
      expect(q.prompt).not.toMatch(/_{4,}/);
    }
  });

  it("carries the ONE WORD ONLY limit onto the gap groups", () => {
    const section = build();
    const gapGroups = section.passages
      .flatMap((p) => p.groups)
      .filter((g) => g.type === "gap_fill");
    for (const g of gapGroups) expect(g.wordLimit).toBe(1);
  });

  it("splits fused options into a letter value and a readable label", () => {
    const section = build();
    const summary = section.passages[2].groups.find((g) => g.from === 27);
    expect(summary).toBeDefined();
    const options = summary!.questions[0].options ?? summary!.options ?? [];
    expect(options).toContainEqual({ value: "A", label: "A. appeal" });
    expect(options).toContainEqual({ value: "H", label: "H. unique" });
    // The key must be one of the offered values.
    expect(options.map((o) => o.value)).toContain(
      summary!.questions[0].answer as string
    );
  });

  it("brackets paragraph labels so 'which paragraph' questions resolve", () => {
    const section = build();
    const p2 = section.passages[1];
    expect(p2.text).toMatch(/^\[A\]\s/);
    for (const letter of ["B", "C", "D", "E", "F"]) {
      expect(p2.text).toContain(`\n\n[${letter}] `);
    }
    // Passage 1 has no letter-referencing questions and must be left alone.
    expect(section.passages[0].text).not.toMatch(/^\[A\]/);
  });

  it("strips the duplicated 'Questions 1-7:' prefix from instructions", () => {
    const section = build();
    for (const p of section.passages) {
      for (const g of p.groups) {
        expect(g.instructions).not.toMatch(/^Questions?\s+\d+/i);
        expect(g.instructions.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("availability without a database", () => {
  it("is registered as a bundled paper, so demo mode can serve it", async () => {
    // A demo session never reads the database, and a deployment with no
    // service-role key has no stored papers at all. Registration in
    // lib/exam/papers is what makes the test reachable in both cases.
    const { listPapers, EXAM_SECTIONS } = await import("./papers");
    const listed = listPapers("reading");
    const entry = listed.find((p) => p.id === "ielts-academic-reading-01");
    expect(entry).toBeDefined();
    expect(entry!.questions).toBe(40);
    expect(entry!.passages).toBe(3);
    expect(entry!.durationMinutes).toBe(60);
    expect(EXAM_SECTIONS["ielts-academic-reading-01"]).toBeDefined();
  });

  it("keeps answer keys off the public payload", async () => {
    const { toPublicSection } = await import("./service");
    const { EXAM_SECTIONS } = await import("./papers");
    const pub = toPublicSection(EXAM_SECTIONS["ielts-academic-reading-01"]);
    expect(JSON.stringify(pub)).not.toContain('"answer"');
  });
});

describe("scoring the imported paper", () => {
  /** Answer every question correctly, using the first accepted variant. */
  function perfectAnswers(section: ExamSectionFull): AnswerMap {
    const answers: AnswerMap = {};
    for (const p of section.passages) {
      for (const g of p.groups) {
        for (const q of g.questions) {
          answers[q.id] = Array.isArray(q.answer)
            ? q.answer.map((a) => a.split("|")[0])
            : q.answer.split("|")[0];
        }
      }
    }
    return answers;
  }

  it("awards band 9 for a clean sheet", () => {
    const section = build();
    const result = scoreSection(section, perfectAnswers(section));
    expect(result.total).toBe(40);
    expect(result.correct).toBe(40);
    expect(result.band).toBe(9);
  });

  it("scores an empty sheet at zero", () => {
    const section = build();
    const result = scoreSection(section, {});
    expect(result.correct).toBe(0);
    expect(result.total).toBe(40);
  });

  it("gives partial credit on a half-right 'choose TWO'", () => {
    const section = build();
    const answers = perfectAnswers(section);
    const q23 = section.passages
      .flatMap((p) => p.groups)
      .flatMap((g) => g.questions)
      .find((q) => q.number === 23)!;
    answers[q23.id] = ["B", "A"]; // one right, one wrong
    const result = scoreSection(section, answers);
    expect(result.correct).toBe(39);
    const row = result.results.find((r) => r.number === 23)!;
    expect(row.earned).toBe(1);
    expect(row.possible).toBe(2);
    expect(row.correct).toBe(false);
  });

  it("marks a gap answer over the one-word limit wrong", () => {
    const section = build();
    const answers = perfectAnswers(section);
    const q1 = section.passages[0].groups[0].questions[0];
    answers[q1.id] = "the piston rod";
    const result = scoreSection(section, answers);
    const row = result.results.find((r) => r.number === q1.number)!;
    expect(row.correct).toBe(false);
    expect(row.overWordLimit).toBe(true);
  });

  it("accepts a correct gap answer regardless of case and spacing", () => {
    const section = build();
    const answers = perfectAnswers(section);
    const q1 = section.passages[0].groups[0].questions[0];
    answers[q1.id] = "  PISTON ";
    const result = scoreSection(section, answers);
    expect(result.results.find((r) => r.number === q1.number)!.correct).toBe(true);
  });

  it("maps raw scores onto the Academic Reading band table", () => {
    const section = build();
    const all = section.passages
      .flatMap((p) => p.groups)
      .flatMap((g) => g.questions);

    // 30/40 is band 7 on the published Academic Reading curve.
    const answers = perfectAnswers(section);
    let dropped = 0;
    for (const q of all) {
      if (dropped >= 10) break;
      const span = Array.isArray(q.answer) ? q.answer.length : 1;
      if (dropped + span > 10) continue;
      answers[q.id] = Array.isArray(q.answer) ? [] : "";
      dropped += span;
    }
    const result = scoreSection(section, answers);
    expect(result.correct).toBe(30);
    expect(result.band).toBe(7);
  });
});

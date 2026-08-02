import { describe, it, expect } from "vitest";
import rawCollection from "@/content/import-samples/ielts-reading-tests-1-34.json";
import {
  adaptBookCollection,
  expandAnswerKey,
  isBookCollection,
  labelParagraphs,
  normalizeVerdictKey,
  splitGapPrompts,
} from "./import-book-collection";
import { validateImport } from "./import-schema";
import { scoreSection } from "./scoring";
import type { AnswerMap, ExamSectionFull } from "./types";

/**
 * The shipped collection is the fixture, so a bad edit to it — or to the
 * adapter — fails the suite rather than reaching a student mid-exam.
 */
const adapted = adaptBookCollection(rawCollection);

function sectionsOf(): { testNumber: number; section: ExamSectionFull }[] {
  return adapted.papers.map(({ testNumber, paper }) => {
    const result = validateImport(paper);
    expect(result.section, `тест ${testNumber} не собрался`).toBeDefined();
    return { testNumber, section: result.section! };
  });
}

describe("unit helpers", () => {
  it("expands '/' alternatives and optional bracketed words", () => {
    expect(expandAnswerKey("(molten) rock/ash").split("|").sort()).toEqual([
      "ash",
      "molten rock",
      "rock",
    ]);
    expect(expandAnswerKey("Temperature")).toBe("Temperature");
  });

  it("repairs the OCR's spelling of verdict keys", () => {
    expect(normalizeVerdictKey("TURE")).toBe("TRUE");
    expect(normalizeVerdictKey("NOT GIVE")).toBe("NOT GIVEN");
    expect(normalizeVerdictKey("NOTGIVEN")).toBe("NOT GIVEN");
    expect(normalizeVerdictKey("FASLE")).toBe("FALSE");
    // Anything else is passed through untouched.
    expect(normalizeVerdictKey("B")).toBe("B");
  });

  it("brackets lettered paragraphs after an unlettered preamble", () => {
    const { text, letters } = labelParagraphs(
      "Intro paragraph with no letter.\n\nA. First body.\n\nB. Second body."
    );
    expect(letters).toEqual(["A", "B"]);
    expect(text).toContain("[A] First body.");
    expect(text).toContain("[B] Second body.");
    expect(text).toMatch(/^Intro paragraph/);
  });

  it("does not mangle a passage whose sentence merely starts with 'A'", () => {
    const { letters } = labelParagraphs(
      "A study of bees was published.\n\nResearchers found more."
    );
    expect(letters).toEqual([]);
  });

  it("splits a gap blob into one prompt per gap", () => {
    const prompts = splitGapPrompts(
      "change in the 20 ......Volcanic eruptions of 21...... can lead to 22...... today",
      [20, 21, 22]
    );
    expect(prompts?.get(20)).toBe("change in the ___");
    expect(prompts?.get(21)).toBe("Volcanic eruptions of ___");
    expect(prompts?.get(22)).toBe("can lead to ___ today");
  });

  it("declines a partial split rather than mis-attributing text", () => {
    // 22 is missing, so 21's text must not silently absorb it.
    expect(splitGapPrompts("only 21...... here", [21, 22])).toBeNull();
    expect(splitGapPrompts("", [1])).toBeNull();
  });
});

describe("the shipped 34-test collection", () => {
  it("is recognised as a book collection", () => {
    expect(isBookCollection(rawCollection)).toBe(true);
    expect(isBookCollection({ passages: [] })).toBe(false);
  });

  it("converts every test with none left unusable", () => {
    expect(adapted.rejected).toEqual([]);
    expect(adapted.papers).toHaveLength(34);
  });

  it("passes the engine's validator for every paper", () => {
    for (const { testNumber, paper } of adapted.papers) {
      const result = validateImport(paper);
      const detail = result.issues
        .slice(0, 3)
        .map((i) => `${i.path} — ${i.message}`)
        .join("; ");
      expect(result.ok, `тест ${testNumber}: ${detail}`).toBe(true);
    }
  });

  it("numbers every paper contiguously from 1", () => {
    for (const { testNumber, section } of sectionsOf()) {
      const marks: number[] = [];
      for (const p of section.passages) {
        for (const g of p.groups) {
          for (const q of g.questions) {
            const span = Array.isArray(q.answer) ? q.answer.length : 1;
            for (let n = q.number; n < q.number + span; n++) marks.push(n);
          }
        }
      }
      const sorted = [...marks].sort((a, b) => a - b);
      expect(sorted, `тест ${testNumber}`).toEqual(
        Array.from({ length: marks.length }, (_, i) => i + 1)
      );
    }
  });

  it("never offers a letter question an answer that is not on the list", () => {
    for (const { testNumber, section } of sectionsOf()) {
      for (const p of section.passages) {
        for (const g of p.groups) {
          const needsList = [
            "mcq_single",
            "mcq_multi",
            "matching",
            "matching_headings",
            "sentence_endings",
            "true_false_not_given",
            "yes_no_not_given",
          ].includes(g.type);
          if (!needsList) continue;
          for (const q of g.questions) {
            const offered = (q.options ?? g.options ?? []).map((o) =>
              o.value.toUpperCase()
            );
            expect(
              offered.length,
              `тест ${testNumber} Q${q.number} (${g.type}) без вариантов`
            ).toBeGreaterThan(0);
            const wanted = (Array.isArray(q.answer) ? q.answer : [q.answer]).map(
              (a) => a.toUpperCase()
            );
            for (const w of wanted) {
              expect(
                offered,
                `тест ${testNumber} Q${q.number}: ключ "${w}"`
              ).toContain(w);
            }
          }
        }
      }
    }
  });

  it("gives every typed question a visible gap and every question a prompt", () => {
    for (const { testNumber, section } of sectionsOf()) {
      for (const p of section.passages) {
        for (const g of p.groups) {
          for (const q of g.questions) {
            expect(q.prompt.trim(), `тест ${testNumber} Q${q.number}`).not.toBe("");
            if (g.type === "gap_fill" || g.type === "short_answer") {
              expect(q.prompt, `тест ${testNumber} Q${q.number}`).toContain("___");
            }
          }
        }
      }
    }
  });

  it("never states a word limit its own answer key breaks", () => {
    for (const { testNumber, section } of sectionsOf()) {
      for (const p of section.passages) {
        for (const g of p.groups) {
          const limit = g.wordLimit;
          if (!limit) continue;
          for (const q of g.questions) {
            const key = Array.isArray(q.answer) ? q.answer.join(" ") : q.answer;
            const shortest = Math.min(
              ...key.split("|").map((v) => v.trim().split(/\s+/).filter(Boolean).length)
            );
            expect(
              shortest,
              `тест ${testNumber} Q${q.number}: ключ "${key}" при лимите ${limit}`
            ).toBeLessThanOrEqual(limit);
          }
        }
      }
    }
  });

  it("marks a perfect sheet at full marks and band 9 on complete papers", () => {
    for (const { testNumber, section } of sectionsOf()) {
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
      const result = scoreSection(section, answers);
      expect(result.correct, `тест ${testNumber}`).toBe(result.total);
      if (result.total === 40) {
        expect(result.band, `тест ${testNumber}`).toBe(9);
      }
    }
  });

  it("scores an empty sheet at zero on every paper", () => {
    for (const { testNumber, section } of sectionsOf()) {
      const result = scoreSection(section, {});
      expect(result.correct, `тест ${testNumber}`).toBe(0);
      expect(result.total, `тест ${testNumber}`).toBeGreaterThan(0);
    }
  });

  it("accepts every declared answer variant, not just the first", () => {
    for (const { testNumber, section } of sectionsOf()) {
      for (const p of section.passages) {
        for (const g of p.groups) {
          if (g.type !== "gap_fill" && g.type !== "short_answer") continue;
          for (const q of g.questions) {
            const variants = (q.answer as string).split("|");
            if (variants.length < 2) continue;
            for (const v of variants) {
              const result = scoreSection(section, { [q.id]: v });
              const row = result.results.find((r) => r.questionId === q.id)!;
              expect(
                row.correct,
                `тест ${testNumber} Q${q.number}: вариант "${v}" не засчитан`
              ).toBe(true);
            }
          }
        }
      }
    }
  });

  it("says in the attribution when a paper is short of 40 marks", () => {
    for (const { testNumber, section } of sectionsOf()) {
      const marks = section.passages.reduce(
        (n, p) =>
          n +
          p.groups.reduce(
            (m, g) =>
              m +
              g.questions.reduce(
                (k, q) => k + (Array.isArray(q.answer) ? q.answer.length : 1),
                0
              ),
            0
          ),
        0
      );
      if (marks < 40) {
        expect(section.attribution, `тест ${testNumber}`).toContain(
          `восстановлено ${marks} из 40`
        );
      }
    }
  });
});

describe("registration", () => {
  it("registers every paper as a bundled paper for demo / no-database use", async () => {
    const { listPapers } = await import("./papers");
    const listed = listPapers("reading");
    for (const { testNumber } of adapted.papers) {
      const id = `ielts-reading-practice-${String(testNumber).padStart(2, "0")}`;
      expect(listed.find((p) => p.id === id), `нет ${id}`).toBeDefined();
    }
  });

  it("keeps answer keys off the public payload", async () => {
    const { EXAM_SECTIONS } = await import("./papers");
    const { toPublicSection } = await import("./service");
    const pub = toPublicSection(EXAM_SECTIONS["ielts-reading-practice-01"]);
    expect(JSON.stringify(pub)).not.toContain('"answer"');
  });
});

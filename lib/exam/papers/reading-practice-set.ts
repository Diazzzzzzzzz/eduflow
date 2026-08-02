/**
 * SERVER ONLY — the 34-paper IELTS Reading practice set.
 *
 * Built from the authored JSON at module load (≈15ms for the whole set) rather
 * than checked in as generated .ts files, so the file in content/import-samples
 * stays the single source of truth and cannot drift from what the app serves.
 *
 * Bundling matters for reach: a demo session and a deployment without a
 * service-role key both have no stored papers at all, and registering here is
 * what makes the set available in those cases. `listAvailablePapers`
 * deduplicates by id, so the database copies imported by
 * scripts/import-paper.ts transparently supersede these wherever they exist.
 *
 * The source is OCR'd from a PDF and is damaged in places. The adapter drops
 * groups it cannot reconstruct rather than guessing, so some papers are worth
 * fewer than 40 marks — each one says so in its attribution line, and the
 * engine scales a short paper to its /40 band equivalent.
 */

import rawCollection from "@/content/import-samples/ielts-reading-tests-1-34.json";
import { adaptBookCollection } from "../import-book-collection";
import { validateImport } from "../import-schema";
import type { ExamSectionFull } from "../types";

function buildPracticeSet(): ExamSectionFull[] {
  const { papers } = adaptBookCollection(rawCollection);
  const sections: ExamSectionFull[] = [];

  for (const { testNumber, paper } of papers) {
    const result = validateImport(paper);
    if (!result.ok || !result.section) {
      // Skip rather than throw: one bad paper in a 34-paper set must not take
      // the whole app down at boot. lib/exam/import-book-collection.test.ts
      // asserts that every paper in the checked-in file validates.
      console.warn(
        `[exam/papers] Reading Practice Test ${testNumber} не прошёл проверку и пропущен:`,
        result.issues.slice(0, 3).map((i) => `${i.path} — ${i.message}`).join("; ")
      );
      continue;
    }
    sections.push(result.section);
  }

  return sections;
}

export const READING_PRACTICE_SET: ExamSectionFull[] = buildPracticeSet();

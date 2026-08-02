/**
 * SERVER ONLY — IELTS Academic Reading Practice Test 1.
 *
 * Built from the authored JSON at module load rather than checked in as a
 * generated .ts file, so the file in content/import-samples stays the single
 * source of truth and cannot drift from what the app serves.
 *
 * Bundling matters for reach: a demo session is served entirely from bundled
 * fixtures and never reads the database, and a deployment without a
 * service-role key has no stored papers at all. Registering the paper here is
 * what makes it available in both of those cases. `listAvailablePapers`
 * deduplicates by id, so the database copy (imported by scripts/import-paper.ts)
 * transparently supersedes this one wherever it exists.
 */

import rawPaper from "@/content/import-samples/ielts-reading-test-1.json";
import { adaptExternalPaper } from "../import-adapters";
import { validateImport } from "../import-schema";
import type { ExamSectionFull } from "../types";

function buildBundledPaper(): ExamSectionFull {
  const adapted = adaptExternalPaper(rawPaper);
  const result = validateImport(adapted.paper);
  if (!result.ok || !result.section) {
    // Fail at build/boot rather than serve a paper with broken numbering or a
    // key that matches no option. lib/exam/import-adapters.test.ts asserts this
    // never happens for the checked-in file.
    const problems = [
      ...adapted.issues,
      ...result.issues.map((i) => `${i.path || "(корень)"} — ${i.message}`),
    ].join("; ");
    throw new Error(`ielts-reading-test-1.json не прошёл проверку: ${problems}`);
  }
  return result.section;
}

export const ACADEMIC_READING_1_SECTION: ExamSectionFull = buildBundledPaper();

/**
 * Imports a paper JSON file straight into the database — the command-line
 * counterpart of the drag & drop in /admin/tests.
 *
 *   npx tsx scripts/import-paper.ts content/import-samples/eduflow-reading-test1.json
 *   npm run import:sample
 *
 * Validates with the same schema the UI uses, so a file that imports here
 * imports there and vice versa.
 */
// Env must be present before the Supabase modules load, so this runs under
// `tsx --env-file=.env.local` (see the import:sample script) rather than
// reading the file itself.
import { readFileSync } from "node:fs";
import { validateImport } from "../lib/exam/import-schema";
import {
  adaptExternalPaper,
  isExternalPaperFormat,
} from "../lib/exam/import-adapters";
import { savePaper } from "../lib/data/exam-papers";

async function main() {
  const file = process.argv[2] ?? "content/import-samples/eduflow-reading-test1.json";
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    console.error(
      `✗ Не удалось прочитать ${file}: ${err instanceof Error ? err.message : err}`
    );
    process.exit(1);
  }

  // Papers authored elsewhere use `questionGroups`/`correctAnswer`; translate
  // them first so both dialects meet the same validator.
  if (isExternalPaperFormat(raw)) {
    const adapted = adaptExternalPaper(raw);
    if (adapted.issues.length > 0) {
      console.error(`✗ ${file} — проблемы при разборе авторского формата:`);
      for (const issue of adapted.issues) console.error(`   ${issue}`);
      process.exit(1);
    }
    console.log("→ Определён авторский формат, выполнено преобразование.");
    raw = adapted.paper;
  }

  const result = validateImport(raw);
  if (!result.ok || !result.section) {
    console.error(`✗ ${file} не прошёл проверку схемы:`);
    for (const issue of result.issues) {
      console.error(`   ${issue.path || "(корень)"} — ${issue.message}`);
    }
    process.exit(1);
  }

  const { summary } = result;
  console.log(
    `→ ${summary!.title} · ${summary!.skill} · ${summary!.passages} пассаж(а) · ${summary!.questions} вопросов · ${summary!.marks} баллов`
  );

  const saved = await savePaper(result.section, "import-paper.ts");
  if (!saved.ok) {
    console.error(`✗ ${saved.error}`);
    process.exit(1);
  }

  console.log(
    `✓ ${saved.replaced ? "Обновлён" : "Импортирован"}: ${saved.slug}`
  );
  console.log(
    `  Доступен студентам: /student/practice/${result.section.skill}?paper=${saved.slug}`
  );
}

main().catch((err) => {
  console.error("✗ Импорт не удался:", err instanceof Error ? err.message : err);
  process.exit(1);
});

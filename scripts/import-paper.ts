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
import {
  adaptBookCollection,
  isBookCollection,
} from "../lib/exam/import-book-collection";
import { savePaper } from "../lib/data/exam-papers";

/**
 * Import a whole book of papers. Each test is validated and saved on its own,
 * so one damaged paper cannot block the rest, and the summary reports exactly
 * what landed and at what mark total.
 */
async function importCollection(raw: unknown, file: string) {
  const { papers, rejected } = adaptBookCollection(raw);
  console.log(
    `→ Определён сборник: ${papers.length} тест(ов) пригодны, ${rejected.length} отброшено.`
  );

  let saved = 0;
  let failed = 0;
  const partial: string[] = [];

  for (const { testNumber, paper, marks, dropped } of papers) {
    const result = validateImport(paper);
    if (!result.ok || !result.section) {
      failed += 1;
      console.error(`  ✗ Тест ${testNumber} не прошёл проверку:`);
      for (const issue of result.issues.slice(0, 4)) {
        console.error(`      ${issue.path || "(корень)"} — ${issue.message}`);
      }
      continue;
    }

    const res = await savePaper(result.section, "import-paper.ts");
    if (!res.ok) {
      failed += 1;
      console.error(`  ✗ Тест ${testNumber}: ${res.error}`);
      continue;
    }
    saved += 1;
    if (marks < 40) {
      partial.push(`тест ${testNumber} — ${marks}/40 (групп отброшено: ${dropped.length})`);
    }
    console.log(
      `  ${res.replaced ? "↻" : "✓"} ${res.slug} · ${marks}/40 баллов · ${result.summary!.passages} пассажа`
    );
  }

  console.log(`\nИтог: сохранено ${saved}, ошибок ${failed}.`);
  if (partial.length) {
    console.log(`Неполные (источник повреждён при распознавании): ${partial.length}`);
    for (const p of partial) console.log(`   ${p}`);
  }
  for (const r of rejected) {
    console.log(`Отброшен тест ${r.testNumber}: ${r.problems[0]}`);
  }
  if (failed > 0) process.exit(1);
  console.log(`\nГотово: ${file}`);
}

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

  // A whole book of papers rather than a single one.
  if (isBookCollection(raw)) {
    await importCollection(raw, file);
    return;
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

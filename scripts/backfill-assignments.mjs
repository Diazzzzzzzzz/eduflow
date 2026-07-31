/**
 * Gives every actively-enrolled student a submission row for their group's
 * homework.
 *
 *   node --env-file=.env.local scripts/backfill-assignments.mjs
 *
 * Why this exists: a student sees a task only when a submission row assigns it
 * to them (that is what keeps an individually-set task from leaking to the
 * whole group). The demo seed creates homework plus a couple of rows to
 * illustrate "pending review" states, so most students saw an empty homework
 * page even though work had been set for their group.
 *
 * Idempotent, and deliberately conservative: tasks listed in INDIVIDUAL are
 * left alone, because the seed means them for one student.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

// Service role: this is a seed-maintenance task that spans every group in the
// centre, run from the command line rather than on behalf of a signed-in user.
const admin = createClient(url, key, { auth: { persistSession: false } });

/** Homework the seed assigns to one student on purpose (see lib/group-data). */
const INDIVIDUAL = ["Writing Task 2: Плата за высшее образование"];

const { data: homework, error } = await admin
  .from("homework")
  .select("id, title, group_id, group_name");

if (error) {
  console.error("✗ Не удалось прочитать задания:", error.message);
  process.exit(1);
}

let added = 0;
for (const hw of homework) {
  if (INDIVIDUAL.includes(hw.title)) {
    console.log(`· пропуск (индивидуальное): ${hw.title}`);
    continue;
  }
  if (!hw.group_id) {
    console.log(`· пропуск (нет группы): ${hw.title}`);
    continue;
  }

  const { data: enrolled } = await admin
    .from("enrollments")
    .select("student_id")
    .eq("group_id", hw.group_id)
    .eq("status", "active");

  const { data: existing } = await admin
    .from("homework_submissions")
    .select("student_id")
    .eq("homework_id", hw.id);

  const have = new Set((existing ?? []).map((r) => r.student_id));
  const missing = (enrolled ?? [])
    .filter((e) => !have.has(e.student_id))
    .map((e) => ({
      homework_id: hw.id,
      student_id: e.student_id,
      status: "assigned",
    }));

  if (missing.length === 0) continue;

  const { error: insErr } = await admin
    .from("homework_submissions")
    .insert(missing);
  if (insErr) {
    console.error(`✗ ${hw.title}: ${insErr.message}`);
  } else {
    added += missing.length;
    console.log(`+ ${missing.length}  ${hw.group_name} — ${hw.title}`);
  }
}

console.log(`\nГотово. Добавлено назначений: ${added}.`);

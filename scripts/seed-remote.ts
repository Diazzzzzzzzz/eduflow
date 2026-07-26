/**
 * Applies the demo cohort to the linked Supabase project.
 *
 *   npm run db:seed
 *
 * `supabase db push` only applies migrations, and `supabase db reset` targets
 * the local database, so seeding a remote project needs its own path. This
 * mirrors supabase/seed.sql exactly — same fixed ids, same delete-then-insert —
 * but goes through the service-role key already configured in .env.local
 * instead of a direct Postgres connection.
 *
 * Scope: only the fixed demo ids below are removed, so students created through
 * the app (random uuids) are never touched.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { STUDENTS } from "../lib/mock-data";
import { GROUP_CURRENT_LESSON, LESSONS } from "../lib/lessons-data";
import { GROUP_TEACHER, PENDING_REVIEW_SEED, TEACHERS } from "../lib/admin-data";
import { HOMEWORK_SEED } from "../lib/group-data";
import { DEMO_VOCABULARY } from "../lib/vocabulary-data";

const CENTER_ID = "11111111-1111-1111-1111-111111111111";
const TEACHER_ID = "22222222-2222-2222-2222-222222222222";
const studentUuid = (i: number) =>
  `33333333-3333-3333-3333-${String(i + 1).padStart(12, "0")}`;

/** Read .env.local without printing any values. */
function loadEnv(): Record<string, string> {
  const out: Record<string, string> = { ...(process.env as Record<string, string>) };
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // No local file — rely on the ambient environment.
  }
  return out;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "✗ Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (.env.local)."
    );
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });
  const ids = STUDENTS.map((_, i) => studentUuid(i));

  const check = <T,>(label: string, res: { error: { message: string } | null; data?: T }) => {
    if (res.error) {
      console.error(`✗ ${label}: ${res.error.message}`);
      process.exit(1);
    }
    console.log(`✓ ${label}`);
  };

  check(
    "centre",
    await db
      .from("language_centers")
      .upsert(
        {
          id: CENTER_ID,
          name: "Astana English Academy",
          slug: "astana-english-academy",
        },
        { onConflict: "id", ignoreDuplicates: true }
      )
  );

  check(
    "teacher",
    await db.from("teachers").upsert(
      {
        id: TEACHER_ID,
        center_id: CENTER_ID,
        name: "Дана Искакова",
        role: "director",
      },
      { onConflict: "id", ignoreDuplicates: true }
    )
  );

  // Child rows cascade from the student delete.
  check("clear demo students", await db.from("students").delete().in("id", ids));

  check(
    `students (${STUDENTS.length})`,
    await db.from("students").insert(
      STUDENTS.map((s, i) => ({
        id: studentUuid(i),
        center_id: CENTER_ID,
        teacher_id: TEACHER_ID,
        name: s.name,
        initials: s.initials,
        email: s.email ?? null,
        student_group: s.group,
        target_band: s.targetBand,
        exam_date: s.examDate,
        attendance: s.attendance,
        teacher_note: s.teacherNote,
      }))
    )
  );

  // `overall` is a generated column — never send it.
  const mockTests = STUDENTS.flatMap((s, i) =>
    s.mockTests.map((t) => ({
      student_id: studentUuid(i),
      label: t.label,
      taken_on: t.date,
      listening: t.listening,
      reading: t.reading,
      writing: t.writing,
      speaking: t.speaking,
    }))
  );
  check(`mock tests (${mockTests.length})`, await db.from("mock_tests").insert(mockTests));

  const recs = STUDENTS.flatMap((s, i) =>
    s.recommendations.map((r) => ({
      student_id: studentUuid(i),
      skill: r.skill,
      priority: r.priority,
      title: r.title,
      detail: r.detail,
    }))
  );
  check(`recommendations (${recs.length})`, await db.from("recommendations").insert(recs));

  // --- Course syllabus -----------------------------------------------------
  check(
    "clear syllabus",
    await db.from("lessons").delete().eq("center_id", CENTER_ID)
  );

  check(
    `lessons (${LESSONS.length})`,
    await db.from("lessons").insert(
      LESSONS.map((l) => {
        const material = l.materials[0];
        return {
          center_id: CENTER_ID,
          number: l.number,
          title: l.title,
          summary: l.summary,
          skill: l.skill,
          material_title: material?.title ?? null,
          material_url: material?.url ?? null,
        };
      }) as never
    )
  );

  for (const [group, lesson] of Object.entries(GROUP_CURRENT_LESSON)) {
    const res = await db
      .from("groups")
      .update({ current_lesson: lesson } as never)
      .eq("name", group);
    if (res.error) {
      console.error(`✗ current lesson for ${group}: ${res.error.message}`);
      process.exit(1);
    }
  }
  console.log(`✓ current lesson set for ${Object.keys(GROUP_CURRENT_LESSON).length} groups`);

  // --- staff and group ownership -------------------------------------------
  for (const t of TEACHERS) {
    const res = await db.from("teachers").upsert(
      {
        id: t.id,
        center_id: CENTER_ID,
        name: t.name,
        role: t.role,
      } as never,
      { onConflict: "id" }
    );
    if (res.error) {
      console.error(`✗ teacher ${t.name}: ${res.error.message}`);
      process.exit(1);
    }
  }
  console.log(`✓ staff (${TEACHERS.length})`);

  for (const [group, teacherId] of Object.entries(GROUP_TEACHER)) {
    const res = await db
      .from("groups")
      .update({ teacher_id: teacherId } as never)
      .eq("name", group);
    if (res.error) {
      console.error(`✗ group owner for ${group}: ${res.error.message}`);
      process.exit(1);
    }
  }
  console.log("✓ group ownership");

  // --- homework and the review queue ---------------------------------------
  // Fixed ids so re-seeding replaces rather than duplicates; submissions cascade.
  const hwUuid = (n: number) =>
    `55555555-5555-5555-5555-${String(n).padStart(12, "0")}`;
  const hwIds = HOMEWORK_SEED.map((_, i) => hwUuid(i + 1));

  check("clear homework", await db.from("homework").delete().in("id", hwIds));

  check(
    `homework (${HOMEWORK_SEED.length})`,
    await db.from("homework").insert(
      HOMEWORK_SEED.map((h, i) => ({
        id: hwUuid(i + 1),
        group_name: h.groupName,
        title: h.title,
        description: h.description,
        section: h.section,
        due_date: h.dueDate,
      })) as never
    )
  );

  const studentIdByName = new Map(
    STUDENTS.map((s, i) => [s.name, studentUuid(i)])
  );
  const submissions = PENDING_REVIEW_SEED.flatMap((p) => {
    const studentId = studentIdByName.get(p.studentName);
    const hwIndex = HOMEWORK_SEED.findIndex((h) => h.id === p.homeworkId);
    if (!studentId || hwIndex === -1) return [];
    return [
      {
        homework_id: hwUuid(hwIndex + 1),
        student_id: studentId,
        content: "Работа отправлена на проверку.",
        status: "submitted",
        // Relative to apply time, so "waiting N hours" stays plausible.
        submitted_at: new Date(
          Date.now() - p.hoursAgo * 3_600_000
        ).toISOString(),
      },
    ];
  });
  check(
    `pending submissions (${submissions.length})`,
    await db.from("homework_submissions").insert(submissions as never)
  );

  // --- vocabulary ----------------------------------------------------------
  // Teacher lists go to the whole group; words "saved while reading" belong to
  // the demo student, so both sources are visible in the UI.
  const groupStudents = STUDENTS.map((s, i) => ({ ...s, uuid: studentUuid(i) })).filter(
    (s) => s.group === "IELTS 62"
  );
  const demoStudentId = studentUuid(0); // Арман Калибеков

  check(
    "clear vocabulary",
    await db
      .from("vocabulary_entries")
      .delete()
      .in("student_id", groupStudents.map((s) => s.uuid))
  );

  const vocabRows = groupStudents.flatMap((student) =>
    DEMO_VOCABULARY.filter(
      (w) => w.source === "teacher" || student.uuid === demoStudentId
    ).map((w) => ({
      center_id: CENTER_ID,
      student_id: student.uuid,
      term: w.term,
      phonetic: w.phonetic,
      translation: w.translation,
      example: w.example,
      source: w.source,
      topic: w.topic,
      status: w.status ?? "new",
    }))
  );
  check(
    `vocabulary (${vocabRows.length})`,
    await db.from("vocabulary_entries").insert(vocabRows as never)
  );

  const { count } = await db
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("student_group", "IELTS 62");
  const { count: lessonCount } = await db
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("center_id", CENTER_ID);
  console.log(
    `\n✓ Seed applied. Students in «IELTS 62»: ${count} · lessons: ${lessonCount}`
  );
}

main().catch((err) => {
  console.error("✗ Seeding failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

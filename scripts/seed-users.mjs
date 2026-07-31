/**
 * Seeds the five-role auth set and the real relationships between them, so the
 * access-control system can be exercised by hand.
 *
 *   SEED_PASSWORD='choose-one' node --env-file=.env.local scripts/seed-users.mjs
 *
 * Creates / updates in Supabase Auth: owner, admin, teacher, student, parent.
 * Wires the durable links the RLS policies depend on:
 *   - owner/admin/teacher → a public.teachers row (user_id set) in the demo
 *     centre, so current_user_center_ids() resolves for staff;
 *   - student  → profiles.student_id = the demo student;
 *   - parent   → a guardianships row pointing at the demo student.
 *
 * Idempotent. Requires the demo cohort (npm run db:seed) and migration 0011 to
 * be applied first. No password lives in this file: SEED_PASSWORD is required.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = process.env.SEED_PASSWORD;

if (!url || !key) {
  console.error("✗ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!PASSWORD || PASSWORD.length < 8) {
  console.error("✗ Set SEED_PASSWORD (≥ 8 chars). No password is baked into the script.");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

// Fixed ids from the demo cohort (scripts/seed-remote.ts).
const CENTER_ID = "11111111-1111-1111-1111-111111111111";
const TEACHER_ID = "22222222-2222-2222-2222-222222222222"; // Дана Искакова
const ADMIN_TEACHER_ID = "22222222-2222-2222-2222-000000000002";
const OWNER_TEACHER_ID = "22222222-2222-2222-2222-000000000003";
const DEMO_STUDENT_ID = "33333333-3333-3333-3333-000000000001"; // Арман

const USERS = [
  { email: "owner@eduflow.kz", role: "owner", full_name: "Владелец центра (демо)", student_id: null },
  { email: "admin@eduflow.kz", role: "admin", full_name: "Директор центра (демо)", student_id: null },
  { email: "teacher@eduflow.kz", role: "teacher", full_name: "Дана Искакова (демо)", student_id: null },
  { email: "student@eduflow.kz", role: "student", full_name: "Арман Калибеков (демо)", student_id: DEMO_STUDENT_ID },
  { email: "parent@eduflow.kz", role: "parent", full_name: "Родитель Армана (демо)", student_id: null },
];

async function findByEmail(email) {
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < 200) return null;
  }
}

const ids = {};

for (const u of USERS) {
  const meta = { role: u.role, full_name: u.full_name, student_id: u.student_id };
  let user = await findByEmail(u.email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: meta,
    });
    if (error) {
      console.error("✗ create", u.email, error.message);
      continue;
    }
    user = data.user;
    console.log("✓ created", u.email);
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: meta,
    });
    console.log("✓ updated", u.email);
  }
  ids[u.role] = user.id;

  const { error: pErr } = await admin
    .from("profiles")
    .upsert({ id: user.id, role: u.role, full_name: u.full_name, student_id: u.student_id });
  if (pErr) console.error("  ✗ profile", u.email, pErr.message);
}

// --- staff → teachers rows (so current_user_center_ids() resolves) ----------
async function linkStaff(teacherRowId, userId, role, name) {
  if (!userId) return;
  const { error } = await admin.from("teachers").upsert({
    id: teacherRowId,
    center_id: CENTER_ID,
    user_id: userId,
    name,
    role: role === "teacher" ? "teacher" : role, // owner|admin|director|teacher
  });
  if (error) console.error(`  ✗ link ${role} → teachers:`, error.message);
  else console.log(`✓ linked ${role} to teachers row`);
}

await linkStaff(TEACHER_ID, ids.teacher, "teacher", "Дана Искакова (демо)");
await linkStaff(ADMIN_TEACHER_ID, ids.admin, "admin", "Директор центра (демо)");
await linkStaff(OWNER_TEACHER_ID, ids.owner, "owner", "Владелец центра (демо)");

// --- parent → guardianship --------------------------------------------------
if (ids.parent) {
  const { error } = await admin
    .from("guardianships")
    .upsert(
      { parent_user_id: ids.parent, student_id: DEMO_STUDENT_ID },
      { onConflict: "parent_user_id,student_id" }
    );
  if (error) {
    console.error("  ✗ guardianship:", error.message);
    if (/relation .*guardianships.* does not exist/i.test(error.message)) {
      console.error("    → apply migration 0011 first (npm run db:setup).");
    }
  } else {
    console.log("✓ guardianship parent → Арман");
  }
}

console.log("\nDone. Five roles ready; sign in with the SEED_PASSWORD you set.");
console.log("  owner@ / admin@ / teacher@ / student@ / parent@ eduflow.kz");

/**
 * Creates the 3 demo auth accounts (teacher/student/parent) in Supabase Auth
 * and their profiles. Idempotent — updates metadata if they already exist.
 *
 *   node --env-file=.env.local scripts/seed-auth.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const PASSWORD = "demo123456";
const DEMO_STUDENT_ID = "33333333-3333-3333-3333-000000000001"; // Арман Калибеков

const DEMOS = [
  { email: "teacher@eduflow.kz", role: "teacher", full_name: "Дана Искакова (демо)", student_id: null },
  { email: "student@eduflow.kz", role: "student", full_name: "Арман Калибеков (демо)", student_id: DEMO_STUDENT_ID },
  { email: "parent@eduflow.kz", role: "parent", full_name: "Родитель Армана (демо)", student_id: DEMO_STUDENT_ID },
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

for (const d of DEMOS) {
  const meta = { role: d.role, full_name: d.full_name, student_id: d.student_id };
  let user = await findByEmail(d.email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: d.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: meta,
    });
    if (error) {
      console.error("✗ create", d.email, error.message);
      continue;
    }
    user = data.user;
    console.log("✓ created", d.email);
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: meta,
    });
    console.log("✓ updated", d.email);
  }

  const { error: pErr } = await admin
    .from("profiles")
    .upsert({ id: user.id, role: d.role, full_name: d.full_name, student_id: d.student_id });
  if (pErr) console.error("  ✗ profile", d.email, pErr.message);
}

console.log("Demo accounts ready (password: demo123456).");

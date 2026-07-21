/**
 * Applies supabase/setup.sql (schema + RLS + seed) to a Supabase Postgres DB.
 * One-time admin task; the app itself uses @supabase/supabase-js, not pg.
 *
 * New Supabase projects don't expose the direct `db.<ref>.supabase.co` host,
 * so this connects through the regional session pooler and auto-discovers the
 * region by probing which pooler accepts the credentials.
 *
 * Usage:
 *   SUPABASE_PROJECT_REF=<ref> SUPABASE_DB_PASSWORD='<pw>' npm run db:setup
 *   # optional: DATABASE_URL='postgresql://...' is tried first (direct host)
 *
 * Requires the `pg` devDependency. Never commit the password or DATABASE_URL.
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const ref = process.env.SUPABASE_PROJECT_REF;
const password = process.env.SUPABASE_DB_PASSWORD;
const directUrl = process.env.DATABASE_URL;

if (!ref || !password) {
  console.error("✗ Set SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD.");
  process.exit(1);
}

const sql = readFileSync(new URL("../supabase/setup.sql", import.meta.url), "utf8");
const ssl = { rejectUnauthorized: false }; // Supabase requires TLS

const REGIONS = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2", "ca-central-1",
  "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-central-2", "eu-north-1",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
  "sa-east-1",
];
const PREFIXES = ["aws-0", "aws-1"];

/** Candidate connection configs, most-likely first. */
const candidates = [];
if (directUrl) candidates.push({ label: "direct", connectionString: directUrl, ssl });
for (const prefix of PREFIXES) {
  for (const region of REGIONS) {
    candidates.push({
      label: `${prefix}-${region} (session pooler)`,
      host: `${prefix}-${region}.pooler.supabase.com`,
      port: 5432,
      user: `postgres.${ref}`,
      password,
      database: "postgres",
      ssl,
    });
  }
}

async function probe(cfg) {
  const c = new pg.Client({ ...cfg, connectionTimeoutMillis: 8000 });
  try {
    await c.connect();
    await c.query("select 1");
    return cfg;
  } finally {
    await c.end().catch(() => {});
  }
}

console.log(`Probing ${candidates.length} endpoints for project ${ref} …`);
let chosen;
try {
  chosen = await Promise.any(candidates.map(probe));
} catch {
  console.error(
    "✗ No endpoint accepted the credentials. Double-check the DB password, " +
      "or paste the exact 'Session pooler' URI from the Supabase dashboard."
  );
  process.exit(1);
}
console.log(`✓ Connected via ${chosen.label}`);

const client = new pg.Client({ ...chosen, connectionTimeoutMillis: 15000 });
try {
  await client.connect();
  console.log("✓ Executing setup.sql …");
  await client.query(sql);
  console.log("✓ setup.sql applied.");

  const { rows } = await client.query(`
    select
      (select count(*) from public.language_centers) as centers,
      (select count(*) from public.teachers)         as teachers,
      (select count(*) from public.students)         as students,
      (select count(*) from public.mock_tests)       as mock_tests,
      (select count(*) from public.recommendations)  as recommendations,
      (select count(*) from public.parent_reports)   as parent_reports;
  `);
  console.log("Row counts:", rows[0]);
} catch (err) {
  console.error("✗ DB setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

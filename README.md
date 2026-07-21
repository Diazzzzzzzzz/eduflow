# IELTS Pulse (EduFlow)

Academic tracking & analytics SaaS for IELTS preparation centers: mock-exam
gradebook, band-score dynamics, weak-spot recommendations, and parent report
cards.

## Quick start (local, no database)

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no Supabase env vars set, the app runs on the
bundled mock cohort (12 students) — fully interactive. Use the role switcher in
the header to move between the three views:

- **Teacher / Director** — center KPIs, mock exam gradebook (filter by group,
  add results with auto overall-band calculation), AI writing evaluator (demo).
- **Student** — target progress, 6-month band history (area chart) + skills
  radar (Recharts), weak-spot recommendation cards.
- **Parent** — mobile-style weekly report card with attendance, latest mock
  scores, teacher note, and share-to-WhatsApp/Telegram actions.

## Stack

- Next.js 14 (App Router, TypeScript, `output: "standalone"`)
- Tailwind CSS + shadcn-style components (Radix UI primitives)
- Recharts, Lucide icons
- **Supabase** (Postgres + RLS) via `@supabase/supabase-js`, with a graceful
  fallback to mock data when unconfigured

## Data layer & graceful fallback

Data access is centralized in `lib/data/students.ts` and served to the client
through `app/api/students` and `app/api/mock-tests`:

- **Supabase configured** (service-role key present) → reads/writes the database.
- **Not configured** → returns the mock cohort; new results persist to
  `localStorage`. The app never breaks on missing config.

The browser never sees the service-role key: reads happen server-side in the API
routes. Row Level Security is enabled on every table (see below), ready for
per-center isolation once teacher login is added.

## Environment variables

Copy `.env.example` → `.env.local` and fill in (see the Supabase checklist
below for where each value lives):

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon key (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Server-side reads/writes |

## Database setup

SQL lives in `supabase/`:

- `migrations/0001_initial_schema.sql` — tables (`language_centers`, `teachers`,
  `students`, `mock_tests`, `recommendations`, `parent_reports`), indexes, and
  RLS policies. `mock_tests.overall` is a generated column using official IELTS
  rounding.
- `seed.sql` — the demo cohort, generated from `lib/mock-data.ts`.

Apply via the Supabase SQL Editor (paste each file) or the CLI:

```bash
supabase link --project-ref <ref>
supabase db push                       # runs migrations
psql "$DATABASE_URL" -f supabase/seed.sql   # or paste seed.sql in the SQL Editor
```

Regenerate the seed after editing mock data:

```bash
npx tsx scripts/gen-seed.ts > supabase/seed.sql
```

## Deployment (Railway)

The repo is container-ready: `Dockerfile` (multi-stage, standalone output),
`.dockerignore`, and `railway.json` (Dockerfile builder + `/` healthcheck).

1. Push to GitHub (see `DEPLOYMENT.md`).
2. Railway → **New Project → Deploy from GitHub repo**.
3. Add the three env vars under **Variables**.
4. Deploy. Railway builds the Dockerfile and runs `node server.js` on `$PORT`.

Full step-by-step with exact URLs and where to paste keys is in
[`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Structure

```
app/            pages, layout, API routes (students, mock-tests, ai)
components/
  ui/           shadcn-style primitives
  layout/       topbar (+ center badge), logo, role switcher
  teacher/      overview cards, gradebook, add-result dialog, AI evaluator
  student/      progress dashboard + charts
  parent/       mobile report card
  charts/       Recharts wrappers
lib/
  supabase/     env, browser client, server/admin clients, DB types
  data/         server-side data access (Supabase → domain, mock fallback)
  band.ts       IELTS band-score math
  date.ts       deterministic date formatting (SSR-safe)
  mock-data.ts  demo cohort
supabase/       SQL migrations + seed
scripts/        seed generator
```

## Design notes

- **Light-first "Premium EdTech"** system: soft-sand canvas, white cards, royal
  blue (`#2563EB`) primary, emerald = at/above target, amber = attention. Dark
  mode remains via the header toggle.
- Plus Jakarta Sans (display) + Inter (body) + Newsreader serif for large band
  numerals. Layered micro-shadows (`shadow-card` / `card-hover` / `raised`).
- Band scores everywhere render as **BandChip** — numerals whose color encodes
  distance from the student's target band.
- Dates use deterministic formatting (`lib/date.ts`), not `toLocaleDateString`,
  to avoid SSR hydration mismatches.

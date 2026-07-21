# Deployment & Setup — Manual Action Checklists

Everything in the codebase is done. The steps below need **your** hands (browser
logins, copying secret keys). Do them in order.

---

## 1. Push to GitHub

The repo is initialized locally with an initial commit on the `main` branch.
`gh` is installed but not logged in. In your terminal:

```bash
# a) Authenticate (opens the browser)
gh auth login

# b) Create the remote and push in one step (run from the project root)
gh repo create ielts-pulse --private --source=. --remote=origin --push
```

**No GitHub CLI?** Create an empty repo at https://github.com/new (name it
`ielts-pulse`, don't add a README/.gitignore), then:

```bash
git remote add origin https://github.com/<your-username>/ielts-pulse.git
git push -u origin main
```

---

## 2. Create the Supabase project & get keys

1. Go to **https://supabase.com/dashboard** → **New project**.
   - Name: `ielts-pulse` · set a strong DB password · pick a region near your
     users · create.
2. Wait ~2 min for provisioning.
3. Open **Project Settings → API** (`https://supabase.com/dashboard/project/_/settings/api`)
   and copy these three values:

   | Dashboard label | Copy into env var |
   | --- | --- |
   | **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
   | **Project API keys → `anon` / `public`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | **Project API keys → `service_role` / `secret`** | `SUPABASE_SERVICE_ROLE_KEY` |

   > ⚠️ The `service_role` key bypasses Row Level Security. Never commit it or
   > expose it to the browser. It only goes in server env (`.env.local` and
   > Railway Variables).

### Local: paste into `.env.local`

```bash
cp .env.example .env.local
# then edit .env.local and paste the three values
```

Restart `npm run dev` after editing.

---

## 3. Create the database schema + seed data

In the Supabase dashboard, open **SQL Editor**
(`https://supabase.com/dashboard/project/_/sql`) and run these two files
(open each, copy all, paste, **Run**):

1. `supabase/migrations/0001_initial_schema.sql`  ← tables, indexes, RLS
2. `supabase/seed.sql`  ← the 12-student demo cohort

**Verify:** open **Table Editor** → you should see `students` with 12 rows and
`mock_tests` with 72 rows.

Once this is done and `.env.local` has the keys, `GET /api/students` returns
`"source": "supabase"` and the app is reading from the database. Confirm:

```bash
curl -s localhost:3000/api/students | grep -o '"source":"[a-z]*"'
# -> "source":"supabase"
```

---

## 4. Deploy to Railway

1. Go to **https://railway.app** → **New Project → Deploy from GitHub repo** →
   pick `ielts-pulse` (authorize Railway to access the repo if prompted).
2. Railway detects `railway.json` and builds the `Dockerfile` automatically.
3. Open the service → **Variables** tab → **New Variable** (or **Raw Editor**)
   and add all three:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>
   ```

4. Under **Settings → Networking**, click **Generate Domain** to get a public
   URL. Railway injects `$PORT`; the container already binds to it.
5. Redeploy if it built before you added the variables (**Deployments →
   ⋮ → Redeploy**).

**Verify:** visit the generated domain — the dashboard should load with your
Supabase data. Check `https://<domain>/api/students` shows `"source":"supabase"`.

---

## Quick reference — where each secret goes

| Secret | Local | Railway | Never in |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Variables | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Variables | — |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | Variables | git, browser, client code |

---

## Next step: real teacher login

RLS policies are already in place, scoped to the centres a teacher belongs to
(`teachers.user_id → auth.users`). To turn on per-center isolation:

1. Enable Supabase Auth (email or OAuth).
2. On sign-up, insert a `teachers` row linking `user_id = auth.uid()` to a
   `center_id`.
3. Switch the API routes from the service-role admin client to a request-scoped
   authenticated client (`createServerAnonClient` + the user's access token).
   The policies then enforce access automatically — no query changes needed.

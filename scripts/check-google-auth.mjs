/**
 * Checks whether Google sign-in is wired up end to end.
 *
 *   npm run check:google
 *
 * Reads only the public Supabase URL, talks to the public auth endpoint and
 * never handles a client secret. Safe to run at any time.
 */

import { readFileSync } from "node:fs";

const CALLBACK_PATHS = ["http://localhost:3000/auth/callback"];

function readEnv() {
  const fromProcess = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (fromProcess) return fromProcess;
  try {
    const file = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const line = file
      .split("\n")
      .find((l) => l.trim().startsWith("NEXT_PUBLIC_SUPABASE_URL="));
    return line?.split("=").slice(1).join("=").trim() ?? "";
  } catch {
    return "";
  }
}

const base = readEnv().replace(/\/+$/, "");
if (!base) {
  console.error("✗ Не найден NEXT_PUBLIC_SUPABASE_URL (проверьте .env.local).");
  process.exit(1);
}

console.log(`Проект Supabase: ${base}\n`);

/** The authorize endpoint answers without any credentials of ours. */
async function probe(redirectTo) {
  const url = new URL(`${base}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  if (redirectTo) url.searchParams.set("redirect_to", redirectTo);

  const res = await fetch(url, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";

  if (res.status === 400) {
    const body = await res.text().catch(() => "");
    return { ok: false, reason: "disabled", body };
  }
  if (res.status >= 300 && res.status < 400) {
    return { ok: true, location };
  }
  return { ok: false, reason: `неожиданный статус ${res.status}` };
}

const base_result = await probe(null);

if (!base_result.ok && base_result.reason === "disabled") {
  console.error("✗ Провайдер Google в Supabase ВЫКЛЮЧЕН.");
  console.error("  Authentication → Sign In / Providers → Google: включить,");
  console.error("  вставить Client ID и Client Secret из Google Cloud Console.");
  process.exit(1);
}

if (!base_result.ok) {
  console.error(`✗ Не удалось проверить провайдер: ${base_result.reason}`);
  process.exit(1);
}

console.log("✓ Провайдер Google включён.");
if (/accounts\.google\.com/.test(base_result.location)) {
  console.log("✓ Supabase перенаправляет на accounts.google.com.");
}

// A redirect_to that is not on the allow-list is silently replaced by the
// project's Site URL, which is the failure that looks like "nothing happens".
let allowListOk = true;
for (const target of CALLBACK_PATHS) {
  const res = await probe(target);
  if (!res.ok) {
    console.error(`✗ ${target}: ${res.reason}`);
    allowListOk = false;
    continue;
  }
  const echoed = decodeURIComponent(res.location);
  if (echoed.includes(encodeURIComponent(target)) || echoed.includes(target)) {
    console.log(`✓ ${target} — принят в списке Redirect URLs.`);
  } else {
    console.error(`✗ ${target} — НЕ в списке Redirect URLs Supabase.`);
    console.error("  Authentication → URL Configuration → Redirect URLs: добавьте этот адрес.");
    allowListOk = false;
  }
}

if (!allowListOk) process.exit(1);
console.log("\nВсё настроено — можно входить через Google.");

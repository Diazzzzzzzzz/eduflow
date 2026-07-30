/**
 * Reports what can actually be verified about Google sign-in from outside.
 *
 *   npm run check:google
 *
 * Reads only the public Supabase URL and talks to the public auth endpoint;
 * never handles a client secret. Safe to run at any time.
 *
 * Deliberately does NOT claim to validate the Redirect URL allow-list. The
 * authorize endpoint echoes whatever `redirect_to` it is given, on the
 * allow-list or not — it is enforced later, when the provider returns. An
 * earlier version of this script checked that echo and reported invented
 * domains as valid.
 */

import { readFileSync } from "node:fs";

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

const url = new URL(`${base}/auth/v1/authorize`);
url.searchParams.set("provider", "google");

let res;
try {
  res = await fetch(url, { redirect: "manual" });
} catch (err) {
  console.error(`✗ Supabase недоступен: ${err.message}`);
  process.exit(1);
}

if (res.status === 400) {
  const body = await res.text().catch(() => "");
  console.error("✗ Провайдер Google в Supabase ВЫКЛЮЧЕН.");
  console.error(`  Ответ: ${body.slice(0, 160)}`);
  console.error("\n  Authentication → Sign In / Providers → Google: включить");
  console.error("  и вставить Client ID и Client Secret из Google Cloud Console.");
  process.exit(1);
}

const location = res.headers.get("location") ?? "";
if (res.status < 300 || res.status >= 400 || !location) {
  console.error(`✗ Неожиданный ответ: HTTP ${res.status}`);
  process.exit(1);
}

console.log("✓ Провайдер Google включён.");

if (!/accounts\.google\.com/.test(location)) {
  console.error(`✗ Supabase ведёт не на Google, а на: ${location.slice(0, 120)}`);
  process.exit(1);
}
console.log("✓ Supabase перенаправляет на accounts.google.com.");

const clientId = new URL(location).searchParams.get("client_id") ?? "";
if (!clientId) {
  console.error("✗ В запросе нет client_id — Client ID в Supabase не сохранён.");
  process.exit(1);
}
// Only the tail, so the log can be pasted into a chat without a second thought.
console.log(`✓ Client ID подставлен (…${clientId.slice(-28)}).`);

const callbackUri = new URL(location).searchParams.get("redirect_uri") ?? "";
const expected = `${base}/auth/v1/callback`;
if (callbackUri === expected) {
  console.log(`✓ Google вернёт код на ${expected}`);
  console.log("  Ровно этот адрес должен стоять в Authorized redirect URIs.");
} else {
  console.error(`✗ Ожидался redirect_uri ${expected}, получен ${callbackUri}`);
  process.exit(1);
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "")
  ?? "https://eduflow-production-6ed5.up.railway.app";

console.log(`
Проверить извне НЕЛЬЗЯ — это видно только в дашборде:

  1. Supabase → Authentication → URL Configuration
       Site URL:
         ${SITE}
       Redirect URLs (оба):
         ${SITE}/auth/callback
         http://localhost:3000/auth/callback
     Если адреса нет в списке, Supabase молча подставит Site URL,
     и пользователь вернётся на главную вместо страницы входа.

  2. Google Cloud Console → OAuth consent screen → Publishing status
       Должно быть "In production". В статусе "Testing" войти смогут
       ТОЛЬКО аккаунты из списка Test users — остальные получат
       ошибку 403 access_denied.

Подтвердить оба пункта можно лишь реальным входом: откройте
${SITE}/login в режиме инкогнито и нажмите «Войти через Google».
`);

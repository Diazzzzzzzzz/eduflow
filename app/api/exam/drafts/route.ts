import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/supabase/auth-server";
import { draftToSection, validateDraft, type DraftPaper } from "@/lib/exam/draft";

export const dynamic = "force-dynamic";

const CONTENT_DIR = path.join(process.cwd(), "content", "papers");

/**
 * POST /api/exam/drafts — validate a paper built in the admin form and write it
 * to the content directory.
 *
 * Note this persists to the local filesystem, which is fine in development and
 * on a host with a mounted volume, but is NOT durable on an ephemeral container
 * filesystem. The response says so plainly, and the form always offers the JSON
 * download as a reliable alternative.
 */
export async function POST(request: Request) {
  const session = await getUserProfile();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }
  if (session.profile?.role === "student") {
    return NextResponse.json(
      { error: "Недостаточно прав для добавления тестов." },
      { status: 403 }
    );
  }

  let body: { draft?: DraftPaper; rightsConfirmed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  if (!body.draft) {
    return NextResponse.json({ error: "Пустая форма." }, { status: 400 });
  }
  if (!body.rightsConfirmed) {
    return NextResponse.json(
      { error: "Подтвердите права на материал перед сохранением." },
      { status: 400 }
    );
  }

  const issues = validateDraft(body.draft);
  const blocking = issues.filter((i) => i.number === null);
  if (blocking.length > 0) {
    return NextResponse.json(
      { error: "Форма заполнена не полностью.", issues: blocking },
      { status: 422 }
    );
  }

  const section = draftToSection(body.draft);
  // The id lands in a filename — keep it to characters that cannot escape the
  // content directory.
  const safeId = section.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  if (!safeId) {
    return NextResponse.json(
      { error: "Не удалось построить идентификатор теста." },
      { status: 400 }
    );
  }

  try {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    const file = path.join(CONTENT_DIR, `${safeId}.json`);
    await fs.writeFile(file, JSON.stringify(section, null, 2), "utf8");
    return NextResponse.json({
      path: `content/papers/${safeId}.json`,
      id: safeId,
      questions: section.passages[0]?.groups.reduce(
        (n, g) => n + g.questions.length,
        0
      ),
      warnings: issues.filter((i) => i.number !== null),
      note: "Файл записан на диск сервера. На хостинге с эфемерной файловой системой обязательно скачайте JSON и добавьте его в репозиторий.",
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Файловая система недоступна для записи. Скачайте JSON кнопкой рядом и добавьте его в репозиторий.",
      },
      { status: 500 }
    );
  }
}

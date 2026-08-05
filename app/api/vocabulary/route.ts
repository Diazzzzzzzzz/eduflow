import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/supabase/auth-server";
import {
  deleteWord,
  demoEntries,
  listVocabulary,
  saveWord,
  setWordStatus,
} from "@/lib/data/vocabulary";
import { isDemoSession } from "@/lib/demo-session";
import { STATUS_ORDER } from "@/lib/vocabulary-data";

export const dynamic = "force-dynamic";

/**
 * A student may only touch their own list. The id comes from the query for the
 * staff student picker, but is checked against the session for a student login
 * so nobody can read a classmate's vocabulary.
 */
async function resolveStudentId(requested: string | null) {
  const session = await getUserProfile();
  if (!session) return { error: "Требуется вход.", status: 401 as const };

  const role = session.profile?.role;
  const own = session.profile?.student_id ?? null;
  const demo = isDemoSession(session.user.id);

  // Staff may inspect any student's list; a student is pinned to their own —
  // unconditionally. The previous version only enforced that when `own` was
  // set, so a student account with no linked student row fell through to
  // whatever id the caller asked for and could read anyone's list.
  if (role === "student") {
    if (!own) {
      return {
        error: "Аккаунт не связан с профилем студента.",
        status: 403 as const,
      };
    }
    if (requested && requested !== own) {
      return { error: "Нет доступа к чужому словарю.", status: 403 as const };
    }
    return { studentId: own, demo };
  }
  return { studentId: requested ?? own ?? null, demo };
}

/** GET /api/vocabulary?studentId=… */
export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("studentId");
  const gate = await resolveStudentId(requested);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!gate.studentId) {
    return NextResponse.json({ error: "Не указан студент" }, { status: 400 });
  }

  // The showcase is served from the bundled set: it must not read the centre's
  // vocabulary, and the demo student has no row of their own to read.
  if (gate.demo) {
    return NextResponse.json({ entries: demoEntries(), source: "mock" });
  }

  const { entries, source } = await listVocabulary(gate.studentId);
  return NextResponse.json({ entries, source });
}

/** POST /api/vocabulary — save a word to the student's list. */
export async function POST(request: Request) {
  let body: {
    studentId?: string;
    term?: string;
    translation?: string;
    phonetic?: string;
    example?: string;
    topic?: string;
    source?: "student" | "teacher";
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const gate = await resolveStudentId(body.studentId ?? null);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!gate.studentId) {
    return NextResponse.json({ error: "Не указан студент" }, { status: 400 });
  }
  if (!body.term?.trim() || !body.translation?.trim()) {
    return NextResponse.json(
      { error: "Нужны слово и перевод" },
      { status: 422 }
    );
  }

  // Acknowledge the word without writing it: a demo session keeps its additions
  // client-side, so the panel behaves while the database stays untouched.
  if (gate.demo) {
    return NextResponse.json(
      {
        entry: {
          id: `demo-new-${Date.now()}`,
          term: body.term.trim(),
          phonetic: body.phonetic ?? null,
          translation: body.translation.trim(),
          example: body.example ?? null,
          source: body.source === "teacher" ? "teacher" : "student",
          topic: body.topic ?? null,
          status: "new" as const,
          createdAt: new Date().toISOString(),
        },
        existed: false,
      },
      { status: 201 }
    );
  }

  const res = await saveWord({
    studentId: gate.studentId,
    term: body.term,
    translation: body.translation,
    phonetic: body.phonetic ?? null,
    example: body.example ?? null,
    topic: body.topic ?? null,
    source: body.source === "teacher" ? "teacher" : "student",
  });
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }

  return NextResponse.json(
    { entry: res.entry, existed: res.existed },
    { status: res.existed ? 200 : 201 }
  );
}

/** PATCH /api/vocabulary — move a word between learning statuses. */
export async function PATCH(request: Request) {
  let body: { studentId?: string; id?: string; status?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const gate = await resolveStudentId(body.studentId ?? null);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!gate.studentId || !body.id) {
    return NextResponse.json({ error: "Нужны studentId и id" }, { status: 422 });
  }
  if (!STATUS_ORDER.includes(body.status as never)) {
    return NextResponse.json(
      { error: `Статус должен быть одним из: ${STATUS_ORDER.join(", ")}` },
      { status: 422 }
    );
  }

  if (gate.demo) {
    return NextResponse.json({ id: body.id, status: body.status });
  }

  const res = await setWordStatus(
    gate.studentId,
    body.id,
    body.status as (typeof STATUS_ORDER)[number]
  );
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ id: body.id, status: body.status });
}

/** DELETE /api/vocabulary?id=…&studentId=… */
export async function DELETE(request: Request) {
  const params = new URL(request.url).searchParams;
  const gate = await resolveStudentId(params.get("studentId"));
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const id = params.get("id");
  if (!gate.studentId || !id) {
    return NextResponse.json({ error: "Нужны studentId и id" }, { status: 422 });
  }

  if (gate.demo) return NextResponse.json({ id, deleted: true });

  const res = await deleteWord(gate.studentId, id);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ id, deleted: true });
}

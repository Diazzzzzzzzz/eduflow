import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Access control for /api/vocabulary.
 *
 * A vocabulary list is personal, so the endpoint decides whose list it is from
 * the session rather than from the query string. Tested directly because the
 * page guard only stops navigation.
 */
const getUserProfile = vi.fn();
const listVocabulary = vi.fn();
const saveWord = vi.fn();
const setWordStatus = vi.fn();
const deleteWord = vi.fn();

vi.mock("@/lib/supabase/auth-server", () => ({
  getUserProfile: () => getUserProfile(),
}));
vi.mock("@/lib/data/vocabulary", () => ({
  listVocabulary: (id: string) => listVocabulary(id),
  saveWord: (i: unknown) => saveWord(i),
  setWordStatus: (...a: unknown[]) => setWordStatus(...a),
  deleteWord: (...a: unknown[]) => deleteWord(...a),
  demoEntries: () => [{ id: "demo-1", term: "cohesion" }],
}));

import { GET, POST, PATCH, DELETE } from "@/app/api/vocabulary/route";

function session(role: string, studentId: string | null, userId = `user-${role}`) {
  return {
    user: { id: userId, email: `${role}@x.kz` },
    profile: { id: userId, role, full_name: role, student_id: studentId },
  };
}

const get = (q = "") => new Request(`http://x/api/vocabulary${q}`);
const post = (body: unknown) =>
  new Request("http://x/api/vocabulary", {
    method: "POST",
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  listVocabulary.mockResolvedValue({ entries: [], source: "supabase" });
  saveWord.mockResolvedValue({ ok: true, entry: { id: "w-1" }, existed: false });
  setWordStatus.mockResolvedValue({ ok: true });
  deleteWord.mockResolvedValue({ ok: true });
});

describe("GET /api/vocabulary", () => {
  it("rejects the unauthenticated with 401", async () => {
    getUserProfile.mockResolvedValue(null);
    expect((await GET(get("?studentId=s-1"))).status).toBe(401);
  });

  it("serves a student their own list", async () => {
    getUserProfile.mockResolvedValue(session("student", "s-1"));
    const res = await GET(get("?studentId=s-1"));
    expect(res.status).toBe(200);
    expect(listVocabulary).toHaveBeenCalledWith("s-1");
  });

  it("refuses a student asking for a classmate's list", async () => {
    getUserProfile.mockResolvedValue(session("student", "s-1"));
    const res = await GET(get("?studentId=s-2"));
    expect(res.status).toBe(403);
    expect(listVocabulary).not.toHaveBeenCalled();
  });

  it("pins a student to their own list even with no id in the query", async () => {
    getUserProfile.mockResolvedValue(session("student", "s-1"));
    await GET(get());
    expect(listVocabulary).toHaveBeenCalledWith("s-1");
  });

  it("refuses a student account with no linked student row", async () => {
    // The previous version skipped the ownership check when student_id was
    // null, so such an account could read anyone's list by passing an id.
    getUserProfile.mockResolvedValue(session("student", null));
    const res = await GET(get("?studentId=s-2"));
    expect(res.status).toBe(403);
    expect(listVocabulary).not.toHaveBeenCalled();
  });

  it("lets staff inspect any student's list", async () => {
    for (const role of ["teacher", "admin", "owner"]) {
      vi.clearAllMocks();
      listVocabulary.mockResolvedValue({ entries: [], source: "supabase" });
      getUserProfile.mockResolvedValue(session(role, null));
      const res = await GET(get("?studentId=s-9"));
      expect(res.status, role).toBe(200);
      expect(listVocabulary).toHaveBeenCalledWith("s-9");
    }
  });

  it("serves a demo session from the fixtures, never the database", async () => {
    getUserProfile.mockResolvedValue(session("student", "st-01", "demo-student"));
    const res = await GET(get("?studentId=st-01"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      entries: [{ id: "demo-1", term: "cohesion" }],
      source: "mock",
    });
    expect(listVocabulary).not.toHaveBeenCalled();
  });
});

describe("mutations", () => {
  it("saves a word for a real student", async () => {
    getUserProfile.mockResolvedValue(session("student", "s-1"));
    const res = await POST(post({ studentId: "s-1", term: "a", translation: "б" }));
    expect(res.status).toBe(201);
    expect(saveWord).toHaveBeenCalled();
  });

  it("refuses to save into a classmate's list", async () => {
    getUserProfile.mockResolvedValue(session("student", "s-1"));
    const res = await POST(post({ studentId: "s-2", term: "a", translation: "б" }));
    expect(res.status).toBe(403);
    expect(saveWord).not.toHaveBeenCalled();
  });

  it("acknowledges a demo word without writing it", async () => {
    getUserProfile.mockResolvedValue(session("student", "st-01", "demo-student"));
    const res = await POST(
      post({ studentId: "st-01", term: "resilience", translation: "стойкость" })
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { entry: { term: string } };
    // Echoed back so the client can keep it without a re-read.
    expect(body.entry.term).toBe("resilience");
    expect(saveWord).not.toHaveBeenCalled();
  });

  it("does not touch the database on a demo status change or delete", async () => {
    getUserProfile.mockResolvedValue(session("student", "st-01", "demo-student"));
    const patched = await PATCH(
      new Request("http://x/api/vocabulary", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "st-01", id: "demo-1", status: "learning" }),
      })
    );
    expect(patched.status).toBe(200);
    expect(setWordStatus).not.toHaveBeenCalled();

    const deleted = await DELETE(get("?id=demo-1&studentId=st-01"));
    expect(deleted.status).toBe(200);
    expect(deleteWord).not.toHaveBeenCalled();
  });
});

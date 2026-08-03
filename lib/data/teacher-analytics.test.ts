import { describe, it, expect } from "vitest";
import { demoTeacherAnalytics } from "./teacher-analytics";
import { GROUP_TEACHER, TEACHERS } from "@/lib/admin-data";
import { STUDENTS } from "@/lib/mock-data";
import { HOMEWORK_SEED, buildSubmissionSeed } from "@/lib/group-data";

/**
 * The demo analytics are derived from the bundled fixtures rather than
 * invented, so these assertions double as a check that the panel adds up: the
 * student list, the averages and the homework counts all have to agree with
 * the same source data the rest of the demo renders from.
 */
describe("demoTeacherAnalytics", () => {
  const withGroups = TEACHERS.filter((t) =>
    Object.values(GROUP_TEACHER).includes(t.id)
  );

  it("resolves every teacher who runs a group", () => {
    expect(withGroups.length).toBeGreaterThan(0);
    for (const t of withGroups) {
      expect(demoTeacherAnalytics(t.id), t.name).not.toBeNull();
    }
  });

  it("returns null for an unknown teacher so the route can 404", () => {
    expect(demoTeacherAnalytics("no-such-teacher")).toBeNull();
    expect(demoTeacherAnalytics("")).toBeNull();
  });

  it("lists exactly the groups assigned to that teacher", () => {
    for (const t of withGroups) {
      const expected = Object.entries(GROUP_TEACHER)
        .filter(([, id]) => id === t.id)
        .map(([name]) => name)
        .sort();
      const a = demoTeacherAnalytics(t.id)!;
      expect(a.groups.map((g) => g.name).sort(), t.name).toEqual(expected);
    }
  });

  it("counts only the students in those groups", () => {
    for (const t of withGroups) {
      const a = demoTeacherAnalytics(t.id)!;
      const names = new Set(a.groups.map((g) => g.name));
      const expected = STUDENTS.filter((s) => names.has(s.group));
      expect(a.studentCount, t.name).toBe(expected.length);
      expect(a.students).toHaveLength(expected.length);
      for (const s of a.students) expect(names.has(s.group)).toBe(true);
    }
  });

  it("keeps the per-group headcount consistent with the student list", () => {
    for (const t of withGroups) {
      const a = demoTeacherAnalytics(t.id)!;
      const summed = a.groups.reduce((n, g) => n + g.students, 0);
      expect(summed, t.name).toBe(a.studentCount);
    }
  });

  it("averages the band over the teacher's own students", () => {
    for (const t of withGroups) {
      const a = demoTeacherAnalytics(t.id)!;
      const bands = a.students
        .map((s) => s.band)
        .filter((b): b is number => b != null);
      if (bands.length === 0) {
        expect(a.kpis.averageBand).toBeNull();
        continue;
      }
      const expected =
        Math.round((bands.reduce((x, y) => x + y, 0) / bands.length) * 10) / 10;
      expect(a.kpis.averageBand, t.name).toBe(expected);
      // A band is a band: never outside the IELTS scale.
      expect(a.kpis.averageBand!).toBeGreaterThanOrEqual(0);
      expect(a.kpis.averageBand!).toBeLessThanOrEqual(9);
    }
  });

  it("sorts students by band, strongest first", () => {
    for (const t of withGroups) {
      const a = demoTeacherAnalytics(t.id)!;
      const bands = a.students.map((s) => s.band ?? 0);
      expect([...bands].sort((x, y) => y - x), t.name).toEqual(bands);
    }
  });

  it("counts homework only for the teacher's own groups", () => {
    for (const t of withGroups) {
      const a = demoTeacherAnalytics(t.id)!;
      const names = new Set(a.groups.map((g) => g.name));
      const tasks = HOMEWORK_SEED.filter((h) => names.has(h.groupName));
      expect(a.homework.tasks, t.name).toBe(tasks.length);

      const ids = new Set(tasks.map((h) => h.id));
      const subs = buildSubmissionSeed().filter((s) => ids.has(s.homeworkId));
      expect(a.homework.total, t.name).toBe(subs.length);
    }
  });

  it("splits every submission into exactly one bucket", () => {
    for (const t of withGroups) {
      const { homework } = demoTeacherAnalytics(t.id)!;
      expect(
        homework.graded + homework.awaitingReview + homework.notSubmitted,
        t.name
      ).toBe(homework.total);
    }
  });

  it("measures the review rate against handed-in work, not everything set", () => {
    // Counting never-submitted rows in the denominator would blame the teacher
    // for the students' backlog.
    for (const t of withGroups) {
      const { homework, kpis } = demoTeacherAnalytics(t.id)!;
      const handedIn = homework.graded + homework.awaitingReview;
      if (handedIn === 0) {
        expect(kpis.reviewedRate, t.name).toBeNull();
        continue;
      }
      expect(kpis.reviewedRate, t.name).toBe(
        Math.round((homework.graded / handedIn) * 100)
      );
      expect(kpis.reviewedRate!).toBeGreaterThanOrEqual(0);
      expect(kpis.reviewedRate!).toBeLessThanOrEqual(100);
    }
  });

  it("reports an absent metric as null rather than zero", () => {
    // A teacher with no groups has no cohort — every KPI must be absent, not 0,
    // so the panel can show "—" instead of implying a bad score.
    const idle = TEACHERS.find(
      (t) => !Object.values(GROUP_TEACHER).includes(t.id)
    );
    if (!idle) return;
    const a = demoTeacherAnalytics(idle.id)!;
    expect(a.groups).toEqual([]);
    expect(a.studentCount).toBe(0);
    expect(a.kpis.averageBand).toBeNull();
    expect(a.kpis.attendance).toBeNull();
    expect(a.kpis.reviewedRate).toBeNull();
    expect(a.homework.averageBand).toBeNull();
  });

  it("keeps attendance a percentage", () => {
    for (const t of withGroups) {
      const { kpis } = demoTeacherAnalytics(t.id)!;
      expect(kpis.attendance).not.toBeNull();
      expect(kpis.attendance!).toBeGreaterThanOrEqual(0);
      expect(kpis.attendance!).toBeLessThanOrEqual(100);
      // A percentage, not a band: no stray decimal.
      expect(Number.isInteger(kpis.attendance!), t.name).toBe(true);
    }
  });

  it("marks itself as fixture-backed so the UI can tell", () => {
    expect(demoTeacherAnalytics(withGroups[0].id)!.source).toBe("mock");
  });
});

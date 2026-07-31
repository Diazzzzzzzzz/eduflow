import { describe, it, expect } from "vitest";
import { scopeStudentsForRole } from "./students";
import type { Student } from "@/lib/types";

/**
 * The pure scoping rule behind both the mock/demo path and (mirrored) the RLS
 * policies. If this rule is right, "student sees only self / parent sees only
 * wards / stranger sees nothing" holds regardless of the data source.
 */

function student(id: string): Student {
  return {
    id,
    name: id,
    initials: id.slice(0, 2),
    group: "IELTS 62",
    targetBand: 7,
    examDate: "",
    attendance: 90,
    teacherNote: "",
    mockTests: [],
    recommendations: [],
  };
}

const cohort = [student("s-1"), student("s-2"), student("s-3")];

describe("scopeStudentsForRole", () => {
  it("a student sees only their own row", () => {
    const visible = scopeStudentsForRole(cohort, {
      role: "student",
      studentId: "s-2",
    });
    expect(visible.map((s) => s.id)).toEqual(["s-2"]);
  });

  it("a student cannot see another student", () => {
    const visible = scopeStudentsForRole(cohort, {
      role: "student",
      studentId: "s-2",
    });
    expect(visible.some((s) => s.id === "s-1")).toBe(false);
    expect(visible.some((s) => s.id === "s-3")).toBe(false);
  });

  it("a parent sees only their wards", () => {
    const visible = scopeStudentsForRole(cohort, {
      role: "parent",
      wardIds: ["s-3"],
    });
    expect(visible.map((s) => s.id)).toEqual(["s-3"]);
  });

  it("a parent with no wards sees nothing", () => {
    const visible = scopeStudentsForRole(cohort, {
      role: "parent",
      wardIds: [],
    });
    expect(visible).toHaveLength(0);
  });

  it("a parent cannot see a child that is not theirs", () => {
    const visible = scopeStudentsForRole(cohort, {
      role: "parent",
      wardIds: ["s-1"],
    });
    expect(visible.some((s) => s.id === "s-2")).toBe(false);
  });

  it("staff (teacher/admin/owner) see the whole cohort", () => {
    for (const role of ["teacher", "admin", "owner"] as const) {
      expect(scopeStudentsForRole(cohort, { role })).toHaveLength(3);
    }
  });

  it("an unknown or missing role sees nothing (no accidental leak)", () => {
    expect(scopeStudentsForRole(cohort, { role: undefined })).toHaveLength(0);
  });
});

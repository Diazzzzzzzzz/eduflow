export type Skill = "listening" | "reading" | "writing" | "speaking";

export const SKILLS: Skill[] = ["listening", "reading", "writing", "speaking"];

export interface SkillScores {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
}

export interface MockTest extends SkillScores {
  id: string;
  date: string; // ISO date
  label: string; // e.g. "Mock #4 — Cambridge 18"
  overall: number;
}

export interface Recommendation {
  id: string;
  skill: Skill;
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
}

export interface Student {
  id: string;
  name: string;
  initials: string;
  /** Contact address used to invite the student to the portal. */
  email?: string;
  group: string;
  targetBand: number;
  examDate: string; // ISO date
  attendance: number; // 0-100
  teacherNote: string;
  mockTests: MockTest[];
  recommendations: Recommendation[];
}

export type Role = "teacher" | "student" | "parent";

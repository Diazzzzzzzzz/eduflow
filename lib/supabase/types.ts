/**
 * Database row types for the Supabase schema in supabase/migrations.
 * Hand-written to mirror the SQL; regenerate with the Supabase CLI
 * (`supabase gen types typescript`) once you have a linked project if you
 * prefer generated types.
 */

export type Priority = "high" | "medium" | "low";
export type SkillName = "listening" | "reading" | "writing" | "speaking";

export interface LanguageCenterRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface TeacherRow {
  id: string;
  center_id: string;
  user_id: string | null;
  name: string;
  role: string;
  created_at: string;
}

export interface StudentRow {
  id: string;
  center_id: string;
  teacher_id: string | null;
  name: string;
  initials: string;
  student_group: string;
  target_band: number;
  exam_date: string | null;
  attendance: number;
  teacher_note: string | null;
  created_at: string;
}

export interface MockTestRow {
  id: string;
  student_id: string;
  label: string;
  taken_on: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  overall: number;
  created_at: string;
}

export interface RecommendationRow {
  id: string;
  student_id: string;
  skill: SkillName;
  priority: Priority;
  title: string;
  detail: string;
  created_at: string;
}

export interface ParentReportRow {
  id: string;
  student_id: string;
  week_of: string;
  channel: "whatsapp" | "telegram" | "email" | null;
  status: "pending" | "sent";
  summary: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface GroupRow {
  id: string;
  name: string;
  schedule: string | null;
  /** Pointer into the syllabus; see migration 0007. */
  current_lesson: number;
  created_at: string;
}

export interface LessonRow {
  id: string;
  center_id: string;
  number: number;
  title: string;
  summary: string | null;
  skill: SkillName | "general";
  material_title: string | null;
  material_url: string | null;
  created_at: string;
}

export interface ExamPaperRow {
  id: string;
  center_id: string;
  slug: string;
  title: string;
  skill: "reading" | "listening";
  duration_minutes: number;
  attribution: string | null;
  passage_count: number;
  question_count: number;
  /** The whole `ExamSectionFull`, answer keys included. */
  payload: unknown;
  published: boolean;
  imported_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Minimal Database shape for `createClient<Database>()` typing. */
export interface Database {
  public: {
    Tables: {
      language_centers: {
        Row: LanguageCenterRow;
        Insert: Partial<LanguageCenterRow> & Pick<LanguageCenterRow, "name" | "slug">;
        Update: Partial<LanguageCenterRow>;
        Relationships: [];
      };
      teachers: {
        Row: TeacherRow;
        Insert: Partial<TeacherRow> & Pick<TeacherRow, "center_id" | "name">;
        Update: Partial<TeacherRow>;
        Relationships: [];
      };
      students: {
        Row: StudentRow;
        Insert: Partial<StudentRow> &
          Pick<StudentRow, "center_id" | "name" | "initials" | "student_group" | "target_band">;
        Update: Partial<StudentRow>;
        Relationships: [];
      };
      mock_tests: {
        Row: MockTestRow;
        Insert: Omit<MockTestRow, "id" | "overall" | "created_at"> &
          Partial<Pick<MockTestRow, "id" | "created_at">>;
        Update: Partial<MockTestRow>;
        Relationships: [];
      };
      recommendations: {
        Row: RecommendationRow;
        Insert: Omit<RecommendationRow, "id" | "created_at"> &
          Partial<Pick<RecommendationRow, "id" | "created_at">>;
        Update: Partial<RecommendationRow>;
        Relationships: [];
      };
      parent_reports: {
        Row: ParentReportRow;
        Insert: Omit<ParentReportRow, "id" | "created_at"> &
          Partial<Pick<ParentReportRow, "id" | "created_at" | "status">>;
        Update: Partial<ParentReportRow>;
        Relationships: [];
      };
      groups: {
        Row: GroupRow;
        Insert: Partial<GroupRow> & Pick<GroupRow, "name">;
        Update: Partial<GroupRow>;
        Relationships: [];
      };
      exam_papers: {
        Row: ExamPaperRow;
        Insert: Omit<ExamPaperRow, "id" | "created_at"> &
          Partial<Pick<ExamPaperRow, "id" | "created_at">>;
        Update: Partial<ExamPaperRow>;
        Relationships: [];
      };
      lessons: {
        Row: LessonRow;
        Insert: Omit<LessonRow, "id" | "created_at"> &
          Partial<Pick<LessonRow, "id" | "created_at">>;
        Update: Partial<LessonRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

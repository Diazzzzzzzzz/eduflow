"use client";

import { useApp } from "@/components/app-provider";
import { Topbar } from "@/components/layout/topbar";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { StudentDashboard } from "@/components/student/student-dashboard";
import { ParentPortal } from "@/components/parent/parent-portal";

export default function Home() {
  const { role } = useApp();

  return (
    <div className="canvas-grid min-h-screen">
      <Topbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {role === "teacher" && <TeacherDashboard />}
        {role === "student" && <StudentDashboard />}
        {role === "parent" && <ParentPortal />}
      </main>
      <footer className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-8 pt-4 sm:px-6">
        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
          © {new Date().getFullYear()} Astana English Academy
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-gradient-to-b from-card to-secondary px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-primary" aria-hidden>
            <path
              d="M2 14h4l2.5-7 3.5 10 3-6.5 1.5 3.5H22"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Powered by IELTS Pulse
        </span>
      </footer>
    </div>
  );
}

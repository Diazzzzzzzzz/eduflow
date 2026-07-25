"use client";

import { useApp } from "@/components/app-provider";
import { LessonsView } from "@/components/lessons/lessons-view";

export default function StudentLessonsPage() {
  const { activeStudent } = useApp();
  return <LessonsView groupName={activeStudent.group} />;
}

import { notFound } from "next/navigation";
import { PracticeSession } from "@/components/student/practice-session";
import { SKILLS } from "@/lib/types";

export default function PracticeSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const section = params.section;
  if (!SKILLS.includes(section as (typeof SKILLS)[number])) notFound();
  return <PracticeSession section={section as (typeof SKILLS)[number]} />;
}

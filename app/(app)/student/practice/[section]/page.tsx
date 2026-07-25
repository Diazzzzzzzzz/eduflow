import { notFound } from "next/navigation";
import { PracticeEngine } from "@/components/cambridge/practice-engine";
import { ExamEntry } from "@/components/exam/exam-entry";
import { loadFullSection, toPublicSection } from "@/lib/exam/service";
import { SKILLS } from "@/lib/types";

export default function PracticeSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const section = params.section;
  if (!SKILLS.includes(section as (typeof SKILLS)[number])) notFound();

  // Sections with a full exam paper run on the exam engine; the rest keep the
  // lighter practice engine until their papers are authored.
  const full = loadFullSection({ skill: section });
  if (full) {
    // Keys are stripped here, on the server — the browser never receives them.
    return <ExamEntry section={toPublicSection(full)} />;
  }

  return <PracticeEngine section={section as (typeof SKILLS)[number]} />;
}

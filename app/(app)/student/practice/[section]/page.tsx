import { notFound } from "next/navigation";
import { PracticeEngine } from "@/components/cambridge/practice-engine";
import { ExamEntry } from "@/components/exam/exam-entry";
import { loadFullSection, toPublicSection } from "@/lib/exam/service";
import { SKILLS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PracticeSectionPage({
  params,
  searchParams,
}: {
  params: { section: string };
  searchParams: { paper?: string };
}) {
  const section = params.section;
  if (!SKILLS.includes(section as (typeof SKILLS)[number])) notFound();

  // Sections with a full exam paper run on the exam engine; the rest keep the
  // lighter practice engine until their papers are authored. `?paper=` opens a
  // specific one, otherwise the newest imported paper for the skill wins.
  const full = await loadFullSection({
    sectionId: searchParams.paper ?? null,
    skill: section,
  });
  if (full) {
    // Keys are stripped here, on the server — the browser never receives them.
    return <ExamEntry section={toPublicSection(full)} />;
  }

  return <PracticeEngine section={section as (typeof SKILLS)[number]} />;
}

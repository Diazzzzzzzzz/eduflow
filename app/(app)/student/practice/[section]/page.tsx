import { notFound } from "next/navigation";
import { PracticeEngine } from "@/components/cambridge/practice-engine";
import { SKILLS } from "@/lib/types";

export default function PracticeSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const section = params.section;
  if (!SKILLS.includes(section as (typeof SKILLS)[number])) notFound();
  return <PracticeEngine section={section as (typeof SKILLS)[number]} />;
}

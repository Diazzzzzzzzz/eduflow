import { notFound } from "next/navigation";
import { ExamEntry } from "@/components/exam/exam-entry";
import { buildDrillSection } from "@/lib/exam/drills";
import { toPublicSection } from "@/lib/exam/service";

export const dynamic = "force-dynamic";

export default function DrillPage({ params }: { params: { type: string } }) {
  const drill = buildDrillSection(params.type);
  if (!drill) notFound();

  // Assembled and stripped on the server: the browser never sees the keys.
  return (
    <ExamEntry
      section={toPublicSection(drill)}
      backHref="/student/practice/drills"
    />
  );
}

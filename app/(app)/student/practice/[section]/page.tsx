import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { ExamEntry } from "@/components/exam/exam-entry";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadFullSection, toPublicSection } from "@/lib/exam/service";
import { cn } from "@/lib/utils";
import { SKILLS } from "@/lib/types";

export const dynamic = "force-dynamic";

const SECTION_LABELS: Record<string, string> = {
  listening: "Аудирование",
  reading: "Чтение",
  writing: "Письмо",
  speaking: "Говорение",
};

export default async function PracticeSectionPage({
  params,
  searchParams,
}: {
  params: { section: string };
  searchParams: { paper?: string };
}) {
  const section = params.section;
  if (!SKILLS.includes(section as (typeof SKILLS)[number])) notFound();

  // `?paper=` opens a specific one, otherwise the newest paper for the skill.
  const full = await loadFullSection({
    sectionId: searchParams.paper ?? null,
    skill: section,
  });

  if (full) {
    // Keys are stripped here, on the server — the browser never receives them.
    return <ExamEntry section={toPublicSection(full)} />;
  }

  // No paper for this skill. This used to fall through to the old Cambridge
  // practice engine, which opened a test with no passage text, no audio, and —
  // for writing and speaking — no questions at all. Saying so plainly beats
  // handing a student something unanswerable.
  return (
    <Card className="mx-auto max-w-md animate-fade-up">
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <BookOpen className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium">
            Тестов в разделе «{SECTION_LABELS[section] ?? section}» пока нет
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Они появятся, как только центр загрузит материалы.
          </p>
        </div>
        <Link
          href="/student/practice"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          К доступным тестам
        </Link>
      </CardContent>
    </Card>
  );
}

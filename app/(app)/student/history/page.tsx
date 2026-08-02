import { ExamHistory } from "@/components/student/exam-history";
import { PracticeAttempts } from "@/components/student/practice-attempts";
import { listAttempts } from "@/lib/data/exam-attempts";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  // No student filter: the read runs under the caller's session, so RLS
  // (migration 0016) returns exactly their own attempts.
  const attempts = await listAttempts();

  return (
    <div className="space-y-6">
      <ExamHistory />
      <PracticeAttempts attempts={attempts} />
    </div>
  );
}

import { PracticeCatalog } from "@/components/student/practice-catalog";
import { listAvailablePapers } from "@/lib/exam/service";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  // Loaded on the server so the catalogue reflects imported papers too; the
  // listing carries no answer keys.
  const papers = await listAvailablePapers();
  return <PracticeCatalog papers={papers} />;
}

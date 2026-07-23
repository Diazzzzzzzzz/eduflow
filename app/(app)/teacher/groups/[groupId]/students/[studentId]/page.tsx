import { StudentReport } from "@/components/teacher/student-report";

export default function StudentReportPage({
  params,
}: {
  params: { groupId: string; studentId: string };
}) {
  return (
    <StudentReport groupId={params.groupId} studentId={params.studentId} />
  );
}

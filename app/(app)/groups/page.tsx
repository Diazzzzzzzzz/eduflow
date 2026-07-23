import { TeacherNav } from "@/components/teacher/teacher-nav";
import { GroupsView } from "@/components/groups/groups-view";

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <TeacherNav />
      <GroupsView />
    </div>
  );
}

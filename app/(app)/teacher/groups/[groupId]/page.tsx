import { GroupDetail } from "@/components/groups/group-detail";

/**
 * Group workspace. Filed under /teacher/ for historical reasons, but leadership
 * opens it too — the component reads the viewer's role from the session and
 * adapts its navigation, so the URL prefix does not imply a role.
 */
export default function GroupWorkspacePage({
  params,
}: {
  params: { groupId: string };
}) {
  return <GroupDetail groupName={decodeURIComponent(params.groupId)} />;
}

"use client";

import { useRouter } from "next/navigation";
import { GroupDetail } from "@/components/groups/group-detail";

export default function GroupWorkspacePage({
  params,
}: {
  params: { groupId: string };
}) {
  const router = useRouter();
  const groupName = decodeURIComponent(params.groupId);
  return (
    <GroupDetail groupName={groupName} onBack={() => router.push("/teacher")} />
  );
}

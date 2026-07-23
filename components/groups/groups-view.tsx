"use client";

import * as React from "react";
import { GroupsOverview } from "@/components/groups/groups-overview";
import { GroupDetail } from "@/components/groups/group-detail";

export function GroupsView() {
  const [selected, setSelected] = React.useState<string | null>(null);
  return selected ? (
    <GroupDetail groupName={selected} onBack={() => setSelected(null)} />
  ) : (
    <GroupsOverview onSelect={setSelected} />
  );
}

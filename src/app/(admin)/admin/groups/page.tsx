import React from "react";
import { getGroups } from "@/lib/actions/groups";
import { GroupsManagerView } from "@/components/groups/groups-manager-view";

export const dynamic = "force-dynamic";

export default async function AdminGroupsPage() {
  const groups = await getGroups();

  return <GroupsManagerView initialGroups={groups} />;
}

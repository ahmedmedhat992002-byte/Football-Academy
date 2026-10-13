import React from "react";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { PlayersManagerView } from "@/components/players/players-manager-view";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  const [players, groups] = await Promise.all([getPlayers(), getGroups()]);

  return (
    <PlayersManagerView
      initialPlayers={players}
      groups={groups}
      canManage={true}
    />
  );
}

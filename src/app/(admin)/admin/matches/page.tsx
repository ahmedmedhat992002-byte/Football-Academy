import React from "react";
import { getMatches } from "@/lib/actions/matches";
import { getGroups } from "@/lib/actions/groups";
import { getPlayers } from "@/lib/actions/players";
import { MatchesManagerView } from "@/components/matches/matches-manager-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المباريات والبطولات | FIFA FC ACADEMY",
  description: "إدارة جدول المباريات الودية والبطولات الرسمية وتسجيل النتائج والأهداف",
};

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  const [matches, groups, players] = await Promise.all([
    getMatches(),
    getGroups(),
    getPlayers(),
  ]);

  return (
    <MatchesManagerView
      initialMatches={matches}
      groups={groups}
      players={players}
      canManage={true}
    />
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getMatches } from "@/lib/actions/matches";
import { getGroups } from "@/lib/actions/groups";
import { getPlayers } from "@/lib/actions/players";
import { MatchesManagerView } from "@/components/matches/matches-manager-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مباريات الفريق | FIFA FC ACADEMY",
  description: "متابعة مباريات الفرق وتسجيل نتائج وأهداف اللاعبين",
};

export const dynamic = "force-dynamic";

export default async function CoachMatchesPage() {
  const user = await getCurrentUser();
  const [allMatches, allGroups, allPlayers] = await Promise.all([
    getMatches(),
    getGroups(),
    getPlayers(),
  ]);

  // Filter groups assigned to coach if any
  const coachGroups = allGroups.filter((g) => !user?.id || g.coach_id === user.id);
  const relevantGroups = coachGroups.length > 0 ? coachGroups : allGroups;

  return (
    <MatchesManagerView
      initialMatches={allMatches}
      groups={relevantGroups}
      players={allPlayers}
      canManage={true}
    />
  );
}

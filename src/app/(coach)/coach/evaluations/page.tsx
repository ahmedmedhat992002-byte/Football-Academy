import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getEvaluations } from "@/lib/actions/evaluations";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { EvaluationsManagerView } from "@/components/evaluations/evaluations-manager-view";

export const dynamic = "force-dynamic";

export default async function CoachEvaluationsPage() {
  const user = await getCurrentUser();
  const coachId = user?.id || "00000000-0000-0000-0000-000000000002";

  const [allEvaluations, allPlayers, allGroups] = await Promise.all([
    getEvaluations(),
    getPlayers(),
    getGroups(),
  ]);

  // Coach sees their groups
  const coachGroups = allGroups.filter(
    (g) => g.coach_id === coachId || g.coach_name?.includes("محمود")
  );
  const coachGroupIds = new Set(coachGroups.map((g) => g.id));

  // Coach's players
  const coachPlayers = allPlayers.filter(
    (p) => p.group_id && coachGroupIds.has(p.group_id)
  );
  const coachPlayerIds = new Set(coachPlayers.map((p) => p.id));

  const coachEvaluations = allEvaluations.filter(
    (e) =>
      coachPlayerIds.has(e.player_id) ||
      e.coach_id === coachId ||
      e.coach_name?.includes("محمود")
  );

  return (
    <EvaluationsManagerView
      initialEvaluations={coachEvaluations}
      players={coachPlayers.length > 0 ? coachPlayers : allPlayers}
      groups={coachGroups}
      canManage={true}
      coachId={coachId}
      roleTitle="تقييمات لاعبي المجموعات التدريبية المخصصة"
    />
  );
}

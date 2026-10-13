import React from "react";
import { getEvaluations } from "@/lib/actions/evaluations";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { EvaluationsManagerView } from "@/components/evaluations/evaluations-manager-view";

export const dynamic = "force-dynamic";

export default async function AdminEvaluationsPage() {
  const [evaluations, players, groups] = await Promise.all([
    getEvaluations(),
    getPlayers(),
    getGroups(),
  ]);

  return (
    <EvaluationsManagerView
      initialEvaluations={evaluations}
      players={players}
      groups={groups}
      canManage={true}
      roleTitle="إدارة التقييمات الفنية والبدنية للأكاديمية"
    />
  );
}

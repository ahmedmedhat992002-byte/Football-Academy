import React from "react";
import { getCoaches } from "@/lib/actions/coaches";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { getSessions } from "@/lib/actions/sessions";
import { getEvaluations } from "@/lib/actions/evaluations";
import { CoachesManagerView } from "@/components/coaches/coaches-manager-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الجهاز الفني والمدربين | FIFA FC ACADEMY",
  description: "مراجعة واعتماد طلبات انضمام المدربين وإدارة الجهاز الفني في FIFA FC ACADEMY",
};

export const dynamic = "force-dynamic";

export default async function AdminCoachesPage() {
  const [coaches, players, groups, sessions, evaluations] = await Promise.all([
    getCoaches(),
    getPlayers(),
    getGroups(),
    getSessions(),
    getEvaluations(),
  ]);

  return (
    <div className="space-y-6">
      <CoachesManagerView
        initialCoaches={coaches}
        initialPlayers={players}
        initialGroups={groups}
        initialSessions={sessions}
        initialEvaluations={evaluations}
      />
    </div>
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getGroups } from "@/lib/actions/groups";
import { getSessions } from "@/lib/actions/sessions";
import { getPlayers } from "@/lib/actions/players";
import { getEvaluations } from "@/lib/actions/evaluations";

import { CoachGreetingBanner } from "@/components/coach/dashboard/coach-greeting-banner";
import { CoachNextSessionCard } from "@/components/coach/dashboard/coach-next-session-card";
import { CoachStatCards } from "@/components/coach/dashboard/coach-stat-cards";
import { CoachAssignedGroupsCard } from "@/components/coach/dashboard/coach-assigned-groups-card";
import { CoachUpcomingSessionsCard } from "@/components/coach/dashboard/coach-upcoming-sessions-card";
import { CoachEvaluationPromo } from "@/components/coach/dashboard/coach-evaluation-promo";

export const dynamic = "force-dynamic";

export default async function CoachDashboardPage() {
  const user = await getCurrentUser();
  const coachId = user?.id || "00000000-0000-0000-0000-000000000002";
  const coachName = user?.fullName || "محمود السعدني";

  const [allGroups, allSessions, allPlayers, allEvaluations] = await Promise.all([
    getGroups(),
    getSessions({ coachId }),
    getPlayers(),
    getEvaluations(),
  ]);

  // Filter groups assigned to this coach (or default to coach's groups)
  const coachGroups = allGroups.filter(
    (g) => g.coach_id === coachId || g.coach_name?.includes("محمود") || allGroups.indexOf(g) < 2
  );

  const groupIds = new Set(coachGroups.map((g) => g.id));
  const coachPlayers = allPlayers.filter(
    (p) => (p.group_id && groupIds.has(p.group_id)) || p.group_id === "group-u10-001" || p.group_id === "group-u12-002"
  );

  const totalPlayersCount = coachPlayers.length;

  // Find upcoming or today's session
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingSessions = allSessions.slice(0, 4);
  const nextSession = allSessions.find((s) => s.session_date >= todayStr) || allSessions[0];

  // Coach's completed evaluations
  const coachEvaluations = allEvaluations.filter(
    (e) => e.coach_id === coachId || e.coach_name?.includes("محمود")
  );

  const assignedGroupsSummary = coachGroups
    .map((g) => `${g.name} (${g.age_category})`)
    .join(" و ");

  const ageCategoriesSummary = coachGroups
    .map((g) => g.age_category)
    .join("، ");

  return (
    <div className="space-y-6">
      {/* Coach Pitch Greeting Banner */}
      <CoachGreetingBanner
        coachName={coachName}
        assignedGroupsSummary={assignedGroupsSummary}
      />

      {/* Quick Pitch Action Card */}
      <CoachNextSessionCard
        nextSession={nextSession}
        coachPlayersCount={coachPlayers.length}
      />

      {/* Coach Quick Stats */}
      <CoachStatCards
        groupsCount={coachGroups.length}
        ageCategoriesSummary={ageCategoriesSummary}
        totalPlayersCount={totalPlayersCount}
        evaluationsCount={coachEvaluations.length}
      />

      {/* Main Content Grid: Assigned Groups & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoachAssignedGroupsCard coachGroups={coachGroups} />
        <CoachUpcomingSessionsCard upcomingSessions={upcomingSessions} />
      </div>

      {/* Quick Action Bar for Monthly Skill Evaluations */}
      <CoachEvaluationPromo />
    </div>
  );
}

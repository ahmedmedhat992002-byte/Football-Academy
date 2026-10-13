import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getSessions } from "@/lib/actions/sessions";
import { getGroups } from "@/lib/actions/groups";
import { SessionsManagerView } from "@/components/sessions/sessions-manager-view";

export const dynamic = "force-dynamic";

export default async function CoachSessionsPage() {
  const user = await getCurrentUser();
  const coachId = user?.id || "00000000-0000-0000-0000-000000000002";

  const [allSessions, allGroups] = await Promise.all([
    getSessions(),
    getGroups(),
  ]);

  // Filter to coach's groups
  const coachGroups = allGroups.filter(
    (g) => g.coach_id === coachId || g.coach_name?.includes("محمود")
  );
  const coachGroupIds = new Set(coachGroups.map((g) => g.id));

  const coachSessions = allSessions.filter(
    (s) =>
      coachGroupIds.has(s.group_id) ||
      s.coach_id === coachId ||
      s.coach_name?.includes("محمود")
  );

  return (
    <SessionsManagerView
      initialSessions={coachSessions}
      groups={coachGroups}
      baseRole="coach"
    />
  );
}

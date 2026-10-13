import React from "react";
import { getSessions } from "@/lib/actions/sessions";
import { getGroups } from "@/lib/actions/groups";
import { SessionsManagerView } from "@/components/sessions/sessions-manager-view";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const [sessions, groups] = await Promise.all([getSessions(), getGroups()]);

  return (
    <SessionsManagerView
      initialSessions={sessions}
      groups={groups}
      baseRole="admin"
    />
  );
}

import React from "react";
import { notFound } from "next/navigation";
import { getAttendanceRosterForSession } from "@/lib/actions/attendance";
import { QuickAttendanceView } from "@/components/attendance/quick-attendance-view";

export const dynamic = "force-dynamic";

interface AdminAttendancePageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function AdminAttendancePage({
  params,
}: AdminAttendancePageProps) {
  const { sessionId } = await params;
  const { session, roster } = await getAttendanceRosterForSession(sessionId);

  if (!session) {
    notFound();
  }

  return (
    <QuickAttendanceView
      session={session}
      initialRoster={roster}
      baseRole="admin"
    />
  );
}

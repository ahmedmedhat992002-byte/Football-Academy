import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSessions } from "@/lib/actions/sessions";

export const dynamic = "force-dynamic";

export default async function CoachPitchQuickPage() {
  const user = await getCurrentUser();
  const coachId = user?.id || "00000000-0000-0000-0000-000000000002";
  const sessions = await getSessions({ coachId });

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySession = sessions.find((s) => s.session_date === todayStr);

  if (todaySession) {
    redirect(`/coach/attendance/${todaySession.id}`);
  }

  // Fallback to first session or sessions list
  if (sessions.length > 0) {
    redirect(`/coach/attendance/${sessions[0].id}`);
  }

  redirect("/coach/sessions");
}

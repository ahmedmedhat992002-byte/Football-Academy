import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayers } from "@/lib/actions/players";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { getEvaluations } from "@/lib/actions/evaluations";
import { ParentDashboardView } from "@/components/parent/parent-dashboard-view";

export const dynamic = "force-dynamic";

export default async function ParentDashboardPage() {
  const user = await getCurrentUser();
  const parentId = user?.id;

  const [allPlayers, allSubscriptions, allEvaluations] = await Promise.all([
    getPlayers(),
    getSubscriptions(),
    getEvaluations(),
  ]);

  // Find parent's registered child
  const children = allPlayers.filter(
    (p) =>
      (parentId && p.parent_id === parentId) ||
      (user?.fullName && p.notes?.includes(user.fullName))
  );

  const activeChild = children[0] || (user?.fullName && user.childName ? {
    id: `player-${user.id || "temp"}`,
    full_name: user.childName,
    group_name: user.ageCategory ? `فئة ${user.ageCategory}` : "فريق الأبطال (U10)",
    status: "active" as const,
    birth_date: "2015-05-10",
    emergency_phone: user.phone || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: null,
    photo_url: null,
    group_id: null,
    parent_id: parentId || null,
  } : null);

  // Find child's subscription (active or pending approval)
  const childSub = activeChild
    ? allSubscriptions.find((s) => s.player_id === activeChild.id)
    : null;

  const isPendingApproval = childSub?.status === "pending_approval";
  const activeSub = childSub?.status === "active" ? childSub : null;

  const childEvals = activeChild
    ? allEvaluations.filter((e) => e.player_id === activeChild.id)
    : [];

  const isNewParent = !childSub;

  return (
    <ParentDashboardView
      user={user}
      child={activeChild}
      activeSubscription={activeSub}
      pendingSubscription={isPendingApproval ? childSub : null}
      isPendingApproval={isPendingApproval}
      isNewParent={isNewParent}
      evaluations={childEvals}
    />
  );
}

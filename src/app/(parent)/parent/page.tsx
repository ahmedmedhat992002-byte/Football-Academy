import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayers } from "@/lib/actions/players";
import { getSubscriptions, getPayments } from "@/lib/actions/subscriptions";
import { getEvaluations } from "@/lib/actions/evaluations";
import { ParentDashboardView } from "@/components/parent/parent-dashboard-view";

export const dynamic = "force-dynamic";

export default async function ParentDashboardPage() {
  const user = await getCurrentUser();
  const parentId = user?.id;

  const [allPlayers, allSubscriptions, allEvaluations, allPayments] = await Promise.all([
    getPlayers(),
    getSubscriptions(),
    getEvaluations(),
    getPayments(),
  ]);

  // Find parent's registered child
  const children = allPlayers.filter(
    (p) =>
      (parentId && p.parent_id === parentId) ||
      (user?.fullName && p.notes?.includes(user.fullName)) ||
      (user?.childName && p.full_name?.trim().toLowerCase() === user.childName.trim().toLowerCase())
  );

  const activeChild = children[0] || (user?.childName ? {
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

  // Match subscription by player ID OR child's name
  const childSub = activeChild
    ? allSubscriptions.find(
        (s) =>
          s.player_id === activeChild.id ||
          (activeChild.full_name && s.player_name?.trim().toLowerCase() === activeChild.full_name.trim().toLowerCase()) ||
          (user?.childName && s.player_name?.trim().toLowerCase() === user.childName.trim().toLowerCase())
      )
    : allSubscriptions.find(
        (s) => user?.childName && s.player_name?.trim().toLowerCase() === user.childName.trim().toLowerCase()
      );

  // Check if there is any payment made by this parent/child
  const parentPayment = allPayments.find(
    (p) =>
      (activeChild && p.player_id === activeChild.id) ||
      (activeChild && p.player_name?.trim().toLowerCase() === activeChild.full_name?.trim().toLowerCase()) ||
      (user?.childName && p.player_name?.trim().toLowerCase() === user.childName.trim().toLowerCase()) ||
      (user?.fullName && p.note?.includes(user.fullName))
  );

  // If subscription status is pending approval OR if user has pending subscription OR if payment exists while not active
  const isPendingApproval = Boolean(
    childSub?.status === "pending_approval" ||
    user?.hasPendingSubscription ||
    (parentPayment && (!childSub || childSub.status !== "active"))
  );

  const activeSub = childSub?.status === "active" ? childSub : null;

  const effectivePendingSub = isPendingApproval
    ? (childSub || {
        id: parentPayment?.subscription_id || `sub-${Date.now()}`,
        player_id: activeChild?.id || "temp",
        player_name: activeChild?.full_name || user?.childName || "اللاعب",
        group_name: activeChild?.group_name || "فريق التدريب (U10)",
        plan_id: "plan-monthly-001",
        plan_name: user?.pendingPlanName || parentPayment?.plan_name || "باقة التدريب المعتمدة",
        plan_price: parentPayment?.amount || 1200,
        period: "monthly",
        start_date: parentPayment?.paid_at || new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        status: "pending_approval" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    : null;

  const childEvals = activeChild
    ? allEvaluations.filter((e) => e.player_id === activeChild.id)
    : [];

  const isNewParent = !childSub && !isPendingApproval && !parentPayment;

  return (
    <ParentDashboardView
      user={user}
      child={activeChild}
      activeSubscription={activeSub}
      pendingSubscription={effectivePendingSub}
      isPendingApproval={isPendingApproval}
      isNewParent={isNewParent}
      evaluations={childEvals}
    />
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { getSessions } from "@/lib/actions/sessions";
import { getSubscriptions, getPayments, getFinancialSummary } from "@/lib/actions/subscriptions";
import { getEvaluations } from "@/lib/actions/evaluations";
import { getCoaches } from "@/lib/actions/coaches";

import { AdminAlertBanners } from "@/components/admin/dashboard/admin-alert-banners";
import { AdminHeroBanner } from "@/components/admin/dashboard/admin-hero-banner";
import { AdminStatCards } from "@/components/admin/dashboard/admin-stat-cards";
import { AdminModulesGrid } from "@/components/admin/dashboard/admin-modules-grid";
import { AdminFeatureTiles } from "@/components/admin/dashboard/admin-feature-tiles";
import { AdminRecentActivity } from "@/components/admin/dashboard/admin-recent-activity";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const userName = user?.fullName || "مدير الأكاديمية";

  // Fetch all data in parallel
  const [
    players,
    groups,
    sessions,
    subscriptions,
    payments,
    evaluations,
    financialSummary,
    coaches,
  ] = await Promise.all([
    getPlayers(),
    getGroups(),
    getSessions(),
    getSubscriptions(),
    getPayments(),
    getEvaluations(),
    getFinancialSummary(),
    getCoaches(),
  ]);

  // Compute stats
  const totalPlayers = players.length;
  const totalGroups = groups.length;
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.attendance_taken).length;
  const totalRevenue = financialSummary.totalCollectedThisMonth;
  const overdueSubscriptions = subscriptions.filter((s) => s.status === "overdue").length;
  const pendingApprovalsCount = subscriptions.filter((s) => s.status === "pending_approval").length;
  const pendingCoachesCount = coaches.filter((c) => c.status === "pending_approval").length;
  const totalEvaluations = evaluations.length;

  // Recent activity from real data
  const recentPayments = payments.slice(0, 2);
  const recentEvaluations = evaluations.slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Pending Coach Approval & Subscription Approval Alerts */}
      <AdminAlertBanners
        pendingCoachesCount={pendingCoachesCount}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Hero Banner with Stadium Background and Motivational Side Card */}
      <AdminHeroBanner userName={userName} />

      {/* 4 Primary KPI Metric Cards */}
      <AdminStatCards
        totalPlayers={totalPlayers}
        totalGroups={totalGroups}
        totalSessions={totalSessions}
        completedSessions={completedSessions}
        totalRevenue={totalRevenue}
        paymentCount={payments.length}
        overdueSubscriptions={overdueSubscriptions}
      />

      {/* Main Grid: Modules & Navigation Tiles (8 cols) + Recent Activity Stream (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <AdminModulesGrid
            totalPlayers={totalPlayers}
            totalSessions={totalSessions}
            totalEvaluations={totalEvaluations}
            subscriptionCount={subscriptions.length}
          />

          <AdminFeatureTiles
            completedSessions={completedSessions}
            totalSessions={totalSessions}
            totalEvaluations={totalEvaluations}
          />
        </div>

        <AdminRecentActivity
          recentPayments={recentPayments}
          recentEvaluations={recentEvaluations}
          totalPlayers={totalPlayers}
          totalGroups={totalGroups}
        />
      </div>
    </div>
  );
}

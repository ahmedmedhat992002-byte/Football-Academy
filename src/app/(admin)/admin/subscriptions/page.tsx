import React from "react";
import {
  getSubscriptions,
  getSubscriptionPlans,
} from "@/lib/actions/subscriptions";
import { getPlayers } from "@/lib/actions/players";
import { SubscriptionsManagerView } from "@/components/subscriptions/subscriptions-manager-view";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const [subscriptions, plans, players] = await Promise.all([
    getSubscriptions(),
    getSubscriptionPlans(),
    getPlayers(),
  ]);

  return (
    <SubscriptionsManagerView
      initialSubscriptions={subscriptions}
      initialPlans={plans}
      players={players}
    />
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { getCoaches } from "@/lib/actions/coaches";
import { getSubscriptionPlans } from "@/lib/actions/plans";
import { LandingPageView } from "@/components/landing/landing-page-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIFA FC ACADEMY | صناع الأبطال ومصنع النجوم الكروية",
  description: "أكاديمية FIFA FC ACADEMY — الأكاديمية التدريبية الأولى لتطوير مهارات الناشئين والبراعم بإشراف نخبة من المدربين المعتمدين ومنظومة رقمية متكاملة.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, players, groups, coaches, plans] = await Promise.all([
    getCurrentUser(),
    getPlayers(),
    getGroups(),
    getCoaches(),
    getSubscriptionPlans(),
  ]);

  return (
    <LandingPageView
      currentUser={user}
      playersCount={players.length}
      groups={groups}
      coaches={coaches}
      plans={plans}
    />
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayers } from "@/lib/actions/players";
import { CheckoutView } from "@/components/checkout/checkout-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بوابة السداد والاشتراك | FIFA FC ACADEMY",
  description: "سداد الرسوم وتفعيل باقة التدريب المعتمدة للاعب بأمان وسهولة في FIFA FC ACADEMY",
};

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: Promise<{
    plan?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { plan } = await searchParams;
  const user = await getCurrentUser();
  const allPlayers = await getPlayers();

  const userChildren = allPlayers.filter(
    (p) => user?.id && p.parent_id === user.id
  );

  const validPlan =
    plan === "monthly" || plan === "quarterly" || plan === "yearly"
      ? plan
      : "quarterly";

  return (
    <div className="min-h-screen bg-[#070e14] text-slate-100">
      <CheckoutView
        initialPlanId={validPlan}
        currentUser={user}
        childrenList={userChildren}
      />
    </div>
  );
}

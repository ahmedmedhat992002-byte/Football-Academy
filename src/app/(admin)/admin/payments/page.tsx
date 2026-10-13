import React from "react";
import {
  getPayments,
  getSubscriptions,
  getFinancialSummary,
} from "@/lib/actions/subscriptions";
import { PaymentsManagerView } from "@/components/payments/payments-manager-view";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const [payments, subscriptions, financialSummary] = await Promise.all([
    getPayments(),
    getSubscriptions(),
    getFinancialSummary(),
  ]);

  return (
    <PaymentsManagerView
      initialPayments={payments}
      subscriptions={subscriptions}
      financialSummary={financialSummary}
    />
  );
}

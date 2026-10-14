"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { paymentSchema, type PaymentInput } from "@/lib/validations/subscriptions";
import {
  INITIAL_PAYMENTS,
  INITIAL_SUBSCRIPTIONS,
  type PaymentRecord,
  type PlayerSubscription,
} from "@/lib/data/academy-store";
import { getPlayers } from "@/lib/actions/players";

const PAYMENTS_STORAGE_COOKIE = "academy_custom_payments";
const SUBS_STORAGE_COOKIE = "academy_custom_subscriptions";

export async function getStoredPayments(): Promise<PaymentRecord[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PAYMENTS_STORAGE_COOKIE)?.value;
  if (!raw) return [];
  try {
    const list: PaymentRecord[] = JSON.parse(decodeURIComponent(raw));
    return (Array.isArray(list) ? list : []).filter(
      (p) => !p.id?.startsWith("mock-") && !p.id?.startsWith("demo-") && !p.player_name?.includes("الشناوي")
    );
  } catch {
    try {
      const list: PaymentRecord[] = JSON.parse(raw);
      return (Array.isArray(list) ? list : []).filter(
        (p) => !p.id?.startsWith("mock-") && !p.id?.startsWith("demo-") && !p.player_name?.includes("الشناوي")
      );
    } catch {
      return [];
    }
  }
}

export async function saveStoredPayments(payments: PaymentRecord[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    PAYMENTS_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(payments)),
    { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }
  );
}

async function getLocalSubscriptions(): Promise<PlayerSubscription[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SUBS_STORAGE_COOKIE)?.value;
  if (!raw) return INITIAL_SUBSCRIPTIONS;
  try {
    const list: PlayerSubscription[] = JSON.parse(decodeURIComponent(raw));
    const all = [...(Array.isArray(list) ? list : []), ...INITIAL_SUBSCRIPTIONS];
    return Array.from(new Map(all.map((s) => [s.id, s])).values());
  } catch {
    return INITIAL_SUBSCRIPTIONS;
  }
}

async function activateLocalSubscription(subscriptionId: string): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SUBS_STORAGE_COOKIE)?.value;
  if (!raw) return;
  try {
    const list: PlayerSubscription[] = JSON.parse(decodeURIComponent(raw));
    const idx = list.findIndex((s) => s.id === subscriptionId);
    if (idx >= 0) {
      list[idx].status = "active";
      list[idx].updated_at = new Date().toISOString();
      cookieStore.set(SUBS_STORAGE_COOKIE, encodeURIComponent(JSON.stringify(list)), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  } catch {
    // ignore
  }
}

export async function getPayments(filters?: {
  playerId?: string;
  subscriptionId?: string;
}): Promise<PaymentRecord[]> {
  const [subscriptions, players] = await Promise.all([
    getLocalSubscriptions(),
    getPlayers(),
  ]);
  const subMap = new Map(subscriptions.map((s) => [s.id, s]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  try {
    const supabase = await createClient();
    let query = (supabase.from("payments") as any)
      .select("*, subscription:subscriptions!subscription_id(player_id, plan_id)")
      .order("paid_at", { ascending: false });

    if (filters?.subscriptionId) {
      query = query.eq("subscription_id", filters.subscriptionId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        ...p,
        player_id: p.subscription?.player_id,
        player_name:
          playerMap.get(p.subscription?.player_id)?.full_name || "لاعب",
      }));
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredPayments();
  const all = [...custom, ...INITIAL_PAYMENTS];
  const unique = Array.from(new Map(all.map((p) => [p.id, p])).values());

  const enriched = unique.map((p) => {
    const sub = subMap.get(p.subscription_id);
    return {
      ...p,
      player_id: p.player_id || sub?.player_id,
      player_name: p.player_name || sub?.player_name || "لاعب",
      plan_name: p.plan_name || sub?.plan_name || "الاشتراك الشهري",
    };
  });

  return enriched.filter((p) => {
    if (filters?.playerId && p.player_id !== filters.playerId) return false;
    if (filters?.subscriptionId && p.subscription_id !== filters.subscriptionId)
      return false;
    return true;
  });
}

export async function savePayment(
  input: PaymentInput
): Promise<{ success: boolean; error?: string; payment?: PaymentRecord }> {
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات السداد غير صحيحة",
    };
  }

  const { subscription_id, amount, method, paid_at, receipt_no, note } =
    parsed.data;

  const subscriptions = await getLocalSubscriptions();
  const sub = subscriptions.find((s) => s.id === subscription_id);

  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("payments") as any)
      .insert({
        subscription_id,
        amount,
        method,
        paid_at,
        receipt_no,
        note: note || null,
      })
      .select()
      .single();

    if (!error && data) {
      // If payment successful, update subscription status to active
      await (supabase.from("subscriptions") as any)
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("id", subscription_id);

      revalidatePath("/admin/payments");
      revalidatePath("/admin/subscriptions");
      revalidatePath("/parent");
      return { success: true, payment: data };
    }
  } catch {
    // Fallback
  }

  const customPayments = await getStoredPayments();
  const newPayment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    subscription_id,
    player_id: sub?.player_id,
    player_name: sub?.player_name || "لاعب",
    plan_name: sub?.plan_name || "الاشتراك الشهري",
    amount,
    method,
    paid_at,
    receipt_no,
    note: note || null,
    created_at: new Date().toISOString(),
  };

  customPayments.unshift(newPayment);
  await saveStoredPayments(customPayments);

  // Automatically activate subscription status to 'active' in local storage
  await activateLocalSubscription(subscription_id);

  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/parent");

  return { success: true, payment: newPayment };
}

export async function getFinancialSummary(): Promise<{
  totalCollectedThisMonth: number;
  totalCollectedAllTime: number;
  activeSubscriptionsCount: number;
  overdueSubscriptionsCount: number;
  expiredSubscriptionsCount: number;
  pendingApprovalSubscriptionsCount: number;
}> {
  const [payments, subscriptions] = await Promise.all([
    getPayments(),
    getLocalSubscriptions(),
  ]);

  const currentYearMonth = new Date().toISOString().substring(0, 7); // "2026-10"

  const totalCollectedThisMonth = payments
    .filter((p) => p.paid_at.startsWith(currentYearMonth))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalCollectedAllTime = payments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const activeSubscriptionsCount = subscriptions.filter(
    (s) => s.status === "active"
  ).length;

  const overdueSubscriptionsCount = subscriptions.filter(
    (s) => s.status === "overdue"
  ).length;

  const expiredSubscriptionsCount = subscriptions.filter(
    (s) => s.status === "expired"
  ).length;

  const pendingApprovalSubscriptionsCount = subscriptions.filter(
    (s) => s.status === "pending_approval"
  ).length;

  return {
    totalCollectedThisMonth,
    totalCollectedAllTime,
    activeSubscriptionsCount,
    overdueSubscriptionsCount,
    expiredSubscriptionsCount,
    pendingApprovalSubscriptionsCount,
  };
}

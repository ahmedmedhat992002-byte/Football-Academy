"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  subscriptionPlanSchema,
  playerSubscriptionSchema,
  paymentSchema,
  type SubscriptionPlanInput,
  type PlayerSubscriptionInput,
  type PaymentInput,
} from "@/lib/validations/subscriptions";
import {
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PAYMENTS,
  type SubscriptionPlan,
  type PlayerSubscription,
  type PaymentRecord,
} from "@/lib/data/academy-store";
import { getPlayers } from "@/lib/actions/players";
import { addNotification } from "@/lib/actions/notifications";

const PLANS_STORAGE_COOKIE = "academy_custom_plans";
const SUBS_STORAGE_COOKIE = "academy_custom_subscriptions";
const PAYMENTS_STORAGE_COOKIE = "academy_custom_payments";

// --- Plans Storage Helpers ---
async function getStoredPlans(): Promise<SubscriptionPlan[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PLANS_STORAGE_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}

async function saveStoredPlans(plans: SubscriptionPlan[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    PLANS_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(plans)),
    { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }
  );
}

// --- Subscriptions Storage Helpers ---
async function getStoredSubscriptions(): Promise<PlayerSubscription[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SUBS_STORAGE_COOKIE)?.value;
  if (!raw) return [];
  try {
    const list: PlayerSubscription[] = JSON.parse(decodeURIComponent(raw));
    return (Array.isArray(list) ? list : []).filter(
      (s) => !s.id?.startsWith("mock-") && !s.id?.startsWith("demo-") && !s.player_name?.includes("الشناوي")
    );
  } catch {
    try {
      const list: PlayerSubscription[] = JSON.parse(raw);
      return (Array.isArray(list) ? list : []).filter(
        (s) => !s.id?.startsWith("mock-") && !s.id?.startsWith("demo-") && !s.player_name?.includes("الشناوي")
      );
    } catch {
      return [];
    }
  }
}

async function saveStoredSubscriptions(subs: PlayerSubscription[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SUBS_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(subs)),
    { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }
  );
}

// --- Payments Storage Helpers ---
async function getStoredPayments(): Promise<PaymentRecord[]> {
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

async function saveStoredPayments(payments: PaymentRecord[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    PAYMENTS_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(payments)),
    { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }
  );
}

// =========================================================================
// PLANS ACTIONS
// =========================================================================

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("subscription_plans") as any)
      .select("*")
      .order("price", { ascending: true });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredPlans();
  const all = [...custom, ...INITIAL_PLANS];
  return Array.from(new Map(all.map((p) => [p.id, p])).values());
}

export async function saveSubscriptionPlan(
  input: SubscriptionPlanInput,
  planId?: string
): Promise<{ success: boolean; error?: string; plan?: SubscriptionPlan }> {
  const parsed = subscriptionPlanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات الخطة غير صحيحة",
    };
  }

  const { name, price, period } = parsed.data;

  try {
    const supabase = await createClient();
    if (planId) {
      const { data, error } = await (supabase.from("subscription_plans") as any)
        .update({ name, price, period, updated_at: new Date().toISOString() })
        .eq("id", planId)
        .select()
        .single();
      if (!error && data) {
        revalidatePath("/admin/subscriptions");
        return { success: true, plan: data };
      }
    } else {
      const { data, error } = await (supabase.from("subscription_plans") as any)
        .insert({ name, price, period })
        .select()
        .single();
      if (!error && data) {
        revalidatePath("/admin/subscriptions");
        return { success: true, plan: data };
      }
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredPlans();
  let updatedPlan: SubscriptionPlan;

  if (planId) {
    const idx = custom.findIndex((p) => p.id === planId);
    updatedPlan = {
      id: planId,
      name,
      price,
      period,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (idx >= 0) custom[idx] = updatedPlan;
    else custom.unshift(updatedPlan);
  } else {
    updatedPlan = {
      id: `plan-${Date.now()}`,
      name,
      price,
      period,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    custom.unshift(updatedPlan);
  }

  await saveStoredPlans(custom);
  revalidatePath("/admin/subscriptions");
  return { success: true, plan: updatedPlan };
}

export async function deleteSubscriptionPlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase.from("subscription_plans") as any)
      .delete()
      .eq("id", planId);
    if (!error) {
      revalidatePath("/admin/subscriptions");
      return { success: true };
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredPlans();
  await saveStoredPlans(custom.filter((p) => p.id !== planId));
  revalidatePath("/admin/subscriptions");
  return { success: true };
}

// =========================================================================
// SUBSCRIPTIONS ACTIONS
// =========================================================================

export async function getSubscriptions(filters?: {
  playerId?: string;
  status?: string;
}): Promise<PlayerSubscription[]> {
  const [players, plans] = await Promise.all([getPlayers(), getSubscriptionPlans()]);
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const planMap = new Map(plans.map((p) => [p.id, p]));

  try {
    const supabase = await createClient();
    let query = (supabase.from("subscriptions") as any)
      .select("*, player:players!player_id(full_name, group_id), plan:subscription_plans!plan_id(name, price, period)")
      .order("start_date", { ascending: false });

    if (filters?.playerId) {
      query = query.eq("player_id", filters.playerId);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((s: any) => ({
        ...s,
        player_name: s.player?.full_name || "لاعب غير محدد",
        plan_name: s.plan?.name || "خطة غير محددة",
        plan_price: s.plan?.price || 0,
        period: s.plan?.period || "monthly",
      }));
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredSubscriptions();
  const all = [...custom, ...INITIAL_SUBSCRIPTIONS];
  const unique = Array.from(new Map(all.map((s) => [s.id, s])).values());

  const enriched = unique.map((s) => {
    const player = playerMap.get(s.player_id);
    const plan = planMap.get(s.plan_id);
    return {
      ...s,
      player_name: player?.full_name || s.player_name || "لاعب",
      group_name: player?.group_name || s.group_name || "الفريق",
      plan_name: plan?.name || s.plan_name || "الاشتراك الشهري",
      plan_price: plan?.price || s.plan_price || 1200,
      period: plan?.period || s.period || "monthly",
    };
  });

  return enriched.filter((s) => {
    if (filters?.playerId && s.player_id !== filters.playerId) return false;
    if (filters?.status && s.status !== filters.status) return false;
    return true;
  });
}

export async function saveSubscription(
  input: PlayerSubscriptionInput,
  subscriptionId?: string
): Promise<{ success: boolean; error?: string; subscription?: PlayerSubscription }> {
  const parsed = playerSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات الاشتراك غير صحيحة",
    };
  }

  const { player_id, plan_id, start_date, end_date, status } = parsed.data;
  const [players, plans] = await Promise.all([getPlayers(), getSubscriptionPlans()]);
  const player = players.find((p) => p.id === player_id);
  const plan = plans.find((p) => p.id === plan_id);

  try {
    const supabase = await createClient();
    if (subscriptionId) {
      const { data, error } = await (supabase.from("subscriptions") as any)
        .update({
          player_id,
          plan_id,
          start_date,
          end_date,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId)
        .select()
        .single();
      if (!error && data) {
        revalidatePath("/admin/subscriptions");
        revalidatePath("/parent");
        return { success: true, subscription: data };
      }
    } else {
      const { data, error } = await (supabase.from("subscriptions") as any)
        .insert({ player_id, plan_id, start_date, end_date, status })
        .select()
        .single();
      if (!error && data) {
        revalidatePath("/admin/subscriptions");
        revalidatePath("/parent");
        return { success: true, subscription: data };
      }
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredSubscriptions();
  let updatedSub: PlayerSubscription;

  if (subscriptionId) {
    const idx = custom.findIndex((s) => s.id === subscriptionId);
    updatedSub = {
      id: subscriptionId,
      player_id,
      player_name: player?.full_name || "لاعب",
      group_name: player?.group_name || "الفريق",
      plan_id,
      plan_name: plan?.name || "الاشتراك الشهري",
      plan_price: plan?.price || 1200,
      period: plan?.period || "monthly",
      start_date,
      end_date,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (idx >= 0) custom[idx] = updatedSub;
    else custom.unshift(updatedSub);
  } else {
    updatedSub = {
      id: `sub-${Date.now()}`,
      player_id,
      player_name: player?.full_name || "لاعب",
      group_name: player?.group_name || "الفريق",
      plan_id,
      plan_name: plan?.name || "الاشتراك الشهري",
      plan_price: plan?.price || 1200,
      period: plan?.period || "monthly",
      start_date,
      end_date,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    custom.unshift(updatedSub);
  }

  await saveStoredSubscriptions(custom);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/parent");
  return { success: true, subscription: updatedSub };
}

// =========================================================================
// PAYMENTS ACTIONS
// =========================================================================

export async function getPayments(filters?: {
  playerId?: string;
  subscriptionId?: string;
}): Promise<PaymentRecord[]> {
  const [subscriptions, players] = await Promise.all([
    getSubscriptions(),
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

  const subscriptions = await getSubscriptions();
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

  // Automatically renew/activate subscription status to 'active' in local storage
  if (sub) {
    await saveSubscription(
      {
        player_id: sub.player_id,
        plan_id: sub.plan_id,
        start_date: sub.start_date,
        end_date: sub.end_date,
        status: "active",
      },
      sub.id
    );
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/parent");

  return { success: true, payment: newPayment };
}

// Financial Summary
export async function approveSubscriptionAction(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    await (supabase.from("subscriptions") as any)
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", subscriptionId);
  } catch {
    // fallback
  }

  const custom = await getStoredSubscriptions();
  const subIndex = custom.findIndex((s) => s.id === subscriptionId);
  let playerName = "اللاعب";
  if (subIndex >= 0) {
    custom[subIndex].status = "active";
    playerName = custom[subIndex].player_name || "اللاعب";
    await saveStoredSubscriptions(custom);
  }

  // Send congratulatory activation notification to parent
  await addNotification({
    title: "تم اعتماد اشتراكك وتفعيل النظام! 🎉",
    description: `قام مدير الأكاديمية بمراجعة واعتماد اشتراك اللاعب (${playerName}) بنجاح. تم فتح المنظومة الإلكترونية بالكامل لك.`,
    type: "payment",
    href: "/parent",
    targetRole: "parent",
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin");
  revalidatePath("/parent");
  revalidatePath("/parent/payments");
  revalidatePath("/parent/children");
  revalidatePath("/parent/sessions");
  revalidatePath("/parent/report");

  return { success: true };
}

export async function rejectSubscriptionAction(
  subscriptionId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    await (supabase.from("subscriptions") as any)
      .update({ status: "overdue", updated_at: new Date().toISOString() })
      .eq("id", subscriptionId);
  } catch {
    // fallback
  }

  const custom = await getStoredSubscriptions();
  const subIndex = custom.findIndex((s) => s.id === subscriptionId);
  let playerName = "اللاعب";
  if (subIndex >= 0) {
    custom[subIndex].status = "overdue";
    playerName = custom[subIndex].player_name || "اللاعب";
    await saveStoredSubscriptions(custom);
  }

  await addNotification({
    title: "تنبيه بخصوص التحويل ⚠️",
    description: `يرجى مراجعة إدارة الأكاديمية بخصوص تحويل اشتراك اللاعب (${playerName}): ${
      reason || "يرجى مراجعة وتأكيد عملية التحويل"
    }.`,
    type: "payment",
    href: "/parent/payments",
    targetRole: "parent",
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin");
  revalidatePath("/parent");
  revalidatePath("/parent/payments");

  return { success: true };
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
    getSubscriptions(),
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

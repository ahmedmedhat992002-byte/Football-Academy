"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  playerSubscriptionSchema,
  type PlayerSubscriptionInput,
  type SubscriptionPlanInput,
  type PaymentInput,
} from "@/lib/validations/subscriptions";
import {
  INITIAL_SUBSCRIPTIONS,
  type PlayerSubscription,
  type SubscriptionPlan,
  type PaymentRecord,
} from "@/lib/data/academy-store";
import { getPlayers } from "@/lib/actions/players";
import { addNotification } from "@/lib/actions/notifications";
import * as plansModule from "./plans";
import * as paymentsModule from "./payments";
import {
  getSharedSubscriptions,
  saveSharedSubscription,
  getSharedRegisteredUsers,
} from "@/lib/data/shared-store";

const isUUID = (str?: string | null): boolean =>
  !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Re-export explicit async functions for full Next.js Server Actions compiler compatibility
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return plansModule.getSubscriptionPlans();
}

export async function saveSubscriptionPlan(
  input: SubscriptionPlanInput,
  planId?: string
): Promise<{ success: boolean; error?: string; plan?: SubscriptionPlan }> {
  return plansModule.saveSubscriptionPlan(input, planId);
}

export async function deleteSubscriptionPlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  return plansModule.deleteSubscriptionPlan(planId);
}

export async function getStoredPlans(): Promise<SubscriptionPlan[]> {
  return plansModule.getStoredPlans();
}

export async function saveStoredPlans(plans: SubscriptionPlan[]): Promise<void> {
  return plansModule.saveStoredPlans(plans);
}

export async function getPayments(filters?: {
  playerId?: string;
  subscriptionId?: string;
}): Promise<PaymentRecord[]> {
  return paymentsModule.getPayments(filters);
}

export async function savePayment(
  input: PaymentInput
): Promise<{ success: boolean; error?: string; payment?: PaymentRecord }> {
  return paymentsModule.savePayment(input);
}

export async function getFinancialSummary(): Promise<{
  totalCollectedThisMonth: number;
  totalCollectedAllTime: number;
  activeSubscriptionsCount: number;
  overdueSubscriptionsCount: number;
  expiredSubscriptionsCount: number;
  pendingApprovalSubscriptionsCount: number;
}> {
  return paymentsModule.getFinancialSummary();
}

export async function getStoredPayments(): Promise<PaymentRecord[]> {
  return paymentsModule.getStoredPayments();
}

export async function saveStoredPayments(payments: PaymentRecord[]): Promise<void> {
  return paymentsModule.saveStoredPayments(payments);
}

const SUBS_STORAGE_COOKIE = "academy_custom_subscriptions";

// --- Subscriptions Storage Helpers ---
export async function getStoredSubscriptions(): Promise<PlayerSubscription[]> {
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

export async function saveStoredSubscriptions(subs: PlayerSubscription[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SUBS_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(subs)),
    { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }
  );
}

// =========================================================================
// SUBSCRIPTIONS ACTIONS
// =========================================================================

export async function getSubscriptions(filters?: {
  playerId?: string;
  status?: string;
}): Promise<PlayerSubscription[]> {
  const [players, plans] = await Promise.all([getPlayers(), plansModule.getSubscriptionPlans()]);
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
  const shared = getSharedSubscriptions();
  const all = [...shared, ...custom, ...INITIAL_SUBSCRIPTIONS];
  const unique = Array.from(new Map(all.map((s) => [s.id, s])).values());

  // Automatically include newly registered players awaiting admin approval
  try {
    const { getRegisteredUsers } = await import("@/lib/auth/actions");
    const cookieRegistered = await getRegisteredUsers();
    const sharedRegistered = getSharedRegisteredUsers();
    const allRegistered = [...sharedRegistered, ...cookieRegistered];

    for (const reg of allRegistered) {
      if (!reg.childName) continue;
      const alreadyHas = unique.some(
        (s) =>
          s.player_name?.trim().toLowerCase() === reg.childName?.trim().toLowerCase() ||
          s.id === `sub-reg-${reg.id}`
      );
      if (!alreadyHas) {
        unique.unshift({
          id: `sub-reg-${reg.id}`,
          player_id: `player-${reg.id}`,
          player_name: reg.childName,
          group_name: reg.ageCategory ? `فريق (${reg.ageCategory})` : "فريق الأبطال (U10)",
          plan_id: "plan-monthly-001",
          plan_name: "الاشتراك الشهري الأساسي",
          plan_price: 1200,
          period: "monthly",
          start_date: reg.createdAt ? reg.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          status: "pending_approval",
          created_at: reg.createdAt || new Date().toISOString(),
          updated_at: reg.createdAt || new Date().toISOString(),
        });
      }
    }
  } catch {
    // Ignore import failure
  }

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
  const [players, plans] = await Promise.all([getPlayers(), plansModule.getSubscriptionPlans()]);
  const player = players.find((p) => p.id === player_id);
  const plan = plans.find((p) => p.id === plan_id);

  const validPlayerId = isUUID(player_id) ? player_id : null;
  const validPlanId = isUUID(plan_id) ? plan_id : null;

  try {
    const supabase = await createClient();
    if (subscriptionId) {
      const { data, error } = await (supabase.from("subscriptions") as any)
        .update({
          player_id: validPlayerId,
          plan_id: validPlanId,
          start_date,
          end_date,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId)
        .select()
        .single();
      if (!error && data) {
        const enriched: PlayerSubscription = {
          ...data,
          player_name: player?.full_name || "لاعب",
          group_name: player?.group_name || "الفريق",
          plan_name: plan?.name || "الاشتراك الشهري",
          plan_price: plan?.price || 1200,
          period: plan?.period || "monthly",
        };
        saveSharedSubscription(enriched);
        revalidatePath("/admin/subscriptions");
        revalidatePath("/parent");
        return { success: true, subscription: enriched };
      }
    } else {
      const { data, error } = await (supabase.from("subscriptions") as any)
        .insert({
          player_id: validPlayerId,
          plan_id: validPlanId,
          start_date,
          end_date,
          status,
        })
        .select()
        .single();
      if (!error && data) {
        const enriched: PlayerSubscription = {
          ...data,
          player_name: player?.full_name || "لاعب",
          group_name: player?.group_name || "الفريق",
          plan_name: plan?.name || "الاشتراك الشهري",
          plan_price: plan?.price || 1200,
          period: plan?.period || "monthly",
        };
        saveSharedSubscription(enriched);
        revalidatePath("/admin/subscriptions");
        revalidatePath("/parent");
        return { success: true, subscription: enriched };
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

  // Save to shared store across all sessions & browsers
  saveSharedSubscription(updatedSub);
  await saveStoredSubscriptions(custom);

  revalidatePath("/admin/subscriptions");
  revalidatePath("/parent");
  return { success: true, subscription: updatedSub };
}

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
  } else {
    const all = await getSubscriptions();
    const matched = all.find((s) => s.id === subscriptionId);
    if (matched) {
      playerName = matched.player_name || "اللاعب";
      custom.unshift({ ...matched, status: "active", updated_at: new Date().toISOString() });
    }
  }
  await saveStoredSubscriptions(custom);

  // Update in shared store
  const shared = getSharedSubscriptions();
  const sharedIdx = shared.findIndex((s) => s.id === subscriptionId);
  if (sharedIdx >= 0) {
    shared[sharedIdx].status = "active";
    shared[sharedIdx].updated_at = new Date().toISOString();
    saveSharedSubscription(shared[sharedIdx]);
  } else {
    const all = await getSubscriptions();
    const matched = all.find((s) => s.id === subscriptionId);
    if (matched) {
      saveSharedSubscription({ ...matched, status: "active", updated_at: new Date().toISOString() });
    }
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

  const shared = getSharedSubscriptions();
  const sharedIdx = shared.findIndex((s) => s.id === subscriptionId);
  if (sharedIdx >= 0) {
    shared[sharedIdx].status = "overdue";
    shared[sharedIdx].updated_at = new Date().toISOString();
    saveSharedSubscription(shared[sharedIdx]);
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

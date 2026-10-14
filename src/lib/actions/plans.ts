"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  subscriptionPlanSchema,
  type SubscriptionPlanInput,
} from "@/lib/validations/subscriptions";
import {
  INITIAL_PLANS,
  type SubscriptionPlan,
} from "@/lib/data/academy-store";

const PLANS_STORAGE_COOKIE = "academy_custom_plans";

export async function getStoredPlans(): Promise<SubscriptionPlan[]> {
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

export async function saveStoredPlans(plans: SubscriptionPlan[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    PLANS_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(plans)),
    { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }
  );
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscription_plans")
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
      const { data, error } = await supabase
        .from("subscription_plans")
        .update({ name, price, period, updated_at: new Date().toISOString() })
        .eq("id", planId)
        .select()
        .single();
      if (!error && data) {
        revalidatePath("/admin/subscriptions");
        return { success: true, plan: data };
      }
    } else {
      const { data, error } = await supabase
        .from("subscription_plans")
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
    const { error } = await supabase
      .from("subscription_plans")
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

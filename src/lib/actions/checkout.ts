"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayers, savePlayer } from "@/lib/actions/players";
import {
  getSubscriptionPlans,
  saveSubscription,
  savePayment,
} from "@/lib/actions/subscriptions";
import { addNotification } from "@/lib/actions/notifications";
import type { PaymentMethod } from "@/types/database.types";

export interface CheckoutInput {
  parentName: string;
  phone: string;
  email?: string;
  childName: string;
  childId?: string;
  ageCategory?: string;
  planId: "monthly" | "quarterly" | "yearly";
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  receipt?: {
    receiptNo: string;
    paidAt: string;
    amount: number;
    planName: string;
    parentName: string;
    childName: string;
    method: PaymentMethod;
    transactionRef?: string;
    period: string;
    endDate: string;
  };
}

export async function processCheckoutAction(input: CheckoutInput): Promise<CheckoutResult> {
  const {
    parentName,
    phone,
    email,
    childName,
    childId,
    ageCategory = "U10",
    planId,
    paymentMethod,
    transactionRef,
  } = input;

  if (!parentName || !childName || !phone) {
    return {
      success: false,
      error: "يرجى استكمال جميع بيانات ولي الأمر واللاعب",
    };
  }

  const currentUser = await getCurrentUser();
  const parentId = currentUser?.id || `parent-${Date.now()}`;

  // 1. Resolve or Create Player
  let resolvedPlayerId = childId;
  const existingPlayers = await getPlayers();

  if (!resolvedPlayerId) {
    const matched = existingPlayers.find(
      (p) =>
        p.full_name.trim().toLowerCase() === childName.trim().toLowerCase() &&
        (p.parent_id === parentId || p.emergency_phone === phone)
    );

    if (matched) {
      resolvedPlayerId = matched.id;
    } else {
      // Create new player
      const groupTargetId =
        ageCategory === "U8"
          ? "group-u8-004"
          : ageCategory === "U10"
          ? "group-u10-001"
          : ageCategory === "U12"
          ? "group-u12-002"
          : "group-u14-003";

      const saveRes = await savePlayer({
        full_name: childName,
        birth_date: "2015-01-01",
        group_id: groupTargetId,
        parent_id: parentId,
        status: "active",
        emergency_phone: phone,
        notes: `مسجل عبر بوابة الدفع — ولي الأمر: ${parentName}`,
      });

      resolvedPlayerId = saveRes.player?.id || `player-${Date.now()}`;
    }
  }

  // 2. Resolve Plan details
  const planInfo = {
    monthly: {
      id: "plan-monthly-001",
      name: "الاشتراك الشهري الأساسي",
      price: 1200,
      days: 30,
      period: "شهر واحد",
    },
    quarterly: {
      id: "plan-quarterly-002",
      name: "باقة التدريب الفصلي (3 أشهر)",
      price: 3200,
      days: 90,
      period: "3 أشهر",
    },
    yearly: {
      id: "plan-yearly-003",
      name: "العضوية السنوية الذهبية (12 شهر)",
      price: 11000,
      days: 365,
      period: "سنة كاملة",
    },
  }[planId] || {
    id: "plan-monthly-001",
    name: "الاشتراك الشهري الأساسي",
    price: 1200,
    days: 30,
    period: "شهر واحد",
  };

  const today = new Date();
  const startDateStr = today.toISOString().split("T")[0];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + planInfo.days);
  const endDateStr = endDate.toISOString().split("T")[0];

  // 3. Save Pending Subscription (Awaiting Admin Approval)
  const subRes = await saveSubscription({
    player_id: resolvedPlayerId,
    plan_id: planInfo.id,
    start_date: startDateStr,
    end_date: endDateStr,
    status: "pending_approval",
  });

  const subscriptionId = subRes.subscription?.id || `sub-${Date.now()}`;

  // 4. Save Payment Record & Receipt
  const receiptNo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const paidAt = startDateStr;

  await savePayment({
    subscription_id: subscriptionId,
    amount: planInfo.price,
    method: paymentMethod,
    receipt_no: receiptNo,
    paid_at: paidAt,
    note: `سداد اشتراك ${planInfo.name} — بانتظار اعتماد المدير — المعاملة: ${transactionRef || "قيد التحقق"}`,
  });

  // 5. Trigger Live Notification to Admin for Approval
  await addNotification({
    title: "طلب اشتراك وسداد بانتظار اعتمادك! 🔔",
    description: `سدد أ. ${parentName} مبلغ ${planInfo.price} ج.م لباقة ${planInfo.name} للاعب ${childName} عبر ${
      paymentMethod === "instapay"
        ? `إنستاباي (المرجع: ${transactionRef || "قيد المراجعة"})`
        : paymentMethod === "cash"
        ? "الدفع نقداً بالملعب"
        : "بطاقة بنكية"
    } — يرجى مراجعة وتأكيد اعتماد الاشتراك لتفعيل حساب ولي الأمر.`,
    type: "payment",
    href: "/admin/subscriptions",
    targetRole: "admin",
  });

  // 6. Set parent session cookie so they can immediately access their child's portal
  const cookieStore = await cookies();
  if (!currentUser) {
    cookieStore.set(
      "academy_demo_user",
      JSON.stringify({
        id: parentId,
        email: email || `${phone}@academy.com`,
        fullName: parentName,
        phone,
        role: "parent",
        childName,
      }),
      {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      }
    );
  }

  revalidatePath("/parent");
  revalidatePath("/parent/payments");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin");

  return {
    success: true,
    receipt: {
      receiptNo,
      paidAt,
      amount: planInfo.price,
      planName: planInfo.name,
      parentName,
      childName,
      method: paymentMethod,
      transactionRef: transactionRef || "مكتمل",
      period: planInfo.period,
      endDate: endDateStr,
    },
  };
}

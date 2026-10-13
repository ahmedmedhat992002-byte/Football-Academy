import { z } from "zod";

export const planPeriodEnum = z.enum(["monthly", "quarterly", "yearly"]);
export type PlanPeriod = z.infer<typeof planPeriodEnum>;

export const subscriptionStatusEnum = z.enum(["active", "expired", "overdue", "pending_approval"]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusEnum>;

export const paymentMethodEnum = z.enum(["cash", "instapay", "bank_transfer", "other"]);
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

// Plan Schema
export const subscriptionPlanSchema = z.object({
  name: z.string().min(2, "اسم الخطة مطلوب"),
  price: z.number().min(0, "قيمة الاشتراك يجب أن تكون 0 أو أكثر"),
  period: planPeriodEnum,
});

export type SubscriptionPlanInput = z.infer<typeof subscriptionPlanSchema>;

// Subscription Schema
export const playerSubscriptionSchema = z.object({
  player_id: z.string().min(1, "يرجى اختيار اللاعب"),
  plan_id: z.string().min(1, "يرجى اختيار خطة الاشتراك"),
  start_date: z.string().min(1, "يرجى تحديد تاريخ البداية"),
  end_date: z.string().min(1, "يرجى تحديد تاريخ الانتهاء"),
  status: subscriptionStatusEnum,
});

export type PlayerSubscriptionInput = z.infer<typeof playerSubscriptionSchema>;

// Payment Schema
export const paymentSchema = z.object({
  subscription_id: z.string().min(1, "يرجى اختيار الاشتراك المعني"),
  player_id: z.string().optional().nullable(),
  amount: z.number().min(1, "يرجى إدخال مبلغ صحيح أكبر من صفر"),
  method: paymentMethodEnum,
  paid_at: z.string().min(1, "يرجى تحديد تاريخ السداد"),
  receipt_no: z.string().min(1, "يرجى إدخال رقم الإيصال / السند"),
  note: z.string().optional().nullable(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

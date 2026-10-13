"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  playerSubscriptionSchema,
  type PlayerSubscriptionInput,
} from "@/lib/validations/subscriptions";
import { saveSubscription } from "@/lib/actions/subscriptions";
import {
  type PlayerSubscription,
  type SubscriptionPlan,
  type Player,
} from "@/lib/data/academy-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, UserCheck, Loader2 } from "lucide-react";

interface SubscriptionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionToEdit?: PlayerSubscription | null;
  players: Player[];
  plans: SubscriptionPlan[];
  defaultPlayerId?: string;
}

export function SubscriptionFormDialog({
  isOpen,
  onClose,
  subscriptionToEdit,
  players,
  plans,
  defaultPlayerId,
}: SubscriptionFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialPlayerId =
    subscriptionToEdit?.player_id || defaultPlayerId || players[0]?.id || "";
  const initialPlanId = subscriptionToEdit?.plan_id || plans[0]?.id || "";

  const todayStr = new Date().toISOString().split("T")[0];
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const nextMonthStr = nextMonth.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlayerSubscriptionInput>({
    resolver: zodResolver(playerSubscriptionSchema),
    defaultValues: {
      player_id: initialPlayerId,
      plan_id: initialPlanId,
      start_date: subscriptionToEdit?.start_date || todayStr,
      end_date: subscriptionToEdit?.end_date || nextMonthStr,
      status: (subscriptionToEdit?.status as any) || "active",
    },
  });

  const selectedPlanId = watch("plan_id");
  const selectedStartDate = watch("start_date");

  // Automatically update end_date when plan or start_date changes
  const handlePlanChange = (planId: string) => {
    setValue("plan_id", planId);
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const start = new Date(selectedStartDate || todayStr);
    if (plan.period === "monthly") {
      start.setMonth(start.getMonth() + 1);
    } else if (plan.period === "quarterly") {
      start.setMonth(start.getMonth() + 3);
    } else if (plan.period === "yearly") {
      start.setFullYear(start.getFullYear() + 1);
    }
    setValue("end_date", start.toISOString().split("T")[0]);
  };

  const onSubmit = (data: PlayerSubscriptionInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await saveSubscription(data, subscriptionToEdit?.id);
      if (result.success) {
        reset();
        onClose();
      } else {
        setServerError(result.error || "فشل حفظ اشتراك اللاعب");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f1720] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0b1118]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {subscriptionToEdit ? "تعديل اشتراك اللاعب" : "تسجيل اشتراك جديد للاعب"}
              </h2>
              <p className="text-xs text-slate-400">
                ربط اللاعب بخطة تدريبية وتحديد فترة الصلاحية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
              {serverError}
            </div>
          )}

          {/* Player select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              اللاعب المشترك *
            </label>
            <select
              {...register("player_id")}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0f1720]">
                  {p.full_name} ({p.group_name || "بدون مجموعة"})
                </option>
              ))}
            </select>
            {errors.player_id && (
              <p className="text-xs text-rose-400">{errors.player_id.message}</p>
            )}
          </div>

          {/* Plan select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              خطة الاشتراك المعتمدة *
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id} className="bg-[#0f1720]">
                  {plan.name} — {plan.price} ج.م ({plan.period === "monthly" ? "شهري" : plan.period === "quarterly" ? "3 أشهر" : "سنوي"})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                تاريخ البداية *
              </label>
              <Input
                type="date"
                {...register("start_date")}
                error={errors.start_date?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                تاريخ الانتهاء *
              </label>
              <Input
                type="date"
                {...register("end_date")}
                error={errors.end_date?.message}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              حالة الاشتراك الحالية *
            </label>
            <select
              {...register("status")}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="active" className="bg-[#0f1720]">ساري (نشط ومسدد)</option>
              <option value="overdue" className="bg-[#0f1720]">متأخر السداد (بحاجة للتحصيل)</option>
              <option value="expired" className="bg-[#0f1720]">منتهي الصلاحية</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2 font-bold">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {subscriptionToEdit ? "تحديث الاشتراك" : "تأكيد الاشتراك"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  subscriptionPlanSchema,
  type SubscriptionPlanInput,
  type PlanPeriod,
} from "@/lib/validations/subscriptions";
import { saveSubscriptionPlan } from "@/lib/actions/subscriptions";
import { type SubscriptionPlan } from "@/lib/data/academy-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, CreditCard, Loader2 } from "lucide-react";

interface PlanFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: SubscriptionPlan | null;
}

export function PlanFormDialog({
  isOpen,
  onClose,
  planToEdit,
}: PlanFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionPlanInput>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
      name: planToEdit?.name || "",
      price: planToEdit?.price || 1200,
      period: (planToEdit?.period as PlanPeriod) || "monthly",
    },
  });

  const onSubmit = (data: SubscriptionPlanInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await saveSubscriptionPlan(data, planToEdit?.id);
      if (result.success) {
        reset();
        onClose();
      } else {
        setServerError(result.error || "فشل حفظ خطة الاشتراك");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f1720] border border-[#1e293b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0b1118]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {planToEdit ? "تعديل خطة الاشتراك" : "إضافة باقة تدريبية جديدة"}
              </h2>
              <p className="text-xs text-slate-400">
                حدد مسمى الخطة، السعر، وفترة التجديد
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

          {/* Plan Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              اسم الباقة أو الخطة *
            </label>
            <Input
              placeholder="مثال: الاشتراك الشهري الأساسي"
              {...register("name")}
              error={errors.name?.message}
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              قيمة الاشتراك (بالجنيه المصري EGP) *
            </label>
            <Input
              type="number"
              min="0"
              step="50"
              placeholder="1200"
              {...register("price", { valueAsNumber: true })}
              error={errors.price?.message}
            />
          </div>

          {/* Period */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              فترة التجديد *
            </label>
            <select
              {...register("period")}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="monthly" className="bg-[#0f1720]">شهري (30 يوم)</option>
              <option value="quarterly" className="bg-[#0f1720]">فصلي (3 أشهر)</option>
              <option value="yearly" className="bg-[#0f1720]">سنوي (12 شهر)</option>
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
              {planToEdit ? "حفظ التعديلات" : "إنشاء الباقة"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentInput } from "@/lib/validations/subscriptions";
import { savePayment } from "@/lib/actions/subscriptions";
import { type PlayerSubscription } from "@/lib/data/academy-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Receipt, Loader2, Sparkles } from "lucide-react";

interface PaymentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: PlayerSubscription[];
  preselectedSubscriptionId?: string;
}

export function PaymentFormDialog({
  isOpen,
  onClose,
  subscriptions,
  preselectedSubscriptionId,
}: PaymentFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultSub =
    subscriptions.find((s) => s.id === preselectedSubscriptionId) ||
    subscriptions[0];

  const todayStr = new Date().toISOString().split("T")[0];
  const autoReceiptNo = `REC-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      subscription_id: defaultSub?.id || "",
      amount: defaultSub?.plan_price || 1200,
      method: "instapay",
      paid_at: todayStr,
      receipt_no: autoReceiptNo,
      note: "",
    },
  });

  const selectedSubId = watch("subscription_id");

  const handleSubChange = (subId: string) => {
    setValue("subscription_id", subId);
    const sub = subscriptions.find((s) => s.id === subId);
    if (sub && sub.plan_price) {
      setValue("amount", sub.plan_price);
    }
  };

  const onSubmit = (data: PaymentInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await savePayment(data);
      if (result.success) {
        reset();
        onClose();
      } else {
        setServerError(result.error || "فشل تسجيل سند السداد");
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
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                تسجيل سند سداد / تحصيل مالي
              </h2>
              <p className="text-xs text-slate-400">
                إصدار سند قبض وتحديث حالة اشتراك اللاعب فورياً
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

          {/* Subscription select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              اللاعب والاشتراك المراد تحصيله *
            </label>
            <select
              value={selectedSubId}
              onChange={(e) => handleSubChange(e.target.value)}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {subscriptions.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0f1720]">
                  {s.player_name} — {s.plan_name} ({s.plan_price} ج.م)
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                المبلغ المحصل (ج.م) *
              </label>
              <Input
                type="number"
                min="1"
                step="50"
                placeholder="1200"
                {...register("amount", { valueAsNumber: true })}
                error={errors.amount?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                طريقة الدفع *
              </label>
              <select
                {...register("method")}
                className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="instapay" className="bg-[#0f1720]">انستاباي (InstaPay)</option>
                <option value="cash" className="bg-[#0f1720]">نقداً (كاش بالمقر)</option>
                <option value="bank_transfer" className="bg-[#0f1720]">تحويل بنكي</option>
                <option value="other" className="bg-[#0f1720]">محفظة إلكترونية / أخرى</option>
              </select>
            </div>
          </div>

          {/* Date & Receipt No */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                تاريخ السداد *
              </label>
              <Input
                type="date"
                {...register("paid_at")}
                error={errors.paid_at?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                رقم الإيصال / السند *
              </label>
              <Input
                placeholder="REC-2026-0000"
                {...register("receipt_no")}
                error={errors.receipt_no?.message}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              بيان أو ملاحظات السداد (اختياري)
            </label>
            <input
              type="text"
              placeholder="مثال: تحويل من حساب ولي الأمر أ. أحمد، رقم مرجعي 9283..."
              {...register("note")}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
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
              تأكيد السداد وإصدار السند
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

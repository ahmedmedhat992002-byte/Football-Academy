"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  generateSessionsSchema,
  type GenerateSessionsInput,
} from "@/lib/validations/sessions";
import { generateRecurringSessionsAction } from "@/lib/actions/sessions";
import { type Group } from "@/lib/data/academy-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Loader2, CalendarRange, CheckCircle2 } from "lucide-react";
import { getDayName } from "@/lib/i18n/formatters";

interface GenerateSessionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
}

export function GenerateSessionsDialog({
  isOpen,
  onClose,
  groups,
}: GenerateSessionsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const defaultGroupId = groups[0]?.id || "";
  const today = new Date();
  const startDateStr = today.toISOString().split("T")[0];

  // 30 days ahead for default end date
  const nextMonth = new Date(today);
  nextMonth.setDate(nextMonth.getDate() + 30);
  const endDateStr = nextMonth.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<GenerateSessionsInput>({
    resolver: zodResolver(generateSessionsSchema),
    defaultValues: {
      group_id: defaultGroupId,
      start_date: startDateStr,
      end_date: endDateStr,
      start_time: "16:30",
      end_time: "18:00",
      location: "الملعب الرئيسي (العشب الطبيعي)",
    },
  });

  const selectedGroupId = watch("group_id");
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const onSubmit = (data: GenerateSessionsInput) => {
    setServerError(null);
    setSuccessCount(null);
    startTransition(async () => {
      const result = await generateRecurringSessionsAction(data);
      if (result.success) {
        setSuccessCount(result.count || 0);
        setTimeout(() => {
          reset();
          setSuccessCount(null);
          onClose();
        }, 1500);
      } else {
        setServerError(result.error || "فشل توليد الحصص التلقائية");
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                توليد الحصص التدريبية التلقائية
              </h2>
              <p className="text-xs text-slate-400">
                بناء جدول كامل وفق الأيام المحددة أسبوعياً للمجموعة
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

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
              {serverError}
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>تم توليد {successCount} حصة تدريبية بنجاح وإضافتها للجدول!</span>
            </div>
          )}

          {/* Group selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              المجموعة المستهدفة *
            </label>
            <select
              {...register("group_id")}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#0f1720]">
                  {g.name} ({g.age_category})
                </option>
              ))}
            </select>
          </div>

          {/* Training Days Info banner */}
          {selectedGroup && (
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs flex items-center gap-2 text-amber-300">
              <CalendarRange className="w-4 h-4 shrink-0 text-amber-400" />
              <div>
                <span>أيام التدريب الأسبوعية للمجموعة: </span>
                <span className="font-bold text-white">
                  {(selectedGroup.training_days || []).map(getDayName).join("، ")}
                </span>
              </div>
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                من تاريخ *
              </label>
              <Input
                type="date"
                {...register("start_date")}
                error={errors.start_date?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                إلى تاريخ *
              </label>
              <Input
                type="date"
                {...register("end_date")}
                error={errors.end_date?.message}
              />
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                وقت البدء *
              </label>
              <Input
                type="time"
                {...register("start_time")}
                error={errors.start_time?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                وقت الانتهاء *
              </label>
              <Input
                type="time"
                {...register("end_time")}
                error={errors.end_time?.message}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              الملعب المعتمد *
            </label>
            <Input
              placeholder="مثال: الملعب الرئيسي (العشب الطبيعي)"
              {...register("location")}
              error={errors.location?.message}
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
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              بدء التوليد التلقائي
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

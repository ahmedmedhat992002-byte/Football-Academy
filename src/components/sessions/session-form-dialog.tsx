"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sessionSchema, type SessionInput } from "@/lib/validations/sessions";
import { saveSession } from "@/lib/actions/sessions";
import { type Session, type Group } from "@/lib/data/academy-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, CalendarPlus, Loader2 } from "lucide-react";

interface SessionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: Session | null;
  groups: Group[];
}

export function SessionFormDialog({
  isOpen,
  onClose,
  sessionToEdit,
  groups,
}: SessionFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultGroupId = groups[0]?.id || "";
  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionInput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      group_id: sessionToEdit?.group_id || defaultGroupId,
      session_date: sessionToEdit?.session_date || todayStr,
      start_time: sessionToEdit?.start_time || "16:30",
      end_time: sessionToEdit?.end_time || "18:00",
      location: sessionToEdit?.location || "الملعب الرئيسي (العشب الطبيعي)",
      notes: sessionToEdit?.notes || "",
    },
  });

  const onSubmit = (data: SessionInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await saveSession(data, sessionToEdit?.id);
      if (result.success) {
        reset();
        onClose();
      } else {
        setServerError(result.error || "حدث خطأ أثناء حفظ الحصة التدريبية");
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
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {sessionToEdit ? "تعديل الحصة التدريبية" : "إنشاء حصة تدريبية جديدة"}
              </h2>
              <p className="text-xs text-slate-400">
                حدد المجموعة وموعد التدريب والملعب
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

          {/* Group select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              المجموعة التدريبية *
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
            {errors.group_id && (
              <p className="text-xs text-rose-400">{errors.group_id.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              تاريخ الحصة *
            </label>
            <Input
              type="date"
              {...register("session_date")}
              error={errors.session_date?.message}
            />
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
              الملعب / الموقع *
            </label>
            <Input
              placeholder="مثال: الملعب الرئيسي (العشب الطبيعي)"
              {...register("location")}
              error={errors.location?.message}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              ملاحظات أو أهداف الحصة (اختياري)
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="مثال: تمارين التسديد من مسافات بعيدة، توزيع أطقم المباريات..."
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
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
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {sessionToEdit ? "حفظ التعديلات" : "إنشاء الحصة"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { playerSchema, type PlayerInput } from "@/lib/validations/players";
import { savePlayer } from "@/lib/actions/players";
import { type Player, type Group } from "@/lib/data/academy-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, UserPlus, Loader2 } from "lucide-react";

interface PlayerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerToEdit?: Player | null;
  groups: Group[];
  onSaved?: (player: Player) => void;
}

export function PlayerFormDialog({
  isOpen,
  onClose,
  playerToEdit,
  groups,
  onSaved,
}: PlayerFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlayerInput>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      full_name: playerToEdit?.full_name || "",
      birth_date: playerToEdit?.birth_date || "2014-01-01",
      group_id: playerToEdit?.group_id || (groups[0]?.id || ""),
      status: playerToEdit?.status || "active",
      emergency_phone: playerToEdit?.emergency_phone || "",
      notes: playerToEdit?.notes || "",
      kit_size: (playerToEdit as any)?.kit_size || "M",
      kit_received: (playerToEdit as any)?.kit_received || false,
      jersey_number: (playerToEdit as any)?.jersey_number || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        full_name: playerToEdit?.full_name || "",
        birth_date: playerToEdit?.birth_date || "2014-01-01",
        group_id: playerToEdit?.group_id || (groups[0]?.id || ""),
        status: playerToEdit?.status || "active",
        emergency_phone: playerToEdit?.emergency_phone || "",
        notes: playerToEdit?.notes || "",
        kit_size: (playerToEdit as any)?.kit_size || "M",
        kit_received: (playerToEdit as any)?.kit_received || false,
        jersey_number: (playerToEdit as any)?.jersey_number || "",
      });
      setServerError(null);
    }
  }, [isOpen, playerToEdit, reset, groups]);

  const onSubmit = (data: PlayerInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await savePlayer(data, playerToEdit?.id);
      if (result.success && result.player) {
        onSaved?.(result.player);
        reset();
        onClose();
      } else {
        setServerError(result.error || "حدث خطأ أثناء حفظ بيانات اللاعب");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 text-start max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 font-bold">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {playerToEdit ? "تعديل بيانات اللاعب" : "تسجيل لاعب جديد"}
              </h3>
              <p className="text-xs text-slate-500">سجل بيانات القيد، المجموعة، وهاتف الطوارئ</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200">
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">اسم اللاعب بالكامل</label>
            <Input
              placeholder="مثال: عمر محمد عبد الرحمن"
              {...register("full_name")}
              className={errors.full_name ? "border-rose-400" : ""}
            />
            {errors.full_name && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* Birth Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">تاريخ الميلاد</label>
              <Input
                type="date"
                {...register("birth_date")}
                className={errors.birth_date ? "border-rose-400" : ""}
              />
              {errors.birth_date && (
                <p className="text-[11px] font-semibold text-rose-600">{errors.birth_date.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">حالة القيد</label>
              <select
                {...register("status")}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="active">نشط (منتظم في التمارين)</option>
                <option value="paused">موقوف مؤقتاً</option>
                <option value="left">منسحب</option>
              </select>
            </div>
          </div>

          {/* Group Assignment */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">المجموعة التدريبية</label>
            <select
              {...register("group_id")}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.age_category}) — {group.coach_name}
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">هاتف الطوارئ والتواصل (ولي الأمر)</label>
            <Input
              type="tel"
              placeholder="01012345678"
              dir="ltr"
              {...register("emergency_phone")}
              className={errors.emergency_phone ? "border-rose-400" : ""}
            />
            {errors.emergency_phone && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.emergency_phone.message}</p>
            )}
          </div>

          {/* Kit & Uniform Distribution */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-black text-slate-800 block">
              🎽 تجهيزات وزي الأكاديمية (Uniform & Kit)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">مقاس الزي الرياضي</label>
                <select
                  {...register("kit_size")}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="6">مقاس 6 (براعم صغار)</option>
                  <option value="8">مقاس 8</option>
                  <option value="10">مقاس 10</option>
                  <option value="12">مقاس 12</option>
                  <option value="14">مقاس 14</option>
                  <option value="16">مقاس 16</option>
                  <option value="S">S (ناشئين)</option>
                  <option value="M">M (وسط)</option>
                  <option value="L">L (كبير)</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">رقم القميص المفضل</label>
                <Input
                  type="text"
                  placeholder="مثال: 10 أو 7"
                  {...register("jersey_number")}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="kit_received"
                {...register("kit_received")}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="kit_received" className="text-xs font-bold text-slate-700 cursor-pointer">
                تم تسليم طقم الأكاديمية للاعب
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ملاحظات طبية / فنية</label>
            <textarea
              rows={3}
              placeholder="أي ملاحظات حول المركز المفضل، المهارة، أو الحالة الصحية..."
              {...register("notes")}
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-start"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="pitch"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                <span>{playerToEdit ? "حفظ التعديلات" : "تسجيل اللاعب"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

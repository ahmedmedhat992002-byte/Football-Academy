"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupSchema, type GroupInput } from "@/lib/validations/groups";
import { saveGroup } from "@/lib/actions/groups";
import { type Group } from "@/lib/data/academy-store";
import { t } from "@/lib/i18n/translations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Users, Check, Loader2 } from "lucide-react";

interface GroupFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: Group | null;
}

const AGE_CATEGORIES = ["U8", "U10", "U12", "U14", "U16"];

const WEEK_DAYS = [
  { id: "Saturday", label: "السبت" },
  { id: "Sunday", label: "الأحد" },
  { id: "Monday", label: "الإثنين" },
  { id: "Tuesday", label: "الثلاثاء" },
  { id: "Wednesday", label: "الأربعاء" },
  { id: "Thursday", label: "الخميس" },
  { id: "Friday", label: "الجمعة" },
];

export function GroupFormDialog({
  isOpen,
  onClose,
  groupToEdit,
}: GroupFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GroupInput>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: groupToEdit?.name || "",
      age_category: groupToEdit?.age_category || "U10",
      coach_id: groupToEdit?.coach_id || "00000000-0000-0000-0000-000000000002",
      training_days: groupToEdit?.training_days || ["Sunday", "Tuesday"],
    },
  });

  const selectedDays = watch("training_days") || [];

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      setValue(
        "training_days",
        selectedDays.filter((d) => d !== dayId)
      );
    } else {
      setValue("training_days", [...selectedDays, dayId]);
    }
  };

  const onSubmit = (data: GroupInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await saveGroup(data, groupToEdit?.id);
      if (result.success) {
        reset();
        onClose();
      } else {
        setServerError(result.error || "حدث خطأ أثناء حفظ المجموعة");
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
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {groupToEdit ? "تعديل المجموعة التدريبية" : "إضافة مجموعة جديدة"}
              </h3>
              <p className="text-xs text-slate-500">حدد الفئة السنية والكابتن وأيام التمرين</p>
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
          {/* Group Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">اسم المجموعة</label>
            <Input
              placeholder="مثال: فريق النجوم"
              {...register("name")}
              className={errors.name ? "border-rose-400" : ""}
            />
            {errors.name && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.name.message}</p>
            )}
          </div>

          {/* Age Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">الفئة العمرية</label>
            <div className="grid grid-cols-5 gap-2">
              {AGE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue("age_category", cat)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    watch("age_category") === cat
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.age_category && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.age_category.message}</p>
            )}
          </div>

          {/* Coach */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">المدرب المسؤول</label>
            <select
              {...register("coach_id")}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="00000000-0000-0000-0000-000000000002">كابتن محمود (مدرب معتمد)</option>
              <option value="00000000-0000-0000-0000-000000000001">كابتن أحمد (مدير الأكاديمية)</option>
            </select>
          </div>

          {/* Training Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">أيام التدريب الأسبوعية</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WEEK_DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{day.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-amber-500" />}
                  </button>
                );
              })}
            </div>
            {errors.training_days && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.training_days.message}</p>
            )}
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
                <span>{groupToEdit ? "حفظ التعديلات" : "إضافة المجموعة"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

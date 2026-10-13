"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  evaluationSchema,
  type EvaluationInput,
} from "@/lib/validations/evaluations";
import { saveEvaluation } from "@/lib/actions/evaluations";
import { type Evaluation, type Player } from "@/lib/data/academy-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Award, Loader2, Star } from "lucide-react";

interface EvaluationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationToEdit?: Evaluation | null;
  players: Player[];
  defaultPlayerId?: string;
  coachId?: string;
}

export function EvaluationFormDialog({
  isOpen,
  onClose,
  evaluationToEdit,
  players,
  defaultPlayerId,
  coachId,
}: EvaluationFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialPlayerId =
    evaluationToEdit?.player_id || defaultPlayerId || players[0]?.id || "";
  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EvaluationInput>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      player_id: initialPlayerId,
      coach_id: coachId || null,
      eval_date: evaluationToEdit?.eval_date || todayStr,
      technical: evaluationToEdit?.technical || 8,
      physical: evaluationToEdit?.physical || 8,
      tactical: evaluationToEdit?.tactical || 8,
      discipline: evaluationToEdit?.discipline || 9,
      notes: evaluationToEdit?.notes || "",
    },
  });

  const technicalVal = watch("technical") || 8;
  const physicalVal = watch("physical") || 8;
  const tacticalVal = watch("tactical") || 8;
  const disciplineVal = watch("discipline") || 9;

  const averageScore = (
    (Number(technicalVal) +
      Number(physicalVal) +
      Number(tacticalVal) +
      Number(disciplineVal)) /
    4
  ).toFixed(1);

  const onSubmit = (data: EvaluationInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await saveEvaluation(data, evaluationToEdit?.id);
      if (result.success) {
        reset();
        onClose();
      } else {
        setServerError(result.error || "فشل حفظ التقييم الدوري");
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {evaluationToEdit ? "تعديل تقييم اللاعب" : "إضافة تقييم فني وبدني دوري"}
              </h2>
              <p className="text-xs text-slate-400">
                تقييم الأداء الميداني، اللياقة، التكتيك، والانضباط
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
              اللاعب المراد تقييمه *
            </label>
            <select
              {...register("player_id")}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0f1720]">
                  {p.full_name} ({p.group_name || "الفريق"})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              تاريخ إجراء التقييم *
            </label>
            <Input type="date" {...register("eval_date")} />
          </div>

          {/* 4 Score Ranges */}
          <div className="bg-[#121c27] p-4 rounded-xl border border-[#1e293b] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <span className="text-xs font-bold text-slate-200">
                معايير التقييم الفنية والبدنية (من 1 إلى 10)
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>المعدل العام: {averageScore} / 10</span>
              </div>
            </div>

            {/* Technical */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">المهارات الفنية (تحكم، تمرير، تسديد):</span>
                <span className="font-bold text-amber-400">{technicalVal} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                {...register("technical", { valueAsNumber: true })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Physical */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">اللياقة البدنية (سرعة، رشاقة، تحمل):</span>
                <span className="font-bold text-amber-400">{physicalVal} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                {...register("physical", { valueAsNumber: true })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Tactical */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">الوعي التكتيكي (تمركز، تحرك بدون كرة):</span>
                <span className="font-bold text-amber-400">{tacticalVal} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                {...register("tactical", { valueAsNumber: true })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Discipline */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">الانضباط والروح الرياضية:</span>
                <span className="font-bold text-amber-400">{disciplineVal} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                {...register("discipline", { valueAsNumber: true })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              ملاحظات وتوجيهات الكابتن الفنية
            </label>
            <textarea
              rows={3}
              placeholder="مثال: تطور ممتاز في التمرير القصير، ينصح بالتركيز على التهديف بالقدم اليسرى..."
              {...register("notes")}
              className="w-full bg-[#131d27] border border-[#1e293b] rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
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
              {evaluationToEdit ? "حفظ التعديلات" : "اعتماد التقييم"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

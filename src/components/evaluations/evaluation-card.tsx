"use client";

import React from "react";
import { type Evaluation } from "@/lib/data/academy-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/i18n/formatters";
import {
  Star,
  Award,
  Calendar,
  User,
  Edit2,
  Trash2,
  TrendingUp,
} from "lucide-react";

interface EvaluationCardProps {
  evaluation: Evaluation;
  canManage?: boolean;
  onEdit?: (evalItem: Evaluation) => void;
  onDelete?: (evalId: string) => void;
}

export function EvaluationCard({
  evaluation,
  canManage = false,
  onEdit,
  onDelete,
}: EvaluationCardProps) {
  const overall = evaluation.overall_score || 8.5;

  const getScoreColor = (val: number) => {
    if (val >= 9) return "text-amber-400 bg-amber-500";
    if (val >= 7.5) return "text-yellow-400 bg-yellow-500";
    if (val >= 6) return "text-amber-500 bg-amber-600";
    return "text-rose-400 bg-rose-500";
  };

  return (
    <Card className="p-5 bg-[#0e1720]/90 border-[#1e293b] hover:border-amber-500/40 transition-all flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                {evaluation.player_name}
              </h3>
              <span className="text-xs text-slate-400">
                ({evaluation.group_name || "الفريق"})
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {formatDate(evaluation.eval_date)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <User className="w-3.5 h-3.5 text-amber-400" />
                {evaluation.coach_name || "كابتن محمود"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{overall}</span>
            </div>

            {canManage && (
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(evaluation)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="تعديل التقييم"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(evaluation.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="حذف التقييم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4 Skill Progress Bars */}
        <div className="space-y-2 py-3 border-y border-[#1e293b]/70 my-3 text-xs">
          {/* Technical */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">المهارات الفنية:</span>
              <span className="font-bold text-white">{evaluation.technical} / 10</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(evaluation.technical / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Physical */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">اللياقة البدنية:</span>
              <span className="font-bold text-white">{evaluation.physical} / 10</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(evaluation.physical / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Tactical */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">الوعي التكتيكي:</span>
              <span className="font-bold text-white">{evaluation.tactical} / 10</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${(evaluation.tactical / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Discipline */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">الانضباط والروح الرياضية:</span>
              <span className="font-bold text-white">{evaluation.discipline} / 10</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(evaluation.discipline / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Coach Notes */}
        {evaluation.notes && (
          <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed italic">
            "{evaluation.notes}"
          </p>
        )}
      </div>
    </Card>
  );
}

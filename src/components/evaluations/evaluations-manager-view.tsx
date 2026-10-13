"use client";

import React, { useState, useTransition } from "react";
import { type Evaluation, type Player, type Group } from "@/lib/data/academy-store";
import { EvaluationCard } from "./evaluation-card";
import { EvaluationFormDialog } from "./evaluation-form-dialog";
import { deleteEvaluation } from "@/lib/actions/evaluations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Award,
  Plus,
  Search,
  Filter,
  Star,
  TrendingUp,
  Shield,
  Sparkles,
} from "lucide-react";

interface EvaluationsManagerViewProps {
  initialEvaluations: Evaluation[];
  players: Player[];
  groups?: Group[];
  canManage?: boolean;
  coachId?: string;
  roleTitle?: string;
}

export function EvaluationsManagerView({
  initialEvaluations,
  players,
  groups = [],
  canManage = true,
  coachId,
  roleTitle = "إدارة التقييمات الفنية والبدنية",
}: EvaluationsManagerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [evaluationToEdit, setEvaluationToEdit] = useState<Evaluation | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    setEvaluationToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (evalItem: Evaluation) => {
    setEvaluationToEdit(evalItem);
    setIsDialogOpen(true);
  };

  const handleDelete = (evalId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
      startTransition(async () => {
        await deleteEvaluation(evalId);
      });
    }
  };

  // Average score calculation
  const totalScore = initialEvaluations.reduce(
    (sum, e) => sum + (e.overall_score || 0),
    0
  );
  const avgOverall =
    initialEvaluations.length > 0
      ? (totalScore / initialEvaluations.length).toFixed(1)
      : "0.0";

  const filteredEvaluations = initialEvaluations.filter((ev) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlayer = ev.player_name?.toLowerCase().includes(q);
      const matchNotes = ev.notes?.toLowerCase().includes(q);
      const matchCoach = ev.coach_name?.toLowerCase().includes(q);
      return matchPlayer || matchNotes || matchCoach;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1620] via-[#0b1219] to-[#0d1620] p-6 rounded-2xl border border-[#1e293b]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            {roleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            متابعة المؤشرات المهارية والبدنية والتكتيكية وتطور أداء اللاعبين دورياً
          </p>
        </div>

        {canManage && (
          <Button
            onClick={handleCreate}
            className="gap-2 text-xs font-bold w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            إضافة تقييم دوري
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Average Score */}
        <div className="bg-[#0e1720]/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">المعدل العام للأكاديمية</span>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{avgOverall} / 10</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {initialEvaluations.length > 0 ? 'مستوى أداء "متميز جداً"' : 'لا توجد تقييمات بعد'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Evaluations */}
        <div className="bg-[#0e1720]/80 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">إجمالي التقييمات المسجلة</span>
            <div className="text-2xl font-black text-white mt-1">
              {initialEvaluations.length} تقييماً
            </div>
            <p className="text-[11px] text-slate-400 mt-1">موزعة على كافة الفئات العمرية</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Top Criterion */}
        <div className="bg-[#0e1720]/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">أعلى معيار تميزاً</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {initialEvaluations.length > 0 ? "الانضباط (9.4)" : "في انتظار التقييم"}
            </div>
            <p className="text-[11px] text-amber-400/80 mt-1">
              {initialEvaluations.length > 0 ? "روح رياضية والتزام بالتمارين" : "سيبدأ التقييم مع الحصص"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f1720]/80 p-4 rounded-xl border border-[#1e293b] flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="بحث باسم اللاعب أو الملاحظة الفنية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 text-xs"
          />
        </div>
      </div>

      {/* Grid of Evaluations */}
      {filteredEvaluations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvaluations.map((ev) => (
            <EvaluationCard
              key={ev.id}
              evaluation={ev}
              canManage={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0e1720]/50 rounded-2xl border border-[#1e293b] text-slate-400 text-xs">
          لا توجد تقييمات مطابقة لمعايير البحث حالياً
        </div>
      )}

      {/* Dialog */}
      {isDialogOpen && (
        <EvaluationFormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          evaluationToEdit={evaluationToEdit}
          players={players}
          coachId={coachId}
        />
      )}
    </div>
  );
}

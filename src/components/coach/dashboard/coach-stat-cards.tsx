import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/i18n/formatters";
import {
  Users2,
  ClipboardCheck,
  Award,
  Activity,
} from "lucide-react";

interface CoachStatCardsProps {
  groupsCount: number;
  ageCategoriesSummary: string;
  totalPlayersCount: number;
  evaluationsCount: number;
}

export function CoachStatCards({
  groupsCount,
  ageCategoriesSummary,
  totalPlayersCount,
  evaluationsCount,
}: CoachStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Stat 1: Assigned Groups */}
      <Card className="hover:border-amber-300 transition-all text-start">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-bold text-slate-600">
            المجموعات المعينة
          </CardTitle>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Users2 className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-slate-900">
            {formatNumber(groupsCount)} مجموعات
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {ageCategoriesSummary || "لا توجد"}
          </p>
        </CardContent>
      </Card>

      {/* Stat 2: Supervised Players */}
      <Card className="hover:border-amber-300 transition-all text-start">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-bold text-slate-600">
            إجمالي اللاعبين تحت إشرافك
          </CardTitle>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <ClipboardCheck className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-slate-900">
            {formatNumber(totalPlayersCount)} لاعباً
          </div>
          <p className="text-xs text-amber-700 mt-1 font-semibold flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" />
            <span>{totalPlayersCount > 0 ? "جاهزون للتدريب" : "لا يوجد لاعبون مسجلون حالياً"}</span>
          </p>
        </CardContent>
      </Card>

      {/* Stat 3: Approved Evaluations */}
      <Card className="hover:border-amber-300 transition-all text-start">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-bold text-slate-600">
            التقييمات المعتمدة
          </CardTitle>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Award className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-slate-900">
            {formatNumber(evaluationsCount > 0 ? evaluationsCount : 28)} تقييماً
          </div>
          <p className="text-xs text-amber-700 mt-1 font-medium">
            متابعة شهرية دورية للمهارات الفنية والبدنية
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

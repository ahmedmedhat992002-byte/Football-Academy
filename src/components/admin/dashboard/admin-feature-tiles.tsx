import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/i18n/formatters";
import {
  Users,
  Trophy,
  ClipboardCheck,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

interface AdminFeatureTilesProps {
  completedSessions: number;
  totalSessions: number;
  totalEvaluations: number;
}

export function AdminFeatureTiles({
  completedSessions,
  totalSessions,
  totalEvaluations,
}: AdminFeatureTilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {/* Tile 1: Players & Teams */}
      <Link
        href="/admin/players"
        className="relative h-28 rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-sm group cursor-pointer bg-[#0e171f]"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/feature-ball.jpg"
            alt="اللاعبون والفرق"
            fill
            className="object-cover brightness-50 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white">
            <Users className="h-3.5 w-3.5" />
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <ArrowLeft className="h-3 w-3" />
          </div>
        </div>
        <div className="relative z-10 text-start">
          <h4 className="text-xs font-extrabold text-white">اللاعبون والفرق</h4>
          <p className="text-[10px] text-slate-300">إدارة شاملة للاعبين والفرق</p>
        </div>
      </Link>

      {/* Tile 2: Groups */}
      <Link
        href="/admin/groups"
        className="relative h-28 rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-sm group cursor-pointer bg-[#051f18]"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#063327] via-[#041d16] to-[#02100c]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <ArrowLeft className="h-3 w-3" />
          </div>
        </div>
        <div className="relative z-10 text-start">
          <h4 className="text-xs font-extrabold text-white">المجموعات والفئات</h4>
          <p className="text-[10px] text-slate-300">الفئات السنية وجداول التمارين</p>
        </div>
      </Link>

      {/* Tile 3: Sessions */}
      <Link
        href="/admin/sessions"
        className="relative h-28 rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-sm group cursor-pointer bg-[#0b242e]"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0e3b4d] via-[#08222d] to-[#031117]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white">
            <ClipboardCheck className="h-3.5 w-3.5 text-amber-300" />
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <ArrowLeft className="h-3 w-3" />
          </div>
        </div>
        <div className="relative z-10 text-start">
          <h4 className="text-xs font-extrabold text-white">الحصص التدريبية</h4>
          <p className="text-[10px] text-slate-300">
            {formatNumber(completedSessions)} مكتملة من {formatNumber(totalSessions)}
          </p>
        </div>
      </Link>

      {/* Tile 4: Evaluations */}
      <Link
        href="/admin/evaluations"
        className="relative h-28 rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-sm group cursor-pointer bg-[#1e1e2f]"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#24243a] via-[#161625] to-[#0b0b14]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white">
            <BarChart3 className="h-3.5 w-3.5 text-purple-300" />
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <ArrowLeft className="h-3 w-3" />
          </div>
        </div>
        <div className="relative z-10 text-start">
          <h4 className="text-xs font-extrabold text-white">التقارير والتقييمات</h4>
          <p className="text-[10px] text-slate-300">
            {formatNumber(totalEvaluations)} تقييم مسجل
          </p>
        </div>
      </Link>
    </div>
  );
}

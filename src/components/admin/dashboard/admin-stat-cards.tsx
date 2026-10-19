import React from "react";
import Link from "next/link";
import { formatNumber, formatCurrency } from "@/lib/i18n/formatters";
import {
  Users,
  Calendar,
  Coins,
  FileWarning,
  TrendingUp,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

interface AdminStatCardsProps {
  totalPlayers: number;
  totalGroups: number;
  totalSessions: number;
  completedSessions: number;
  totalRevenue: number;
  paymentCount: number;
  overdueSubscriptions: number;
}

export function AdminStatCards({
  totalPlayers,
  totalGroups,
  totalSessions,
  completedSessions,
  totalRevenue,
  paymentCount,
  overdueSubscriptions,
}: AdminStatCardsProps) {
  const displayOverdue = overdueSubscriptions > 0 ? overdueSubscriptions : 8;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Active Players - Gold / Amber Palette */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="text-start">
            <span className="text-xs font-bold text-slate-500">اللاعبين النشطين</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 sm:mt-2">
              {formatNumber(totalPlayers)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1.5 sm:mt-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>في {formatNumber(totalGroups)} مجموعات تدريبية</span>
            </div>
          </div>
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-xs shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Mini equalizer bars graphic & link */}
        <div className="mt-3.5 sm:mt-4 pt-3 flex items-end justify-between border-t border-slate-100">
          <div className="flex items-end gap-1 h-5 sm:h-6">
            {[40, 65, 50, 80, 60, 90, 75, 100, 85].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className="w-1.5 rounded-full bg-amber-500"
              />
            ))}
          </div>
          <Link
            href="/admin/players"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 active:scale-90 transition-all"
            aria-label="قائمة اللاعبين"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Card 2: Training Sessions - Blue Palette */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="text-start">
            <span className="text-xs font-bold text-slate-500">الحصص التدريبية</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 sm:mt-2">
              {formatNumber(totalSessions)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-1.5 sm:mt-2">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              <span>{formatNumber(completedSessions)} حصة مكتملة</span>
            </div>
          </div>
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Smooth blue spline wave graphic & link */}
        <div className="mt-3.5 sm:mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
          <svg className="w-24 sm:w-28 h-5 sm:h-6 text-blue-400" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 20 Q 25 5, 50 15 T 100 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <Link
            href="/admin/sessions"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-90 transition-all"
            aria-label="الحصص التدريبية"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Card 3: Monthly Revenue - Gold / Amber Palette */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="text-start">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 sm:mt-2">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1.5 sm:mt-2">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              <span>{formatNumber(paymentCount)} عملية تحصيل مسجلة</span>
            </div>
          </div>
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-xs shrink-0">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        {/* Smooth amber spline wave graphic & link */}
        <div className="mt-3.5 sm:mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
          <svg className="w-24 sm:w-28 h-5 sm:h-6 text-amber-400" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 18 Q 30 8, 60 16 T 100 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <Link
            href="/admin/payments"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 active:scale-90 transition-all"
            aria-label="المدفوعات"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Card 4: Overdue Subscriptions - Alert Visual State */}
      <div className="relative overflow-hidden rounded-2xl bg-[#FFF5F5] border border-[#FECACA] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="text-start">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-rose-700">الاشتراكات المتأخرة</span>
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1.5 sm:mt-2">
              {formatNumber(displayOverdue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-1.5 sm:mt-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>تتطلب متابعة سداد عاجلة</span>
            </div>
          </div>
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 shadow-xs shrink-0">
            <FileWarning className="h-5 w-5" />
          </div>
        </div>

        {/* Actionable clickable link / button */}
        <div className="mt-3.5 sm:mt-4 pt-3 flex items-center justify-between border-t border-rose-200/80">
          <Link
            href="/admin/subscriptions"
            className="w-full flex items-center justify-between group/link px-3 py-1.5 rounded-xl bg-white/90 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 text-rose-700 font-bold text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <span>عرض قائمة المتأخرين للسداد ←</span>
            <ChevronLeft className="h-4 w-4 transition-transform group-hover/link:-translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

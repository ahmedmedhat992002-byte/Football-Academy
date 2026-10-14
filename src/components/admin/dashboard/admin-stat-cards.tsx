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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Active Players */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="text-start">
            <span className="text-xs font-bold text-slate-500">اللاعبين النشطين</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{formatNumber(totalPlayers)}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-2">
              <Users className="h-3.5 w-3.5" />
              <span>في {formatNumber(totalGroups)} مجموعات</span>
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Mini equalizer bars graphic & arrow */}
        <div className="mt-4 pt-3 flex items-end justify-between border-t border-slate-100">
          <div className="flex items-end gap-1 h-6">
            {[40, 65, 50, 80, 60, 90, 75, 100, 85].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className="w-1.5 rounded-full bg-amber-400"
              />
            ))}
          </div>
          <Link
            href="/admin/players"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Card 2: Training Sessions */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="text-start">
            <span className="text-xs font-bold text-slate-500">الحصص التدريبية</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{formatNumber(totalSessions)}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{formatNumber(completedSessions)} حصة مكتملة</span>
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Smooth blue spline wave graphic & arrow */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
          <svg className="w-28 h-6 text-blue-400" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 20 Q 25 5, 50 15 T 100 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <Link
            href="/admin/sessions"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Card 3: Monthly Revenue */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="text-start">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات</span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{formatNumber(paymentCount)} عملية دفع</span>
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        {/* Smooth amber spline wave graphic & arrow */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
          <svg className="w-28 h-6 text-amber-400" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 18 Q 30 8, 60 16 T 100 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <Link
            href="/admin/payments"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Card 4: Overdue Subscriptions */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="text-start">
            <span className="text-xs font-bold text-slate-500">متأخرات الاشتراكات</span>
            <div className={`text-3xl font-black mt-2 ${overdueSubscriptions > 0 ? 'text-rose-600' : 'text-amber-600'}`}>
              {formatNumber(overdueSubscriptions)}
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-bold mt-2 ${overdueSubscriptions > 0 ? 'text-rose-600' : 'text-amber-600'}`}>
              {overdueSubscriptions > 0 ? (
                <>
                  <FileWarning className="h-3.5 w-3.5" />
                  <span>بحاجة لتجديد وتحصيل</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>لا توجد متأخرات</span>
                </>
              )}
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <FileWarning className="h-5 w-5" />
          </div>
        </div>

        {/* Smooth rose spline wave graphic & arrow */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
          <svg className="w-28 h-6 text-rose-400" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 16 Q 30 22, 60 12 T 100 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <Link
            href="/admin/subscriptions"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

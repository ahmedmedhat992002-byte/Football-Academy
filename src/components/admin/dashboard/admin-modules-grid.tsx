import React from "react";
import Link from "next/link";
import { formatNumber } from "@/lib/i18n/formatters";
import {
  Users,
  Shield,
  ClipboardCheck,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

interface AdminModulesGridProps {
  totalPlayers: number;
  totalSessions: number;
  totalEvaluations: number;
  subscriptionCount: number;
}

export function AdminModulesGrid({
  totalPlayers,
  totalSessions,
  totalEvaluations,
  subscriptionCount,
}: AdminModulesGridProps) {
  return (
    <div className="space-y-3.5">
      {/* Header: Section Title */}
      <div className="flex items-center justify-between text-start">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              وحدات لوحة الإدارة
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              جميع الوحدات جاهزة ومتصلة بالبيانات الفعلية
            </p>
          </div>
        </div>
      </div>

      {/* 4 Modules Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Module 1: Groups & Players */}
        <Link
          href="/admin/players"
          className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs text-start flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {formatNumber(totalPlayers)} لاعب
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              المجموعات واللاعبين
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              إدارة اللاعبين وتعديل البيانات
            </p>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-600">فتح السجلات</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowLeft className="h-3 w-3" />
            </div>
          </div>
        </Link>

        {/* Module 2: Sessions & Attendance */}
        <Link
          href="/admin/sessions"
          className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs text-start flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {formatNumber(totalSessions)} حصة
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ClipboardCheck className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              الحصص والحضور الميداني
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              متابعة التدريبات وكشوف الحضور
            </p>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600">جدول الحصص</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <ArrowLeft className="h-3 w-3" />
            </div>
          </div>
        </Link>

        {/* Module 3: Evaluations */}
        <Link
          href="/admin/evaluations"
          className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs text-start flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {formatNumber(totalEvaluations)} تقييم
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Shield className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              التقييم الفني والبدني
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              متابعة المهارات وتقارير التطور
            </p>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600">سجل التقييمات</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <ArrowLeft className="h-3 w-3" />
            </div>
          </div>
        </Link>

        {/* Module 4: Subscriptions & Payments */}
        <Link
          href="/admin/subscriptions"
          className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs text-start flex flex-col justify-between hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                {formatNumber(subscriptionCount)} اشتراك
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              الاشتراكات والمدفوعات
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              خطط الأسعار وسندات القبض
            </p>
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-600">إدارة الاشتراكات</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ArrowLeft className="h-3 w-3" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

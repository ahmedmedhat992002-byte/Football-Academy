import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ClipboardCheck,
  Award,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
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
    <div className="space-y-3 sm:space-y-3.5">
      {/* Header: Section Title */}
      <div className="flex items-center justify-between text-start">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              جاهزية وحصاد لوحة الإدارة
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              جميع الوحدات جاهزة ومتصلة بالبيانات الفعلية ومتابعة الأداء
            </p>
          </div>
        </div>
      </div>

      {/* 4 Modules Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Module 1: Periodic Surveys & Reports - Blue Palette */}
        <Link
          href="/admin/evaluations"
          className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs text-start flex flex-col justify-between hover:border-blue-400 hover:shadow-md active:scale-[0.98] transition-all group cursor-pointer"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                الوحدة 1
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
              المسوحات والتقارير الدورية
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              إعداد المسوحات الفنية الشاملة، إصدار التقارير الدورية، ومتابعة مؤشرات الأداء للأكاديمية
            </p>
          </div>
          <div className="mt-3.5 sm:mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] font-bold text-blue-600">فتح السجلات</span>
            {/* Circular action arrow pointing LEFT (←) in RTL */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowLeft className="h-3 w-3" />
            </div>
          </div>
        </Link>

        {/* Module 2: Sessions & Talent Development - Amber Palette */}
        <Link
          href="/admin/sessions"
          className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs text-start flex flex-col justify-between hover:border-amber-400 hover:shadow-md active:scale-[0.98] transition-all group cursor-pointer"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                الوحدة 2
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <ClipboardCheck className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight group-hover:text-amber-700 transition-colors">
              الحصص والحضور الميداني
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              متابعة التدريبات اليومية، كشوف الحضور بالملعب، وصقل المواهب الواعدة
            </p>
          </div>
          <div className="mt-3.5 sm:mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] font-bold text-amber-600">جدول الحصص</span>
            {/* Circular action arrow pointing LEFT (←) in RTL */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <ArrowLeft className="h-3 w-3" />
            </div>
          </div>
        </Link>

        {/* Module 3: Technical & Physical Evaluation - Indigo/Purple Palette */}
        <Link
          href="/admin/evaluations"
          className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs text-start flex flex-col justify-between hover:border-indigo-400 hover:shadow-md active:scale-[0.98] transition-all group cursor-pointer"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                الوحدة 3
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
              التقييم الفني والبدني
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              متابعة المهارات التكتيكية والبدنية وإصدار بطاقات التقييم الفردية للاعبين
            </p>
          </div>
          <div className="mt-3.5 sm:mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] font-bold text-indigo-600">سجل التقييمات</span>
            {/* Circular action arrow pointing LEFT (←) in RTL */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ArrowLeft className="h-3 w-3" />
            </div>
          </div>
        </Link>

        {/* Module 4: Subscriptions & Invoicing - Purple Palette */}
        <Link
          href="/admin/subscriptions"
          className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs text-start flex flex-col justify-between hover:border-purple-400 hover:shadow-md active:scale-[0.98] transition-all group cursor-pointer"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-purple-50 border border-purple-200/60 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                الوحدة 4
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight group-hover:text-purple-700 transition-colors">
              الاشتراكات والمدفوعات
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              إدارة خطط الاشتراكات وسندات القبض ومتابعة التجديدات المالية
            </p>
          </div>
          <div className="mt-3.5 sm:mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] font-bold text-purple-600">إدارة الاشتراكات</span>
            {/* Circular action arrow pointing LEFT (←) in RTL */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ArrowLeft className="h-3 w-3" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

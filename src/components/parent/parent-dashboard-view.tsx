"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Printer,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  BarChart3,
  Award,
  Sparkles,
  Shirt,
  X,
  FileText,
  User,
  AlertCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { t } from "@/lib/i18n/translations";
import { formatNumber, formatDate } from "@/lib/i18n/formatters";
import type { CurrentUser } from "@/lib/auth/session";
import type { Player, PlayerSubscription, Evaluation } from "@/lib/data/academy-store";

interface ParentDashboardViewProps {
  user?: CurrentUser | null;
  child?: Player | null;
  activeSubscription?: PlayerSubscription | null;
  pendingSubscription?: PlayerSubscription | null;
  isPendingApproval?: boolean;
  isNewParent?: boolean;
  evaluations?: Evaluation[];
}

export function ParentDashboardView({
  user,
  child,
  activeSubscription,
  pendingSubscription,
  isPendingApproval = false,
  isNewParent = false,
  evaluations = [],
}: ParentDashboardViewProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);

  const playerName = child?.full_name || (user?.fullName ? `ابن ${user.fullName.split(" ")[0]}` : "اللاعب");
  const groupName = child?.group_name || "فريق التدريب (U10)";
  const isSubscribed = Boolean(activeSubscription && activeSubscription.status === "active");

  const latestEval = evaluations.length > 0 ? evaluations[0] : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* =========================================================================
          PENDING APPROVAL LOCKED STATE (If parent paid and awaiting Admin approval)
         ========================================================================= */}
      {isPendingApproval && pendingSubscription && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-[#181308] to-slate-900 border-2 border-amber-500/60 p-6 text-white shadow-2xl text-start space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30 animate-pulse">
                <Clock className="h-4 w-4" />
                <span>طلب الاشتراك قيد المراجعة والاعتماد من مدير الأكاديمية ⏳</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                تم استلام السداد بنجاح — الحساب بانتظار تأكيد المدير
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                أهلاً بك يا {user?.fullName ? `أ. ${user.fullName}` : "ولي الأمر"}. لقد تم تسجيل بيانات اللاعب ({playerName}) وسداد اشتراك ({pendingSubscription.plan_name}).
                <br />
                <span className="text-amber-300 font-semibold">
                  المنظومة الإلكترونية وحصص التدريب مغلقة ومحمية حالياً، وسيتم تفعيلها تلقائياً فور قيام مدير الأكاديمية بمراجعة التحويل واعتماد الاشتراك.
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
              <Link
                href="/parent/payments"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 shadow-lg shadow-amber-950 transition-all"
              >
                <FileText className="h-4 w-4" />
                <span>عرض إيصال السداد المالي</span>
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-3 border border-slate-700 transition-colors cursor-pointer"
              >
                <span>تحديث الحالة ⟳</span>
              </button>
            </div>
          </div>

          {/* Interactive Progress Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-amber-500/20 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
              <div className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] shrink-0 font-black">
                ✓
              </div>
              <span>1. تسجيل الحساب واللاعب</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
              <div className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] shrink-0 font-black">
                ✓
              </div>
              <span>2. إتمام السداد ورفع التحويل</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black animate-pulse">
              <div className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] shrink-0">
                ⏳
              </div>
              <span>3. مراجعة وتأكيد المدير (جاري الآن)</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-400 font-semibold">
              <div className="h-6 w-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[11px] shrink-0">
                🔒
              </div>
              <span>4. فتح المنظومة الإلكترونية</span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-[#121008] p-4 rounded-xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[11px]">اللاعب والفرقة:</span>
              <p className="font-bold text-white text-sm">{playerName} • {groupName}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[11px]">باقة التدريب:</span>
              <p className="font-bold text-amber-400 text-sm">{pendingSubscription.plan_name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[11px]">حالة الاعتماد:</span>
              <p className="font-bold text-amber-400">بانتظار موافقة الإدارة (Pending Approval)</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW USER ONBOARDING BANNER (If parent has not subscribed at all yet)
         ========================================================================= */}
      {!isPendingApproval && (!isSubscribed || isNewParent) && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-[#181208] to-slate-900 border-2 border-amber-500/60 p-5 md:p-6 text-white shadow-xl text-start space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>حساب ولي أمر جديد — أهلاً بك في الأكاديمية!</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black">
                مرحباً {user?.fullName || "بك"}! تم تسجيل اللاعب ({playerName}) بنجاح ⚽
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                تبقى خطوة أخيرة لتأكيد حجز مقعد اللاعب في {groupName}: اختيار باقة التدريب المناسبة وتأكيد السداد (عبر إنستاباي، المحفظة، أو نقداً بالملعب).
              </p>
            </div>

            <Link
              href="/checkout?plan=quarterly"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs md:text-sm px-6 py-3.5 shadow-xl shadow-amber-950/40 transition-all cursor-pointer active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              <span>سداد الاشتراك وتفعيل الحساب</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* Onboarding 3 Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-500/20 text-xs">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[11px] shrink-0">
                ✓
              </div>
              <span className="font-bold text-amber-300">1. تسجيل الحساب واللاعب</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[11px] shrink-0">
                2
              </div>
              <span className="font-bold text-white">2. سداد الاشتراك وتأكيد الباقة</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-400">
              <div className="h-6 w-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                3
              </div>
              <span>3. اعتماد المدير وبدء التدريب</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ROW 1: PARENT HERO BANNER OR LOCKED PENDING STATE
         ========================================================================= */}
      {isPendingApproval ? (
        <div className="rounded-2xl bg-[#0e1720]/80 border border-slate-800 p-8 md:p-14 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-white">
              بانتظار تأكيد واعتماد المدير لفتح بيانات وجدول اللاعب
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              جدول التدريبات والمباريات، كشف الحضور الميداني، والتقارير الفنية والبدنية الخاصة باللاعب ({playerName}) ستكون متاحة هنا فور قيام مدير الأكاديمية بتأكيد واعتماد التحويل.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/parent/payments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>مراجعة إيصال السداد وسند القبض</span>
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <span>التحقق من حالة الاعتماد ⟳</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative min-h-[170px] md:min-h-[190px] rounded-2xl overflow-hidden shadow-md flex items-center bg-[#0c1219] border border-amber-500/25">
        {/* Background Image with Dark Obsidian & Gold Pitch Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-stadium.jpg"
            alt="ملعب الأكاديمية"
            fill
            priority
            className="object-cover object-center mix-blend-overlay opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070d14] via-[#0d1622]/95 to-[#070d14]/95" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 w-full p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Right Side (RTL start): Welcome to Parent Portal */}
          <div className="text-start space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>مرحباً بك {user?.fullName ? `أ. ${user.fullName.split(" ")[0]}` : "في لوحة متابعة ولي الأمر"}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-lg shadow-amber-500/20">
                <Image src="/images/logo.png" alt="FIFA FC ACADEMY" fill className="object-cover" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-amber-400 tracking-wider font-sans">
                FIFA FC ACADEMY
              </h2>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              معاً نحو تطوير مهارات اللاعب ({playerName}) وتحقيق أهدافه الرياضية والأخلاقية
            </p>
          </div>

          {/* Left Side (RTL end): Print Report Button */}
          <div className="self-end md:self-center flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs md:text-sm px-5 py-3 shadow-lg shadow-amber-950/40 border border-amber-400/30 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة التقرير الفني المعتمد</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: CHILD IDENTITY BAR
         ========================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 md:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Right Section (RTL start): Player Avatar & Info */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Circular Player Photo with Jersey */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden">
            <div className="flex flex-col items-center justify-center text-amber-900 font-black">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-[#1a1405] text-amber-400 text-[9px] font-black text-center py-0.5 border-t border-amber-500/30">
              10
            </div>
          </div>

          {/* Jersey #10 Emblem */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xs relative">
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-amber-600 leading-none">10</span>
              <span className="text-[9px] font-bold text-amber-500 mt-0.5">⚽</span>
            </div>
          </div>

          {/* Player Name and Group */}
          <div className="text-start">
            <h3 className="text-lg md:text-xl font-black text-slate-900">
              {playerName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>{groupName}</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">
                {isSubscribed ? activeSubscription?.plan_name : "بانتظار سداد الباقة"}
              </span>
            </div>
          </div>
        </div>

        {/* Left Section (RTL end): Active Player Status Badge */}
        <div className="self-end sm:self-center flex items-center gap-2">
          {isSubscribed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>اشتراك ساري حتى {activeSubscription?.end_date ? formatDate(activeSubscription.end_date) : "نهاية الشهر"}</span>
            </span>
          ) : (
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5 text-amber-600" />
              <span>تفعيل الاشتراك الآن</span>
            </Link>
          )}
        </div>
      </div>

      {/* =========================================================================
          ROW 3: 4 METRIC STAT CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 text-start shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">نسبة الحضور الميداني</span>
            <div className="text-2xl font-black text-slate-900">
              {isSubscribed ? "95%" : "100%"}
            </div>
            <span className="text-[11px] text-amber-700 font-bold block">
              {isSubscribed ? "حضور منتظم دون غياب" : "مسجل في الحصة القادمة"}
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Skill Score */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 text-start shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">التقييم الفني العام</span>
            <div className="text-2xl font-black text-slate-900">
              {latestEval ? `${latestEval.overall_score} / 10` : "8.8 / 10"}
            </div>
            <span className="text-[11px] text-purple-700 font-bold block">
              مستوى تصاعدي ممتاز ⭐
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
            <Star className="h-6 w-6 fill-purple-600" />
          </div>
        </div>

        {/* Card 3: Training Sessions */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 text-start shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">الحصص المكتملة</span>
            <div className="text-2xl font-black text-slate-900">
              {isSubscribed ? "12 حصة" : "بانتظار البدء"}
            </div>
            <span className="text-[11px] text-blue-700 font-bold block">
              متبقي 4 حصص هذا الشهر
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Subscription Status */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 text-start shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">حالة الاشتراك المالي</span>
            <div className="text-xl font-black text-slate-900 truncate max-w-[140px]">
              {isSubscribed ? "ساري ومعتمد" : "غير مفعل"}
            </div>
            <span className="text-[11px] text-slate-500 block">
              {isSubscribed ? "تم سداد الرسوم" : "سدد عبر إنستاباي أو نقداً"}
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: NEXT SESSION & QUICK ACTIONS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Next Training Session Card */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 text-start space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span>الحصة التدريبية القادمة</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              تمرين مجدول
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 flex flex-col items-center justify-center font-black shadow-md shadow-amber-950/20">
                <span className="text-xs">اليوم</span>
                <span className="text-[10px]">٤:٣٠ م</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  تدريب {groupName} — التركيز على التمرير والسرعات
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>المكان: الملعب الرئيسي (العشب الطبيعي)</span>
                  <span>•</span>
                  <span>المدرب: كابتن محمود</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Portal Navigation Card */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 text-start space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>روابط سريعة لحسابك</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/parent/children"
              className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all font-bold text-slate-800 flex items-center justify-between"
            >
              <span>قائمة الأبناء</span>
              <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <Link
              href="/parent/payments"
              className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all font-bold text-slate-800 flex items-center justify-between"
            >
              <span>إيصالات السداد</span>
              <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <Link
              href="/parent/sessions"
              className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all font-bold text-slate-800 flex items-center justify-between"
            >
              <span>جدول التمارين</span>
              <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <Link
              href="/parent/report"
              className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all font-bold text-slate-800 flex items-center justify-between"
            >
              <span>التقرير الفني الشامل</span>
              <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
      </>
      )}

      {/* =========================================================================
          PRINT REPORT MODAL (Interactive & High Quality)
         ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 md:p-8 text-start space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-md">
                  <Image src="/images/logo.png" alt="FIFA FC ACADEMY" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    FIFA FC ACADEMY — شهادة التقييم الفني المعتمدة
                  </h3>
                  <span className="text-[10px] text-amber-700 font-bold block">
                    الشهادة الرسمية لتطور أداء اللاعب في الأكاديمية
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Certificate Content */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-base text-slate-900">{playerName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{groupName} — تقرير شهر أكتوبر 2026</p>
                </div>
                <div className="text-end">
                  <span className="text-[10px] text-slate-400 block">المعدل العام:</span>
                  <span className="text-xl font-black text-amber-600">8.9 / 10</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">المهارات الفنية (تمرير، مراوغة):</span>
                  <span className="font-bold text-slate-900 mt-1 block">9.0 / 10</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">اللياقة البدنية والسرعة:</span>
                  <span className="font-bold text-slate-900 mt-1 block">8.5 / 10</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">الوعي والتمركز التكتيكي:</span>
                  <span className="font-bold text-slate-900 mt-1 block">8.8 / 10</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">الانضباط والروح الرياضية:</span>
                  <span className="font-bold text-slate-900 mt-1 block">9.5 / 10</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                <p className="font-bold text-amber-900">ملاحظات الكابتن محمود المسؤول:</p>
                <p className="mt-1 italic leading-relaxed">
                  "اللاعب {playerName} يمتلك شغفاً استثنائياً وسرعة استيعاب تكتيكية ممتازة. نوصي باستمرار التدريبات على التسديد المباشر بالقدم اليسرى."
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-5 py-2.5 text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>طباعة التقرير الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

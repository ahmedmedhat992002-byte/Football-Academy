import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { getSessions } from "@/lib/actions/sessions";
import { getSubscriptions, getPayments, getFinancialSummary } from "@/lib/actions/subscriptions";
import { getEvaluations } from "@/lib/actions/evaluations";
import { getCoaches } from "@/lib/actions/coaches";
import { formatNumber, formatCurrency } from "@/lib/i18n/formatters";
import { t } from "@/lib/i18n/translations";
import {
  Users,
  Calendar,
  Coins,
  FileWarning,
  TrendingUp,
  ChevronLeft,
  Shield,
  Clock,
  UserCheck,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  Trophy,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const userName = user?.fullName || "مدير الأكاديمية";

  // Fetch all data in parallel
  const [players, groups, sessions, subscriptions, payments, evaluations, financialSummary, coaches] =
    await Promise.all([
      getPlayers(),
      getGroups(),
      getSessions(),
      getSubscriptions(),
      getPayments(),
      getEvaluations(),
      getFinancialSummary(),
      getCoaches(),
    ]);

  // Compute stats
  const totalPlayers = players.length;
  const totalGroups = groups.length;
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.attendance_taken).length;
  const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100 * 10) / 10 : 0;
  const totalRevenue = financialSummary.totalCollectedThisMonth;
  const overdueSubscriptions = subscriptions.filter((s) => s.status === "overdue").length;
  const pendingApprovalsCount = subscriptions.filter((s) => s.status === "pending_approval").length;
  const pendingCoachesCount = coaches.filter((c) => c.status === "pending_approval").length;
  const totalEvaluations = evaluations.length;

  // Recent activity from real data
  const recentPayments = payments.slice(0, 2);
  const recentEvaluations = evaluations.slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Pending Coach Approval Priority Alert for Academy Director */}
      {pendingCoachesCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-950 via-[#1c1808] to-yellow-950 border-2 border-yellow-500/60 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl text-start">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0 border border-yellow-500/40">
              <Users className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-black border border-yellow-500/30 mb-1">
                <span>طلب انضمام للجهاز الفني</span>
              </div>
              <h3 className="font-black text-white text-base">
                يوجد ({pendingCoachesCount}) طلبات انضمام مدربين بانتظار موافقتك واعتمادك!
              </h3>
              <p className="text-xs text-yellow-200/80 mt-0.5">
                حسابات المدربين مغلقة ولن يتمكنوا من دخول المنظومة أو كشوفات اللاعبين إلا بعد اعتمادك.
              </p>
            </div>
          </div>
          <Link
            href="/admin/coaches"
            className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-yellow-950 transition-all flex items-center gap-2"
          >
            <span>مراجعة واعتماد المدربين الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Pending Approval Priority Alert for Academy Director */}
      {pendingApprovalsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-950 via-[#1c1408] to-amber-950 border-2 border-amber-500/60 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl text-start">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30 mb-1">
                <span>تنبيه اعتماد الاشتراكات</span>
              </div>
              <h3 className="font-black text-white text-base">
                يوجد ({pendingApprovalsCount}) طلبات اشتراك وسداد بانتظار موافقتك وتأكيدك!
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                حسابات أولياء الأمور مغلقة ومحمية حالياً ولن تفتح إلا بعد اعتمادك وتأكيدك للاشتراك.
              </p>
            </div>
          </div>
          <Link
            href="/admin/subscriptions"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-amber-950 transition-all flex items-center gap-2"
          >
            <span>مراجعة واعتماد الاشتراكات الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* =========================================================================
          ROW 1: HERO SECTION (Wide Stadium Banner + Side Motivation Player Card)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Stadium Hero Banner (8 cols / ~70%) */}
        <div className="lg:col-span-8 relative min-h-[220px] md:min-h-[240px] rounded-2xl overflow-hidden shadow-md flex items-center bg-[#0c1219] border border-amber-500/25">
          {/* Background Image with Obsidian & Gold Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-stadium.jpg"
              alt="ملعب الأكاديمية"
              fill
              priority
              className="object-cover object-center mix-blend-overlay opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070d14] via-[#0d1622]/95 to-[#070d14]/95" />
          </div>

          {/* Banner Inner Content */}
          <div className="relative z-10 w-full p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Right Side (RTL start): Welcome & Title */}
            <div className="text-start space-y-2 max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                <span>مرحباً بك يا {userName}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-lg shadow-amber-500/25">
                  <Image
                    src="/images/logo.png"
                    alt="FIFA FC ACADEMY"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-amber-400 tracking-wider font-sans">
                    FIFA FC ACADEMY
                  </h2>
                  <span className="text-[11px] text-amber-300/90 font-bold block">
                    لوحة التحكم والإدارة المركزية
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                تتيح لك متابعة أهم الإحصائيات، الحضور، المراكز، والتقارير العامة.
              </p>
            </div>

            {/* Left Side (RTL end): Inspirational Quote */}
            <div className="text-start md:text-end self-end md:self-center border-t md:border-t-0 md:border-s border-amber-500/30 pt-3 md:pt-0 md:ps-6">
              <p className="text-xs md:text-sm font-semibold text-white/90 leading-relaxed">
                النجاح لا يأتي صدفة ..
                <br />
                <span className="font-bold text-white">&quot;بل من الانضباط والعمل المستمر&quot;</span>
              </p>
              <div className="mt-2 h-1 w-12 bg-amber-400 rounded-full md:ms-auto" />
            </div>
          </div>
        </div>

        {/* Side Card: Player #10 Motivation (4 cols / ~30%) */}
        <div className="lg:col-span-4 relative min-h-[220px] md:min-h-[240px] rounded-2xl overflow-hidden shadow-md bg-[#0e171f] flex flex-col justify-end p-6 group">
          {/* Background Player Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/player-10.jpg"
              alt="لاعب كرة قدم رقم 10"
              fill
              priority
              className="object-cover object-top brightness-90 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          {/* Overlaid Motto */}
          <div className="relative z-10 text-start space-y-1">
            <p className="text-lg font-black text-white tracking-wide">
              الانضباط
            </p>
            <p className="text-base font-extrabold text-amber-400">
              &quot;يصنع الفرق&quot;
            </p>
            <div className="h-1 w-10 bg-amber-400 rounded-full mt-1" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: 4 STAT METRICS CARDS (DYNAMIC DATA)
         ========================================================================= */}
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
                <span>{formatNumber(payments.length)} عملية دفع</span>
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

      {/* =========================================================================
          ROW 3: MIDDLE SPLIT (Module Readiness 8 Cols + Recent Activity 4 Cols)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Column: Readiness of Dashboard Modules (8 cols / ~70%) */}
        <div className="lg:col-span-8 space-y-5">
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
                    {formatNumber(subscriptions.length)} اشتراك
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

          {/* ROW 4: 4 BOTTOM FOOTBALL FEATURE TILES */}
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
                <p className="text-[10px] text-slate-300">{formatNumber(completedSessions)} مكتملة من {formatNumber(totalSessions)}</p>
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
                <p className="text-[10px] text-slate-300">{formatNumber(totalEvaluations)} تقييم مسجل</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Side Column: Recent Activity Feed (4 cols / ~30%) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-start">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Clock className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-extrabold text-slate-900">أحدث الأنشطة</h3>
            </div>

            {/* Activity Items List - Dynamic */}
            <div className="mt-3 space-y-3">
              {/* Real Payment Activities */}
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                      <Coins className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        دفعة من {payment.player_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-slate-400" />
                </div>
              ))}

              {/* Real Evaluation Activities */}
              {recentEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        تقييم {evaluation.player_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        المعدل: {evaluation.overall_score}/10
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-slate-400" />
                </div>
              ))}

              {/* Players Count Summary */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">إجمالي اللاعبين المسجلين</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatNumber(totalPlayers)} لاعب في {formatNumber(totalGroups)} مجموعات</p>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Bottom Link: View All Activities */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/admin/sessions"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 py-1 transition-colors cursor-pointer"
            >
              <span>عرض كل الحصص</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

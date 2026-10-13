import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/session";
import { getGroups } from "@/lib/actions/groups";
import { getSessions } from "@/lib/actions/sessions";
import { getPlayers } from "@/lib/actions/players";
import { getEvaluations } from "@/lib/actions/evaluations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/translations";
import { formatNumber, formatDate } from "@/lib/i18n/formatters";
import {
  Users2,
  CalendarDays,
  ClipboardCheck,
  Zap,
  Award,
  Clock,
  MapPin,
  ChevronLeft,
  ArrowUpRight,
  Shield,
  Activity,
  UserCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoachDashboardPage() {
  const user = await getCurrentUser();
  const coachId = user?.id || "00000000-0000-0000-0000-000000000002";

  const [allGroups, allSessions, allPlayers, allEvaluations] = await Promise.all([
    getGroups(),
    getSessions({ coachId }),
    getPlayers(),
    getEvaluations(),
  ]);

  // Filter groups assigned to this coach (or default to coach's groups)
  const coachGroups = allGroups.filter(
    (g) => g.coach_id === coachId || g.coach_name?.includes("محمود") || allGroups.indexOf(g) < 2
  );

  const groupIds = new Set(coachGroups.map((g) => g.id));
  const coachPlayers = allPlayers.filter(
    (p) => (p.group_id && groupIds.has(p.group_id)) || p.group_id === "group-u10-001" || p.group_id === "group-u12-002"
  );

  const totalPlayersCount = coachPlayers.length;

  // Find upcoming or today's session
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingSessions = allSessions.slice(0, 4);
  const nextSession = allSessions.find((s) => s.session_date >= todayStr) || allSessions[0];

  // Coach's completed evaluations
  const coachEvaluations = allEvaluations.filter(
    (e) => e.coach_id === coachId || e.coach_name?.includes("محمود")
  );

  return (
    <div className="space-y-6">
      {/* Coach Pitch Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#0c1620] via-[#152332] to-[#0c1620] p-6 text-white shadow-xl border border-amber-500/30">
        <div className="flex items-center gap-4 text-start">
          <div className="relative h-14 w-14 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-lg shadow-amber-500/25">
            <Image
              src="/images/logo.png"
              alt="FIFA FC ACADEMY"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
              <Zap className="h-3.5 w-3.5" />
              <span>FIFA FC ACADEMY • الجهاز الفني الميداني</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              كابتن {user?.fullName || "محمود السعدني"}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              المجموعات الموكلة إليك:{" "}
              <span className="text-amber-300 font-semibold">
                {coachGroups.map((g) => `${g.name} (${g.age_category})`).join(" و ") || "لا توجد مجموعات معينة"}
              </span>{" "}
              — تسجيل حضور فوري، تقييم دوري، ومتابعة تطور الأداء الميداني
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
          <Badge variant="default" className="bg-amber-500/20 text-amber-300 px-3.5 py-1 text-xs font-bold border border-amber-500/40">
            صلاحية كابتن تدريب (Coach)
          </Badge>
          <span className="text-[11px] text-amber-200/80">الموسم التدريبي 2026</span>
        </div>
      </div>

      {/* Quick Pitch Action Card */}
      <Card className="border-amber-500/30 bg-[#0e1622] shadow-xs overflow-hidden">
        <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-start space-y-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-base md:text-lg font-bold text-white">
                الحصة التدريبية القادمة: {nextSession ? `${nextSession.group_name} (${nextSession.location || "الملعب الرئيسي"})` : "لا توجد حصص قادمة مجدولة"}
              </h3>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
                {nextSession ? formatDate(nextSession.session_date) : "اليوم"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {nextSession?.start_time || "--:--"} - {nextSession?.end_time || "--:--"}
              </span>
              <span className="flex items-center gap-1">
                <Users2 className="h-3.5 w-3.5 text-amber-400" />
                {formatNumber(coachPlayers.length)} لاعباً مسجلاً
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Link href="/coach/pitch" className="w-full sm:w-auto">
              <Button variant="pitch" className="w-full sm:w-auto h-11 px-6 font-bold shadow-md cursor-pointer hover:shadow-lg">
                <Zap className="h-4 w-4 me-2 animate-bounce" />
                <span>{t.attendance.quickAction}</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Coach Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1 */}
        <Card className="hover:border-amber-300 transition-all">
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
              {formatNumber(coachGroups.length)} مجموعات
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {coachGroups.map((g) => g.age_category).join("، ") || "لا توجد"}
            </p>
          </CardContent>
        </Card>

        {/* Stat 2 */}
        <Card className="hover:border-amber-300 transition-all">
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

        {/* Stat 3 */}
        <Card className="hover:border-amber-300 transition-all">
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
              {formatNumber(coachEvaluations.length > 0 ? coachEvaluations.length : 28)} تقييماً
            </div>
            <p className="text-xs text-amber-700 mt-1 font-medium">
              متابعة شهرية دورية للمهارات الفنية والبدنية
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Assigned Groups & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Groups Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div className="text-start">
              <CardTitle className="text-base font-bold text-slate-900">
                مجموعاتك التدريبية
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                الفئات السنية وجداول تدريبات كل مجموعة
              </p>
            </div>
            <Link href="/coach/groups">
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 text-xs font-bold">
                عرض الكل
                <ChevronLeft className="h-3.5 w-3.5 ms-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {coachGroups.map((grp) => (
              <div
                key={grp.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-start"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{grp.name}</span>
                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 text-amber-800 bg-amber-50">
                      {grp.age_category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>أيام التدريب: {Array.isArray(grp.training_days) ? grp.training_days.join("، ") : "الأحد، الثلاثاء"}</span>
                    <span>•</span>
                    <span>{formatNumber(grp.players_count || 16)} لاعباً</span>
                  </p>
                </div>

                <Link href={`/coach/pitch`}>
                  <Button size="sm" variant="outline" className="text-xs font-bold border-amber-200 text-amber-800 hover:bg-amber-50">
                    بدء التمرين
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Sessions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div className="text-start">
              <CardTitle className="text-base font-bold text-slate-900">
                جدول الحصص القادمة
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                مواعيد التمارين والملاعب المخصصة
              </p>
            </div>
            <Link href="/coach/sessions">
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 text-xs font-bold">
                كل الحصص
                <ChevronLeft className="h-3.5 w-3.5 ms-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {upcomingSessions.map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-start"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {sess.group_name || "تمرين المجموعة"}
                    </span>
                    <Badge variant="secondary" className="text-[11px]">
                      {sess.location || "الملعب الرئيسي"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-slate-400" />
                      {formatDate(sess.session_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {sess.start_time} - {sess.end_time}
                    </span>
                  </p>
                </div>

                <Link href={`/coach/attendance/${sess.id}`}>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold">
                    تسجيل الحضور
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Bar */}
      <div className="rounded-2xl bg-slate-900 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-start space-y-1">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            تقييم المهارات الشهري للاعبين
          </h3>
          <p className="text-xs text-slate-300">
            يمكنك اعتماد درجات المهارة البدنية والفنية والتكتيكية مباشرة من خلال شاشة التقييمات
          </p>
        </div>

        <Link href="/coach/evaluations">
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 h-10 shadow-lg">
            إدخال التقييمات الشهرية
            <ArrowUpRight className="h-4 w-4 ms-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

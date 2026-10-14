import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/session";
import { getEvaluations } from "@/lib/actions/evaluations";
import { getPlayers } from "@/lib/actions/players";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { formatDate } from "@/lib/i18n/formatters";
import { PrintReportButton } from "@/components/parent/print-report-button";
import {
  Award,
  Star,
  TrendingUp,
  Clock,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ParentReportPage() {
  const user = await getCurrentUser();
  const parentId = user?.id;

  const [allPlayers, allEvaluations, allSubscriptions] = await Promise.all([
    getPlayers(),
    getEvaluations(),
    getSubscriptions(),
  ]);

  // Find parent's children
  const children = allPlayers.filter(
    (p) => parentId && p.parent_id === parentId
  );
  const childIds = new Set(children.map((c) => c.id));

  const childSubs = allSubscriptions.filter((s) => childIds.has(s.player_id));
  const hasActiveSub = childSubs.some((s) => s.status === "active");
  const hasPendingSub = childSubs.some((s) => s.status === "pending_approval");

  const childEvaluations = allEvaluations.filter(
    (e) => childIds.has(e.player_id)
  );

  const latestEval = childEvaluations[0];
  const previousEval = childEvaluations[1];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0c1219] via-[#101b26] to-[#0c1219] p-6 rounded-2xl border border-amber-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative h-12 w-12 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-lg shadow-amber-500/20">
            <Image
              src="/images/logo.png"
              alt="FIFA FC ACADEMY"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-0.5">
              <span>FIFA FC ACADEMY • بطاقة التقييم المعتمدة</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black">
              بطاقة تقييم أداء وتطور اللاعب
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              متابعة المعايير المهارية، البدنية، والتكتيكية الصادرة عن الكابتن المسؤول
            </p>
          </div>
        </div>

        {hasActiveSub && (
          <div className="print:hidden">
            <PrintReportButton />
          </div>
        )}
      </div>

      {!hasActiveSub ? (
        hasPendingSub ? (
          <div className="bg-[#121008] border-2 border-amber-500/50 rounded-2xl p-8 md:p-12 text-center space-y-4">
            <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            <h3 className="text-lg md:text-xl font-black text-white">
              التقرير الفني بانتظار اعتماد المدير لاشتراكك ⏳
            </h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              تم استلام سداد الاشتراك بنجاح. سيتم فتح بطاقة التقييم ومؤشرات المهارات واللياقة البدنية فور قيام مدير الأكاديمية باعتماد الاشتراك وانطلاق الحصص التدريبية.
            </p>
            <div className="pt-2">
              <Link
                href="/parent/payments"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
              >
                <span>عرض إيصال السداد المالي</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#0e1720]/80 border border-[#1e293b] rounded-2xl p-8 md:p-12 text-center space-y-4">
            <Lock className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base md:text-lg font-black text-white">
              التقارير الفنية تتطلب اشتراكاً سارياً
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              يصدر المدربون تقارير دورية شهرية عن اللاعبين المشتركين في باقات الأكاديمية لمتابعة التطور الميداني.
            </p>
            <div className="pt-2">
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md"
              >
                <span>الاشتراك وتفعيل الحساب</span>
              </Link>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Latest Evaluation Report Card */}
          {latestEval ? (
        <div className="bg-[#0e1720]/90 border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
            <div>
              <span className="text-xs font-semibold text-amber-400">
                التقرير الشهري المعتمد
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                {latestEval.player_name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{latestEval.group_name}</span>
                <span>•</span>
                <span>المدرب المقيّم: {latestEval.coach_name}</span>
                <span>•</span>
                <span>تاريخ التقييم: {formatDate(latestEval.eval_date)}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              <div>
                <span className="text-xs text-slate-400 block font-normal">المعدل العام</span>
                <span className="text-2xl font-black">{latestEval.overall_score} / 10</span>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Technical */}
            <div className="p-4 rounded-xl bg-[#121c27] border border-[#1e293b]">
              <span className="text-xs text-slate-400">المهارات الفنية</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {latestEval.technical} <span className="text-xs text-slate-500">/ 10</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(latestEval.technical / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Physical */}
            <div className="p-4 rounded-xl bg-[#121c27] border border-[#1e293b]">
              <span className="text-xs text-slate-400">اللياقة البدنية</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {latestEval.physical} <span className="text-xs text-slate-500">/ 10</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(latestEval.physical / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Tactical */}
            <div className="p-4 rounded-xl bg-[#121c27] border border-[#1e293b]">
              <span className="text-xs text-slate-400">الوعي التكتيكي</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {latestEval.tactical} <span className="text-xs text-slate-500">/ 10</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${(latestEval.tactical / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Discipline */}
            <div className="p-4 rounded-xl bg-[#121c27] border border-[#1e293b]">
              <span className="text-xs text-slate-400">الانضباط والروح الرياضية</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {latestEval.discipline} <span className="text-xs text-slate-500">/ 10</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(latestEval.discipline / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Coach Recommendations */}
          {latestEval.notes && (
            <div className="p-4 rounded-xl bg-[#121c27] border border-[#1e293b]">
              <h3 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                توجيهات وملاحظات الكابتن الفنية
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &quot;{latestEval.notes}&quot;
              </p>
            </div>
          )}

          {/* Progression Comparison */}
          {previousEval && (
            <div className="pt-2 border-t border-[#1e293b]/70 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                تطور الأداء مقارنة بالشهر السابق ({previousEval.overall_score} ➔ {latestEval.overall_score})
              </span>
              <span>تاريخ التقييم السابق: {formatDate(previousEval.eval_date)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0e1720]/50 rounded-2xl border border-[#1e293b] text-slate-400 text-xs">
          لا توجد تقارير تقييم دورية معتمدة مسجلة حالياً
        </div>
      )}
        </>
      )}
    </div>
  );
}

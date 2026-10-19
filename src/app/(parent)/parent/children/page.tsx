import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { getPlayerBadges } from "@/lib/actions/badges";
import { getMatches } from "@/lib/actions/matches";
import { formatDate } from "@/lib/i18n/formatters";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  User,
  Users,
  Calendar,
  Shield,
  ShieldCheck,
  Award,
  CreditCard,
  ChevronLeft,
  Sparkles,
  Shirt,
  Trophy,
  HeartPulse,
  Star,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ParentChildrenPage() {
  const user = await getCurrentUser();
  const parentId = user?.id;

  const [allPlayers, allGroups, allSubscriptions, allBadges, allMatches] =
    await Promise.all([
      getPlayers(),
      getGroups(),
      getSubscriptions(),
      getPlayerBadges(),
      getMatches({ status: "upcoming" }),
    ]);

  // Find parent's children (or fallback to all if parentId matches or demo mode)
  const children = allPlayers.filter(
    (p) => parentId && p.parent_id === parentId
  );

  // Fallback: if user is logged in as parent and has no players specifically linked by UUID, show demo child or first registered
  const displayChildren =
    children.length > 0
      ? children
      : allPlayers.filter(
          (p) =>
            p.parent_name === user?.fullName ||
            p.notes?.includes(user?.fullName || "")
        );

  const targetChildren = displayChildren.length > 0 ? displayChildren : children;

  // Build enriched children data
  const enrichedChildren = targetChildren.map((child) => {
    const group = allGroups.find((g) => g.id === child.group_id);
    const subscription = allSubscriptions.find((s) => s.player_id === child.id);
    const badges = allBadges.filter((b) => b.player_id === child.id);
    const groupMatches = allMatches.filter((m) => m.group_id === child.group_id);

    return {
      ...child,
      groupName: group?.name || child.group_name || "غير محدد",
      subscriptionStatus: subscription?.status || "none",
      subscriptionEnd: subscription?.end_date,
      position: child.notes?.includes("حارس")
        ? "حارس مرمى"
        : child.notes?.includes("مهاجم")
        ? "مهاجم"
        : "صانع ألعاب",
      jersey_number: (child as any).jersey_number || "10",
      kit_size: (child as any).kit_size || "M",
      kit_received: (child as any).kit_received || false,
      badges,
      upcomingMatches: groupMatches,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0c1620] via-[#152332] to-[#0c1620] p-6 rounded-2xl border border-amber-500/30 text-white shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>بوابة ولي الأمر الرقمية</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black">
          أبنائي المسجلين في الأكاديمية
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          متابعة بيانات وتألق أبنائك، أوسمة الشرف، حالة الزي الرياضي، والمباريات القادمة
        </p>
      </div>

      {/* Children List */}
      {enrichedChildren.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {enrichedChildren.map((child) => (
            <Card
              key={child.id}
              className="p-5 bg-[#0e1720]/90 border-[#1e293b] hover:border-amber-500/40 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Player Avatar */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-500/15 border-2 border-amber-500/40">
                    <User className="h-7 w-7 text-amber-400" />
                    {child.jersey_number && (
                      <div className="absolute -bottom-1 inset-x-0 bg-amber-500 text-slate-950 text-[9px] font-black text-center py-0.5 rounded-b-full">
                        #{child.jersey_number}
                      </div>
                    )}
                  </div>
                  <div className="text-start">
                    <h3 className="text-lg font-black text-white">
                      {child.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{child.groupName}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  className={
                    child.subscriptionStatus === "active"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : child.subscriptionStatus === "pending_approval"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }
                >
                  {child.subscriptionStatus === "active"
                    ? "اشتراك ساري ✅"
                    : child.subscriptionStatus === "pending_approval"
                    ? "بانتظار الاعتماد ⏳"
                    : "غير مشترك"}
                </Badge>
              </div>

              {/* Injury Warning if any */}
              {child.active_injury && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-start flex items-center gap-2 text-xs font-bold text-rose-300">
                  <HeartPulse className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>
                    اللاعب يخضع لبرنامج تأهيلي إثر إصابة ({child.active_injury.injury_type})
                  </span>
                </div>
              )}

              {/* Earned Badges Showcase */}
              {child.badges.length > 0 && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 text-start space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>أوسمة الشرف والتكريم ⭐ ({child.badges.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {child.badges.map((b) => (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141e2b] border border-amber-500/40 text-amber-300 text-xs font-black shadow-xs"
                      >
                        <span>{b.badge_title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Player Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-start">
                <div className="p-3 rounded-xl bg-[#121c27] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block">تاريخ الميلاد</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">
                    {child.birth_date ? formatDate(child.birth_date) : "غير محدد"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#121c27] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block">المركز المفضل</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">
                    {child.position || "غير محدد"}
                  </span>
                </div>

                {/* Kit Status */}
                <div className="p-3 rounded-xl bg-[#121c27] border border-[#1e293b] col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        الزي الرياضي الرسمي
                      </span>
                      <span className="text-xs font-bold text-white">
                        مقاس {child.kit_size}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      child.kit_received
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {child.kit_received ? "تم الاستلام ✅" : "بانتظار الاستلام ⏳"}
                  </span>
                </div>

                {child.subscriptionEnd && (
                  <div className="p-3 rounded-xl bg-[#121c27] border border-[#1e293b] col-span-2">
                    <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-amber-400" />
                      صلاحية الاشتراك
                    </span>
                    <span className="text-xs font-bold text-amber-400 mt-0.5 block">
                      حتى {formatDate(child.subscriptionEnd)}
                    </span>
                  </div>
                )}
              </div>

              {/* Upcoming Matches */}
              {child.upcomingMatches.length > 0 && (
                <div className="p-3 rounded-xl bg-[#121c27] border border-[#1e293b] text-start space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" />
                    المباراة القادمة للفريق:
                  </span>
                  <div className="text-xs text-white flex items-center justify-between">
                    <span className="font-black">ضد: {child.upcomingMatches[0].opponent}</span>
                    <span className="text-slate-400 text-[11px]">
                      {child.upcomingMatches[0].match_date} - {child.upcomingMatches[0].match_time}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="pt-2 border-t border-[#1e293b] flex items-center gap-2">
                <Link
                  href="/parent/report"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                >
                  <Award className="h-3.5 w-3.5" />
                  التقرير الفني
                </Link>
                <Link
                  href="/parent/payments"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  المدفوعات
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0e1720]/50 rounded-2xl border border-[#1e293b]">
          <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-3" />
          <p className="text-base font-black text-white">
            لا يوجد لاعب مسجل تحت هذا الحساب بعد
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            يمكنك تسجيل طفلك والاشتراك في باقات الأكاديمية التدريبية الآن بضغطة واحدة.
          </p>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>تسجيل واشتراك لاعب جديد</span>
          </Link>
        </div>
      )}
    </div>
  );
}

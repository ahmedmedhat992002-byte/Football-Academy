import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getSessions } from "@/lib/actions/sessions";
import { getPlayers } from "@/lib/actions/players";
import { getGroups } from "@/lib/actions/groups";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Hourglass,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ParentSessionsPage() {
  const user = await getCurrentUser();
  const parentId = user?.id;

  const [allPlayers, allGroups, allSessions, allSubscriptions] = await Promise.all([
    getPlayers(),
    getGroups(),
    getSessions(),
    getSubscriptions(),
  ]);

  // Find parent's children
  const children = allPlayers.filter(
    (p) => parentId && p.parent_id === parentId
  );
  const childIds = new Set(children.map((c) => c.id));
  const childGroupIds = new Set(children.map((c) => c.group_id).filter(Boolean));

  const childSubs = allSubscriptions.filter((s) => childIds.has(s.player_id));
  const hasActiveSub = childSubs.some((s) => s.status === "active");
  const hasPendingSub = childSubs.some((s) => s.status === "pending_approval");

  // Filter sessions for children's groups
  const childSessions = allSessions.filter(
    (s) => childGroupIds.has(s.group_id)
  );

  // Sort sessions by date (newest first)
  const sortedSessions = [...childSessions].sort(
    (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0c1620] via-[#152332] to-[#0c1620] p-6 rounded-2xl border border-amber-500/30 text-white shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>بوابة ولي الأمر الرقمية</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black">
          جدول الحصص التدريبية لأبنائك
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          متابعة مواعيد التدريبات وحالة حضور اللاعب في كل حصة
        </p>
      </div>

      {/* Lock check */}
      {!hasActiveSub ? (
        hasPendingSub ? (
          <div className="bg-[#121008] border-2 border-amber-500/50 rounded-2xl p-8 md:p-12 text-center space-y-4">
            <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            <h3 className="text-lg md:text-xl font-black text-white">
              جدول الحصص بانتظار اعتماد المدير لاشتراكك ⏳
            </h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              تم استلام سداد الاشتراك بنجاح وهو قيد المراجعة والاعتماد من قبل إدارة الأكاديمية. سيفتح جدول الحصص والتمارين بالكامل فور قيام المدير بتأكيد الاعتماد.
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
              الوصول لجدول التدريبات يتطلب تفعيل الاشتراك
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              لم يتم تفعيل باقة تدريب بعد. يرجى اختيار إحدى باقات الأكاديمية والاشتراك لتحديد المجموعة وحصص التدريب.
            </p>
            <div className="pt-2">
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950"
              >
                <span>الاشتراك وتفعيل الحساب</span>
              </Link>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#0e1720]/90 border-[#1e293b] text-start">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">إجمالي الحصص</p>
              <p className="text-xl font-black text-white">{sortedSessions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[#0e1720]/90 border-[#1e293b] text-start">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">الحصص المكتملة</p>
              <p className="text-xl font-black text-white">
                {sortedSessions.filter((s) => s.attendance_taken).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[#0e1720]/90 border-[#1e293b] text-start">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Hourglass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">قادمة / مجدولة</p>
              <p className="text-xl font-black text-white">
                {sortedSessions.filter((s) => !s.attendance_taken).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sessions List */}
      {sortedSessions.length > 0 ? (
        <div className="space-y-3">
          {sortedSessions.map((session) => {
            const group = allGroups.find((g) => g.id === session.group_id);
            const sessionDate = new Date(session.session_date);
            const isPast = sessionDate < now;
            const isCompleted = session.attendance_taken;

            return (
              <div
                key={session.id}
                className="p-4 rounded-xl bg-[#0e1720]/90 border border-[#1e293b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-500/30 transition-colors"
              >
                {/* Session Info */}
                <div className="flex items-center gap-4">
                  {/* Date Circle */}
                  <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-xl border ${isCompleted ? 'bg-amber-500/10 border-amber-500/30' : isPast ? 'bg-rose-500/10 border-rose-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                    <span className={`text-lg font-black ${isCompleted ? 'text-amber-400' : isPast ? 'text-rose-400' : 'text-blue-400'}`}>
                      {sessionDate.getDate()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {sessionDate.toLocaleDateString("ar-EG", { month: "short" })}
                    </span>
                  </div>

                  <div className="text-start">
                    <h4 className="text-sm font-bold text-white">
                      {session.group_name ? `تمرين ${session.group_name}` : "حصة تدريبية"}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group?.name || session.group_name || "—"}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.start_time || "—"}
                      </span>
                      {session.location && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  className={
                    isCompleted
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : isPast
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }
                >
                  {isCompleted ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      مكتملة
                    </span>
                  ) : isPast ? (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      فائتة
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Hourglass className="h-3 w-3" />
                      قادمة
                    </span>
                  )}
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0e1720]/50 rounded-2xl border border-[#1e293b]">
          <Calendar className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">
            لا توجد حصص مجدولة حالياً
          </p>
          <p className="text-xs text-slate-500 mt-1">
            سيتم عرض جدول الحصص فور إضافتها من قبل الإدارة
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}

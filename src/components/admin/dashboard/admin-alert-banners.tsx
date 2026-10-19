import React from "react";
import Link from "next/link";
import { Users, Clock, ChevronLeft } from "lucide-react";

interface AdminAlertBannersProps {
  pendingCoachesCount: number;
  pendingApprovalsCount: number;
}

export function AdminAlertBanners({
  pendingCoachesCount,
  pendingApprovalsCount,
}: AdminAlertBannersProps) {
  if (pendingCoachesCount === 0 && pendingApprovalsCount === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
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
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-yellow-950 active:scale-95 transition-all flex items-center gap-2"
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
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-amber-950 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>مراجعة واعتماد الاشتراكات الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

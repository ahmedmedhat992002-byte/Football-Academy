import React from "react";
import Link from "next/link";
import { formatNumber, formatCurrency } from "@/lib/i18n/formatters";
import type { PaymentRecord, Evaluation } from "@/lib/data/academy-store";
import {
  Coins,
  FileText,
  UserCheck,
  ChevronLeft,
  Clock,
} from "lucide-react";

interface AdminRecentActivityProps {
  recentPayments: PaymentRecord[];
  recentEvaluations: Evaluation[];
  totalPlayers: number;
  totalGroups: number;
}

export function AdminRecentActivity({
  recentPayments,
  recentEvaluations,
  totalPlayers,
  totalGroups,
}: AdminRecentActivityProps) {
  return (
    <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between text-start">
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
            <div
              key={payment.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
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
            <div
              key={evaluation.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
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
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatNumber(totalPlayers)} لاعب في {formatNumber(totalGroups)} مجموعات
                </p>
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
  );
}

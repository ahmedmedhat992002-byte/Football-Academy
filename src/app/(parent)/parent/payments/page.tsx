import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPayments, getSubscriptions } from "@/lib/actions/subscriptions";
import { getPlayers } from "@/lib/actions/players";
import { formatCurrency, formatDate } from "@/lib/i18n/formatters";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ParentPaymentsPage() {
  const user = await getCurrentUser();
  const parentId = user?.id;

  const [allPlayers, allPayments, allSubscriptions] = await Promise.all([
    getPlayers(),
    getPayments(),
    getSubscriptions(),
  ]);

  // Find parent's children
  const children = allPlayers.filter(
    (p) => parentId && p.parent_id === parentId
  );
  const childIds = new Set(children.map((c) => c.id));

  const parentPayments = allPayments.filter(
    (p) => p.player_id && childIds.has(p.player_id)
  );

  const parentSubscriptions = allSubscriptions.filter(
    (s) => childIds.has(s.player_id)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0c1620] via-[#152332] to-[#0c1620] p-6 rounded-2xl border border-amber-500/30 text-white shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>بوابة ولي الأمر الرقمية</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black">
          سجل المدفوعات والاشتراكات لأبنائك
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          استعراض إيصالات السداد المعتمدة وحالة اشتراك كل لاعب
        </p>
      </div>

      {/* Children Subscriptions Overview */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-400" />
          حالة الاشتراكات الحالية
        </h2>
        {parentSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parentSubscriptions.map((sub) => (
              <Card
                key={sub.id}
                className="p-5 bg-[#0e1720]/90 border-[#1e293b] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white text-base">
                      اللاعب: {sub.player_name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        sub.status === "active"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : sub.status === "pending_approval"
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {sub.status === "active"
                        ? "اشتراك سارٍ ومسدد"
                        : sub.status === "pending_approval"
                        ? "تم السداد — بانتظار اعتماد المدير ⏳"
                        : "بحاجة للتجديد"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{sub.group_name}</p>
                  <div className="text-sm font-semibold text-amber-400 mb-1">
                    الباقة: {sub.plan_name} ({formatCurrency(sub.plan_price)})
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    صالح من {formatDate(sub.start_date)} إلى {formatDate(sub.end_date)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-[#0e1720]/50 rounded-xl border border-[#1e293b]">
            <p className="text-xs text-slate-400">لا توجد اشتراكات مفعلة حالياً</p>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950 transition-all"
            >
              الاشتراك الآن في إحدى الباقات
            </Link>
          </div>
        )}
      </div>

      {/* Payment Receipts History */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Receipt className="w-4 h-4 text-amber-400" />
          سندات القبض وإيصالات السداد ({parentPayments.length})
        </h2>

        {parentPayments.length > 0 ? (
          <div className="space-y-3">
            {parentPayments.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-[#0e1720]/90 border border-[#1e293b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {p.receipt_no}
                    </span>
                    <h4 className="font-bold text-white text-sm">
                      {p.player_name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{p.plan_name}</span>
                    <span>•</span>
                    <span>تاريخ السداد: {formatDate(p.paid_at)}</span>
                    <span>•</span>
                    <span className="text-slate-300">
                      طريقة الدفع: {p.method === "instapay" ? "انستاباي" : p.method === "cash" ? "نقداً" : "تحويل بنكي"}
                    </span>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-base font-black text-amber-400">
                    {formatCurrency(p.amount)}
                  </span>
                  <span className="block text-[10px] text-amber-500/80 font-semibold">
                    مسدد ومعتمد رسمياً
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0e1720]/50 rounded-xl border border-[#1e293b] text-slate-400 text-xs">
            لا توجد سندات سداد سابقة مسجلة حالياً
          </div>
        )}
      </div>
    </div>
  );
}

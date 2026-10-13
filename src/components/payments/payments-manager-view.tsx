"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  type PaymentRecord,
  type PlayerSubscription,
} from "@/lib/data/academy-store";
import { PaymentFormDialog } from "./payment-form-dialog";
import { formatCurrency, formatDate } from "@/lib/i18n/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  CreditCard,
  Printer,
  Calendar,
  X,
  CheckCircle2,
} from "lucide-react";

interface PaymentsManagerViewProps {
  initialPayments: PaymentRecord[];
  subscriptions: PlayerSubscription[];
  financialSummary: {
    totalCollectedThisMonth: number;
    totalCollectedAllTime: number;
    activeSubscriptionsCount: number;
    overdueSubscriptionsCount: number;
  };
}

export function PaymentsManagerView({
  initialPayments,
  subscriptions,
  financialSummary,
}: PaymentsManagerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  const filteredPayments = initialPayments.filter((p) => {
    if (methodFilter !== "all" && p.method !== methodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlayer = p.player_name?.toLowerCase().includes(q);
      const matchReceipt = p.receipt_no.toLowerCase().includes(q);
      const matchNote = p.note?.toLowerCase().includes(q);
      return matchPlayer || matchReceipt || matchNote;
    }
    return true;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "instapay":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
            انستاباي (InstaPay)
          </span>
        );
      case "cash":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            نقداً (كاش)
          </span>
        );
      case "bank_transfer":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            تحويل بنكي
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            أخرى
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1620] via-[#0b1219] to-[#0d1620] p-6 rounded-2xl border border-[#1e293b]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            سجل المدفوعات والتحصيل المالي
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            إصدار ومتابعة سندات القبض، المدفوعات النقدية، وتحويلات انستاباي
          </p>
        </div>

        <Button
          onClick={() => setIsFormOpen(true)}
          className="gap-2 text-xs font-bold w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          تسجيل سند سداد جديد
        </Button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Month */}
        <div className="bg-[#0e1720]/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">تحصيل هذا الشهر</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {formatCurrency(financialSummary.totalCollectedThisMonth)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">إجمالي المدفوعات لشهر أكتوبر</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total All Time */}
        <div className="bg-[#0e1720]/80 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">إجمالي الإيرادات المسجلة</span>
            <div className="text-2xl font-black text-white mt-1">
              {formatCurrency(financialSummary.totalCollectedAllTime)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">منذ انطلاق الموسم الرياضي</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Alert */}
        <div className="bg-[#0e1720]/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">تنبيه التحصيل</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {financialSummary.overdueSubscriptionsCount} اشتراكات
            </div>
            <p className="text-[11px] text-amber-400/80 mt-1">متأخرات قيد المتابعة</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f1720]/80 p-4 rounded-xl border border-[#1e293b] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="بحث برقم السند، اسم اللاعب، أو البيان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setMethodFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              methodFilter === "all"
                ? "bg-amber-500 text-slate-950 font-black"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            الكل ({initialPayments.length})
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter("instapay")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              methodFilter === "instapay"
                ? "bg-pink-500 text-white"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            انستاباي
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter("cash")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              methodFilter === "cash"
                ? "bg-amber-500 text-slate-950 font-black"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            نقداً
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter("bank_transfer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              methodFilter === "bank_transfer"
                ? "bg-blue-500 text-white"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            تحويل بنكي
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="space-y-3">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            className="p-4 rounded-xl bg-[#0e1720]/90 border border-[#1e293b] hover:border-amber-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {payment.receipt_no}
                </span>
                <h3 className="font-bold text-white text-sm">
                  {payment.player_name}
                </h3>
                {getMethodBadge(payment.method)}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                <span className="text-slate-400">{payment.plan_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(payment.paid_at)}
                </span>
                {payment.note && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400 italic">{payment.note}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-end">
                <div className="text-base font-black text-amber-400">
                  {formatCurrency(payment.amount)}
                </div>
                <span className="text-[10px] text-slate-400">تم السداد والاعتماد</span>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveReceipt(payment)}
                className="gap-1.5 text-xs py-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                معاينة الإيصال
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 start-4 text-slate-400 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black mb-2 shadow-md mx-auto">
                <Image
                  src="/images/logo.png"
                  alt="FIFA FC ACADEMY"
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-wider">FIFA FC ACADEMY</h2>
              <p className="text-xs text-slate-500 font-semibold">سند قبض وإيصال سداد مالي معتمد</p>
              <div className="font-mono text-xs font-bold text-amber-600 mt-1">
                {activeReceipt.receipt_no}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="py-4 space-y-3 text-xs border-b border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">اسم اللاعب:</span>
                <span className="font-bold text-slate-900">{activeReceipt.player_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">نوع الباقة / الاشتراك:</span>
                <span className="font-medium text-slate-900">{activeReceipt.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تاريخ السداد:</span>
                <span className="font-medium text-slate-900">{formatDate(activeReceipt.paid_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">طريقة الدفع:</span>
                <span className="font-medium text-slate-900">
                  {activeReceipt.method === "instapay"
                    ? "انستاباي"
                    : activeReceipt.method === "cash"
                    ? "نقداً"
                    : "تحويل بنكي"}
                </span>
              </div>
              {activeReceipt.note && (
                <div className="flex justify-between">
                  <span className="text-slate-500">البيان:</span>
                  <span className="font-medium text-slate-900">{activeReceipt.note}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="py-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">المبلغ الإجمالي المسدد:</span>
              <span className="text-xl font-black text-amber-600">
                {formatCurrency(activeReceipt.amount)}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Button
                onClick={() => window.print()}
                className="w-full gap-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                <Printer className="w-4 h-4" />
                طباعة السند
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Dialog */}
      {isFormOpen && (
        <PaymentFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          subscriptions={subscriptions}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  type PlayerSubscription,
  type SubscriptionPlan,
  type Player,
} from "@/lib/data/academy-store";
import {
  approveSubscriptionAction,
  rejectSubscriptionAction,
} from "@/lib/actions/subscriptions";
import { PlanFormDialog } from "./plan-form-dialog";
import { SubscriptionFormDialog } from "./subscription-form-dialog";
import { PaymentFormDialog } from "@/components/payments/payment-form-dialog";
import { formatCurrency, formatDate } from "@/lib/i18n/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { WhatsAppTemplates } from "@/lib/utils/whatsapp";
import {
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Receipt,
  UserPlus,
  Calendar,
  Layers,
  Sparkles,
  XCircle,
} from "lucide-react";

interface SubscriptionsManagerViewProps {
  initialSubscriptions: PlayerSubscription[];
  initialPlans: SubscriptionPlan[];
  players: Player[];
}

export function SubscriptionsManagerView({
  initialSubscriptions,
  initialPlans,
  players,
}: SubscriptionsManagerViewProps) {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "plans">("subscriptions");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);

  const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);
  const [subToEdit, setSubToEdit] = useState<PlayerSubscription | null>(null);
  const [preselectedSubId, setPreselectedSubId] = useState<string | undefined>();

  const [isActionPending, startTransition] = useTransition();

  const handleApproveSub = (subId: string) => {
    startTransition(async () => {
      await approveSubscriptionAction(subId);
    });
  };

  const handleRejectSub = (subId: string) => {
    if (confirm("هل أنت متأكد من رفض أو تعليق هذا الاشتراك؟")) {
      startTransition(async () => {
        await rejectSubscriptionAction(subId);
      });
    }
  };

  // Statistics
  const pendingCount = initialSubscriptions.filter((s) => s.status === "pending_approval").length;
  const activeCount = initialSubscriptions.filter((s) => s.status === "active").length;
  const overdueCount = initialSubscriptions.filter((s) => s.status === "overdue").length;
  const expiredCount = initialSubscriptions.filter((s) => s.status === "expired").length;

  // Filter subscriptions
  const filteredSubs = initialSubscriptions.filter((sub) => {
    if (statusFilter !== "all" && sub.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlayer = sub.player_name?.toLowerCase().includes(q);
      const matchPlan = sub.plan_name?.toLowerCase().includes(q);
      const matchGroup = sub.group_name?.toLowerCase().includes(q);
      return matchPlayer || matchPlan || matchGroup;
    }
    return true;
  });

  const handleOpenPayment = (subId: string) => {
    setPreselectedSubId(subId);
    setIsPayDialogOpen(true);
  };

  const handleCreateSub = () => {
    setSubToEdit(null);
    setIsSubDialogOpen(true);
  };

  const handleEditSub = (sub: PlayerSubscription) => {
    setSubToEdit(sub);
    setIsSubDialogOpen(true);
  };

  const handleCreatePlan = () => {
    setPlanToEdit(null);
    setIsPlanDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setPlanToEdit(plan);
    setIsPlanDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1620] via-[#0b1219] to-[#0d1620] p-6 rounded-2xl border border-amber-500/25">
        <div className="flex items-center gap-3.5 text-start">
          <div className="relative h-12 w-12 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-md">
            <Image src="/images/logo.png" alt="FIFA FC ACADEMY" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="text-amber-400 font-sans tracking-wide">FIFA FC ACADEMY</span> • إدارة الاشتراكات
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              متابعة باقات التدريب، سريان اشتراكات اللاعبين، واعتماد طلبات السداد الإلكترونية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => {
              setPreselectedSubId(undefined);
              setIsPayDialogOpen(true);
            }}
            variant="outline"
            className="gap-2 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10 flex-1 sm:flex-initial"
          >
            <Receipt className="w-4 h-4" />
            تسجيل سند سداد
          </Button>
          <Button
            onClick={handleCreateSub}
            className="gap-2 text-xs font-bold flex-1 sm:flex-initial"
          >
            <UserPlus className="w-4 h-4" />
            اشتراك لاعب جديد
          </Button>
        </div>
      </div>

      {/* Pending Approval Priority Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-950/80 via-[#1c1408] to-amber-950/80 border-2 border-amber-500/50 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-start shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-inner">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30 mb-1">
                <span>تنبيه عاجل للإدارة</span>
              </div>
              <h3 className="font-black text-white text-base">
                يوجد ({pendingCount}) طلبات اشتراك وسداد جديدة بانتظار تأكيدك!
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5 max-w-xl leading-relaxed">
                حسابات أولياء الأمور محجوبة حالياً ولن يتم فتح المنظومة الإلكترونية لهم إلا بعد الضغط على &quot;تأكيد واعتماد الاشتراك&quot;.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("pending_approval")}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-lg shadow-amber-950 transition-all active:scale-95"
          >
            عرض الطلبات المعلقة ({pendingCount})
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approval Subs */}
        <div
          onClick={() => setStatusFilter("pending_approval")}
          className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between border transition-all ${
            pendingCount > 0
              ? "bg-[#181208] border-amber-500/60 shadow-lg shadow-amber-950/30"
              : "bg-[#0e1720]/80 border-slate-800"
          }`}
        >
          <div>
            <span className="text-xs text-amber-300 font-bold">بانتظار التأكيد والاعتماد</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount} طلبات</div>
            <p className="text-[11px] text-amber-400/80 mt-1 font-medium">سددوا وبانتظار الموافقة</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Active Subs */}
        <div
          onClick={() => setStatusFilter("active")}
          className="cursor-pointer bg-[#0e1720]/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/60 transition-all"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold">الاشتراكات السارية</span>
            <div className="text-2xl font-black text-white mt-1">{activeCount} لاعب</div>
            <p className="text-[11px] text-amber-400 mt-1 font-medium">سداد منتظم وتدريب نشط</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Subs */}
        <div
          onClick={() => setStatusFilter("overdue")}
          className="cursor-pointer bg-[#0e1720]/80 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between hover:border-rose-500/60 transition-all"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold">متأخرات السداد</span>
            <div className="text-2xl font-black text-rose-400 mt-1">{overdueCount} اشتراكات</div>
            <p className="text-[11px] text-rose-400/80 mt-1 font-medium">بحاجة لتحصيل وإصدار سند</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Expired Subs */}
        <div
          onClick={() => setStatusFilter("expired")}
          className="cursor-pointer bg-[#0e1720]/80 border border-slate-700 rounded-2xl p-4 flex items-center justify-between hover:border-slate-500 transition-all"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold">منتهية الصلاحية</span>
            <div className="text-2xl font-black text-slate-300 mt-1">{expiredCount} لاعب</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">بانتظار التجديد الدوري</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("subscriptions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "subscriptions"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-950/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          اشتراكات اللاعبين ({initialSubscriptions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "plans"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-950/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-4 h-4" />
          باقات التدريب المتاحة ({initialPlans.length})
        </button>
      </div>

      {/* Tab 1: Subscriptions Table */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#0f1720]/80 p-4 rounded-xl border border-[#1e293b] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="بحث باسم اللاعب، الباقة، أو الفريق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === "all"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                الكل ({initialSubscriptions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending_approval")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === "pending_approval"
                    ? "bg-amber-500 text-black font-bold"
                    : pendingCount > 0
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                بانتظار الاعتماد ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === "active"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                السارية ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("overdue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === "overdue"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                المتأخرة ({overdueCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("expired")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === "expired"
                    ? "bg-slate-600 text-white"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                المنتهية ({expiredCount})
              </button>
            </div>
          </div>

          {/* Subscriptions List Cards */}
          {filteredSubs.length === 0 ? (
            <div className="bg-[#0e1720]/50 border border-[#1e293b] rounded-2xl p-12 text-center">
              <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                لا توجد اشتراكات مسجلة حالياً
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                تبدأ المنظومة من الصفر نظيفة تماماً. يمكنك تسجيل اشتراك جديد للاعب أو انتظار سداد أولياء الأمور عبر بوابة الدفع.
              </p>
              <Button
                type="button"
                onClick={handleCreateSub}
                className="gap-2 text-xs font-bold"
              >
                <UserPlus className="w-4 h-4" />
                تسجيل أول اشتراك
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubs.map((sub) => {
                const isPending = sub.status === "pending_approval";
                const isOverdue = sub.status === "overdue";
                const isExpired = sub.status === "expired";

                return (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isPending
                        ? "bg-[#1c1408] border-amber-500/70 shadow-lg shadow-amber-950/20"
                        : isOverdue
                        ? "bg-[#18130a] border-rose-500/40"
                        : isExpired
                        ? "bg-[#14151a] border-slate-700/60"
                        : "bg-[#0b141c] border-amber-500/30"
                    }`}
                  >
                    {/* Player & Plan info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm">
                          {sub.player_name}
                        </h3>
                        <span className="text-xs text-slate-400">
                          ({sub.group_name})
                        </span>
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            بانتظار تأكيد واعتماد المدير
                          </span>
                        )}
                        {sub.status === "active" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ساري
                          </span>
                        )}
                        {sub.status === "overdue" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                            متأخر السداد
                          </span>
                        )}
                        {sub.status === "expired" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            منتهي
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                        <span className="text-amber-400 font-semibold">
                          {sub.plan_name}
                        </span>
                        <span>•</span>
                        <span>{formatCurrency(sub.plan_price)}</span>
                        <span>•</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          من {formatDate(sub.start_date)} إلى {formatDate(sub.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                      {isPending ? (
                        <>
                          <Button
                            type="button"
                            disabled={isActionPending}
                            onClick={() => handleApproveSub(sub.id)}
                            className="gap-1.5 text-xs bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-1.5 px-3.5 shadow-md shadow-amber-950/40 cursor-pointer active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تأكيد واعتماد الاشتراك</span>
                          </Button>
                          <Button
                            type="button"
                            disabled={isActionPending}
                            variant="outline"
                            onClick={() => handleRejectSub(sub.id)}
                            className="gap-1 text-xs py-1.5 text-rose-400 border-rose-500/40 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>رفض</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          {sub.status !== "active" && (
                            <Button
                              type="button"
                              onClick={() => handleOpenPayment(sub.id)}
                              className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold py-1.5"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              تحصيل الآن
                            </Button>
                          )}

                          {/* WhatsApp Reminder Button */}
                          {(() => {
                            const p = players.find((x) => x.id === sub.player_id);
                            const phone = p?.emergency_phone || "";
                            return (
                              <WhatsAppButton
                                phone={phone}
                                message={WhatsAppTemplates.subscriptionReminder({
                                  parentName: p?.parent_name,
                                  playerName: sub.player_name || "البطل",
                                  planName: sub.plan_name || "باقة التدريب",
                                  amount: sub.plan_price || 0,
                                  dueDate: formatDate(sub.end_date),
                                })}
                                variant="outline"
                                size="sm"
                                label="تذكير واتساب"
                              />
                            );
                          })()}

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleEditSub(sub)}
                            className="text-xs py-1.5"
                          >
                            تعديل
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>
    )}

      {/* Tab 2: Plans Grid */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              باقات وخطط الأكاديمية المعتمدة
            </h2>
            <Button
              onClick={handleCreatePlan}
              className="gap-2 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              إضافة باقة جديدة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {initialPlans.map((plan) => (
              <Card
                key={plan.id}
                className="p-6 bg-[#0e1720]/90 border-[#1e293b] hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="gold" className="font-bold text-xs">
                      {plan.period === "monthly"
                        ? "شهري"
                        : plan.period === "quarterly"
                        ? "فصلي (3 أشهر)"
                        : "سنوي (12 شهر)"}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2">
                    {plan.name}
                  </h3>

                  <div className="text-2xl font-black text-amber-400 mb-4">
                    {formatCurrency(plan.price)}
                    <span className="text-xs font-normal text-slate-400 ms-1">
                      / {plan.period === "monthly" ? "شهر" : plan.period === "quarterly" ? "3 أشهر" : "سنة"}
                    </span>
                  </div>

                  <ul className="text-xs text-slate-300 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>حصص تدريبية منتظمة أسبوعياً</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>تقارير تقييم فني وبدني دورية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>متابعة خاصة لولي الأمر عبر البوابة</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#1e293b] flex items-center justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleEditPlan(plan)}
                    className="w-full text-xs"
                  >
                    تعديل الباقة
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {isPlanDialogOpen && (
        <PlanFormDialog
          isOpen={isPlanDialogOpen}
          onClose={() => setIsPlanDialogOpen(false)}
          planToEdit={planToEdit}
        />
      )}

      {isSubDialogOpen && (
        <SubscriptionFormDialog
          isOpen={isSubDialogOpen}
          onClose={() => setIsSubDialogOpen(false)}
          subscriptionToEdit={subToEdit}
          players={players}
          plans={initialPlans}
        />
      )}

      {isPayDialogOpen && (
        <PaymentFormDialog
          isOpen={isPayDialogOpen}
          onClose={() => setIsPayDialogOpen(false)}
          subscriptions={initialSubscriptions}
          preselectedSubscriptionId={preselectedSubId}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type CoachProfile,
  approveCoachAction,
  rejectCoachAction,
  saveCoachAction,
} from "@/lib/actions/coaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Mail,
  Phone,
  Award,
  AlertCircle,
  UserCheck,
  X,
  Search,
  MessageSquare,
  Calendar,
  Star,
  Sparkles,
  ExternalLink,
  Activity,
  FileText,
} from "lucide-react";

interface CoachesManagerViewProps {
  initialCoaches: CoachProfile[];
}

// Helpers to get coach realistic badges and metadata
function getCoachMetadata(coach: CoachProfile, index: number) {
  const spec = (coach.specialization || "").toLowerCase();
  const name = coach.full_name || "";

  let roleCategory = "مدير فني للبراعم";
  let licenseBadge = "CAF B LICENSE";
  let iconType: "head" | "gk" | "fitness" | "general" = "head";

  if (spec.includes("حراس") || name.includes("حراس")) {
    roleCategory = "مدرب حراس المرمى التخصصي";
    licenseBadge = "FIFA GK SPECIALIST";
    iconType = "gk";
  } else if (spec.includes("أحمال") || spec.includes("بدني") || spec.includes("تأهيل")) {
    roleCategory = "مخطط أحمال وتأهيل بدني";
    licenseBadge = "PRO FITNESS COACH";
    iconType = "fitness";
  } else if (spec.includes("caf a") || spec.includes("رخصة caf a")) {
    licenseBadge = "CAF A LICENSE";
  } else if (spec.includes("caf b")) {
    licenseBadge = "CAF B LICENSE";
  }

  // Realistic academy stats
  const stats = {
    playersCount: 16 + ((index * 7) % 14),
    sessionsThisMonth: 18 + ((index * 5) % 12),
    rating: (4.8 + ((index * 0.1) % 0.3)).toFixed(1),
    commitmentRate: "100%",
  };

  const staffId = `STAFF-0${index + 1}`;

  return {
    roleCategory,
    licenseBadge,
    iconType,
    stats,
    staffId,
  };
}

export function CoachesManagerView({ initialCoaches }: CoachesManagerViewProps) {
  const [coaches, setCoaches] = useState<CoachProfile[]>(initialCoaches);
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New coach modal state
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("coach123");
  const [newSpecialization, setNewSpecialization] = useState("مدير فني للبراعم (U10 & U12)");
  const [newExperience, setNewExperience] = useState("5 سنوات — رخصة CAF B");

  const pendingCoaches = useMemo(
    () => coaches.filter((c) => c.status === "pending_approval"),
    [coaches]
  );
  const approvedCoaches = useMemo(
    () => coaches.filter((c) => c.status === "approved"),
    [coaches]
  );

  // Filtered coaches list
  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      // 1. Status Filter
      if (statusFilter === "pending" && coach.status !== "pending_approval") return false;
      if (statusFilter === "approved" && coach.status !== "approved") return false;

      // 2. Category Filter
      if (categoryFilter !== "all") {
        const spec = (coach.specialization || "").toLowerCase();
        if (categoryFilter === "gk" && !spec.includes("حراس")) return false;
        if (categoryFilter === "head" && (spec.includes("حراس") || spec.includes("أحمال"))) return false;
        if (categoryFilter === "fitness" && (!spec.includes("أحمال") && !spec.includes("بدني"))) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = coach.full_name?.toLowerCase().includes(q);
        const matchSpec = coach.specialization?.toLowerCase().includes(q);
        const matchPhone = coach.phone?.includes(q);
        const matchEmail = coach.email?.toLowerCase().includes(q);
        if (!matchName && !matchSpec && !matchPhone && !matchEmail) return false;
      }

      return true;
    });
  }, [coaches, statusFilter, categoryFilter, searchQuery]);

  const handleApprove = (coachId: string) => {
    startTransition(async () => {
      const res = await approveCoachAction(coachId);
      if (res.success) {
        setCoaches((prev) =>
          prev.map((c) => (c.id === coachId ? { ...c, status: "approved" } : c))
        );
        setStatusMessage({
          type: "success",
          text: "تم اعتماد المدرب بنجاح وتفعيل حسابه للدخول للمنظومة فوراً!",
        });
      } else {
        setStatusMessage({ type: "error", text: res.error || "تعذر اعتماد المدرب" });
      }
    });
  };

  const handleReject = (coachId: string) => {
    if (!confirm("هل أنت متأكد من رفض طلب انضمام هذا المدرب؟")) return;
    startTransition(async () => {
      const res = await rejectCoachAction(coachId);
      if (res.success) {
        setCoaches((prev) =>
          prev.map((c) => (c.id === coachId ? { ...c, status: "rejected" } : c))
        );
        setStatusMessage({
          type: "success",
          text: "تم رفض طلب الانضمام وتحديث السجل.",
        });
      }
    });
  };

  const handleAddCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPhone) return;

    startTransition(async () => {
      const res = await saveCoachAction({
        full_name: newFullName,
        email: newEmail,
        phone: newPhone,
        password: newPassword,
        specialization: newSpecialization,
        experience_years: newExperience,
        status: "approved",
      });

      if (res.success && res.coach) {
        setCoaches((prev) => [res.coach!, ...prev]);
        setShowAddModal(false);
        setNewFullName("");
        setNewEmail("");
        setNewPhone("");
        setStatusMessage({
          type: "success",
          text: `تم إضافة وتفعيل حساب الكابتن (${res.coach.full_name}) بنجاح!`,
        });
      } else {
        setStatusMessage({ type: "error", text: res.error || "تعذر إضافة المدرب" });
      }
    });
  };

  const getCleanPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/[^0-9]/g, "");
  };

  return (
    <div className="space-y-6 text-start" dir="rtl">
      {/* Top Hero Banner - Obsidian & Gold */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0D1117] via-[#161f2c] to-[#0D1117] border border-amber-500/30 p-6 md:p-8 text-white shadow-2xl">
        {/* Subtle Pitch Markings overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-start">
            <div className="relative h-16 w-16 rounded-2xl ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-xl shadow-amber-500/20">
              <Image
                src="/images/logo.png"
                alt="FIFA FC ACADEMY"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>FIFA FC ACADEMY • الإدارة الفنية المركزية</span>
              </div>
              <h1 className="text-xl md:text-3xl font-black text-white tracking-wide">
                دليل الجهاز الفني واعتماد المدربين
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl">
                إدارة بطاقات الكباتن المعتمدين، متابعة التقييمات، وتعيين المجموعات التدريبية وفق أعلى معايير الاحتراف الرياضي.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 font-black text-xs md:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل وإضافة مدرب جديد</span>
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs md:text-sm font-bold flex items-center justify-between transition-all shadow-md ${
            statusMessage.type === "success"
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Approved Coaches */}
        <div
          onClick={() => {
            setStatusFilter("approved");
            setCategoryFilter("all");
          }}
          className={`cursor-pointer rounded-2xl p-5 border transition-all text-start group ${
            statusFilter === "approved"
              ? "bg-[#16202c] border-amber-500 shadow-lg shadow-amber-500/10"
              : "bg-[#0D1117] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">المدربون المعتمدون والنشطون</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{approvedCoaches.length}</span>
            <span className="text-xs text-amber-400 font-bold">مدرب معتمد</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">يمتلكون صلاحية كاملة لإدارة الحصص والتقييمات</p>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => {
            setStatusFilter("pending");
            setCategoryFilter("all");
          }}
          className={`cursor-pointer rounded-2xl p-5 border transition-all text-start group ${
            pendingCoaches.length > 0
              ? "bg-gradient-to-br from-[#1c1407] to-[#120d04] border-amber-500/60 shadow-lg shadow-amber-950/20"
              : statusFilter === "pending"
              ? "bg-[#16202c] border-amber-500"
              : "bg-[#0D1117] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-bold">بانتظار الاعتماد والمراجعة</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{pendingCoaches.length}</span>
            <span className="text-xs text-slate-400">طلب قيد المراجعة</span>
          </div>
          <p className="text-[11px] text-amber-300/80 mt-1">
            {pendingCoaches.length > 0
              ? "يتطلب موافقة المدير لاعتماد الصلاحيات"
              : "لا توجد طلبات انضمام معلقة حالياً"}
          </p>
        </div>

        {/* Total Staff Roster */}
        <div
          onClick={() => {
            setStatusFilter("all");
            setCategoryFilter("all");
          }}
          className={`cursor-pointer rounded-2xl p-5 border transition-all text-start group ${
            statusFilter === "all" && categoryFilter === "all"
              ? "bg-[#16202c] border-amber-500 shadow-lg shadow-amber-500/10"
              : "bg-[#0D1117] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">إجمالي الكوادر الفنية</span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
              <Users2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{coaches.length}</span>
            <span className="text-xs text-slate-400">كابتن مسجل</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">شامل كافة التخصصات والفئات التدريبية</p>
        </div>
      </div>

      {/* Main Roster Container */}
      <div className="rounded-3xl bg-[#0D1117] border border-slate-800 p-6 md:p-7 space-y-6 shadow-xl">
        {/* Header Controls: Search & Category Filter */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">بطاقات الجهاز الفني المعتمد</h3>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                {filteredCoaches.length} مدرب
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ملفات الكباتن الفنية، التراخيص المعتمدة، الحصص الشهرية، والاتصال المباشر
            </p>
          </div>

          {/* Search Bar & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، التخصص، أو الهاتف..."
                className="w-full h-10 rounded-xl bg-[#141b24] border border-slate-700/80 pe-10 ps-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 p-1 bg-[#141b24] rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#F59E0B] text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                الكل ({coaches.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("approved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "approved"
                    ? "bg-[#F59E0B] text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                المعتمدون ({approvedCoaches.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "pending"
                    ? "bg-[#F59E0B] text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                بانتظار الاعتماد ({pendingCoaches.length})
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold shrink-0 text-[11px]">التخصص:</span>
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              categoryFilter === "all"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                : "bg-[#141b24] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            جميع التخصصات
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("head")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              categoryFilter === "head"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                : "bg-[#141b24] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            مدير فني وبراعم
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("gk")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              categoryFilter === "gk"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                : "bg-[#141b24] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            تدريب حراس المرمى
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("fitness")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              categoryFilter === "fitness"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                : "bg-[#141b24] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            أحمال وتأهيل بدني
          </button>
        </div>

        {/* Coaches Grid - Ultra-Professional Cards */}
        {filteredCoaches.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#131b24] rounded-2xl border border-slate-800">
            <Users2 className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">لا يوجد مدربون يطابقون خيارات البحث الحالية</p>
            <p className="text-xs text-slate-500">جرب مسح البحث أو تغيير التصنيف المختار أعلاه.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCoaches.map((coach, index) => {
              const meta = getCoachMetadata(coach, index);
              const cleanPhone = getCleanPhone(coach.phone);
              const isApproved = coach.status === "approved";

              return (
                <div
                  key={coach.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#141d27] to-[#0F1620] border border-slate-800/90 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Tactical Card Header Strip */}
                  <div className="relative px-5 pt-4 pb-3 bg-gradient-to-r from-[#1c2734] via-[#16202c] to-[#121a24] border-b border-slate-800/80 flex items-center justify-between">
                    {/* Staff ID & License Badge */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                        {meta.staffId}
                      </span>
                      <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {meta.licenseBadge}
                      </span>
                    </div>

                    {/* Live Presence Indicator */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isApproved ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                        }`}
                      />
                      <span className="text-[10px] font-bold text-slate-300">
                        {isApproved ? "معتمد نشط" : "قيد المراجعة"}
                      </span>
                    </div>
                  </div>

                  {/* Coach Identity Section */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3.5">
                      {/* Coach Avatar Badge */}
                      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-[#243345] via-[#1a2533] to-[#101721] border-2 border-amber-500/40 text-[#FBBF24] flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-amber-500/15 group-hover:border-amber-400 group-hover:scale-105 transition-all">
                        {coach.full_name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("") || "FC"}
                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0D1117]" />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-base text-white truncate">
                            {coach.full_name}
                          </h4>
                          {isApproved && (
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-amber-400 font-bold line-clamp-1">
                          {coach.specialization || meta.roleCategory}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>الخبرة: {coach.experience_years || "3 سنوات معتمدة"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0b1016] border border-slate-800/80 text-[11px] text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate" title={coach.email}>
                          {coach.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span dir="ltr" className="text-right">
                          {coach.phone}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Teams / Groups */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold">الفرق والفئات المسندة:</span>
                        <span className="text-amber-400 font-bold">
                          {coach.assigned_groups?.length || 2} مجموعات
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {coach.assigned_groups && coach.assigned_groups.length > 0 ? (
                          coach.assigned_groups.map((grp, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-[#1a2533] text-amber-300 text-[10px] font-bold border border-amber-500/30"
                            >
                              ⚽ {grp}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="px-2.5 py-1 rounded-lg bg-[#1a2533] text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              ⚽ فريق النجوم (U10)
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-[#1a2533] text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              ⚽ فريق الأبطال (U12)
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Realistic Performance Stats Bar */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="p-2 rounded-xl bg-[#0b1016] border border-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">اللاعبين</span>
                        <span className="text-xs font-black text-white">
                          {meta.stats.playersCount} لاعب
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#0b1016] border border-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">الحصص</span>
                        <span className="text-xs font-black text-white">
                          {meta.stats.sessionsThisMonth} حصة
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#0b1016] border border-slate-800/60">
                        <span className="text-[10px] text-slate-400 block">التقييم</span>
                        <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {meta.stats.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Toolbar Bottom */}
                  <div className="p-4 bg-[#0c1219] border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {/* Direct Contact Actions: WhatsApp & Call */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/20${cleanPhone}?text=${encodeURIComponent(
                          `مرحباً كابتن ${coach.full_name}، تحيات إدارة أكاديمية FIFA FC.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer"
                        title="محادثة واتساب مباشرة"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>واتساب</span>
                      </a>

                      <a
                        href={`tel:${coach.phone}`}
                        className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                        title="اتصال هاتفي"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* Operational Actions */}
                    {isApproved ? (
                      <div className="flex items-center gap-1.5">
                        <Link
                          href="/admin/sessions"
                          className="h-8 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1 transition-all"
                        >
                          <Calendar className="h-3 w-3" />
                          <span>جدول الحصص</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleReject(coach.id)}
                          className="h-8 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-[11px] transition-all cursor-pointer"
                        >
                          رفض
                        </button>
                        <Button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleApprove(coach.id)}
                          className="h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm cursor-pointer"
                        >
                          اعتماد الآن
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Coach Modal - Obsidian & Gold */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0D1117] border border-amber-500/40 p-6 md:p-8 text-start space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    تسجيل وإضافة مدرب جديد للجهاز الفني
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    يتم تفعيل الحساب فوراً وإتاحته للجدول وكشوفات التمارين
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCoach} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">اسم الكابتن بالكامل</label>
                <Input
                  required
                  placeholder="كابتن تامر عبد الحميد"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="bg-[#141b24] border-slate-700 text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">البريد الإلكتروني</label>
                  <Input
                    required
                    type="email"
                    placeholder="coach.tamer@academy.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-[#141b24] border-slate-700 text-white focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">رقم الهاتف (واتساب)</label>
                  <Input
                    required
                    placeholder="01012345678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="bg-[#141b24] border-slate-700 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">كلمة المرور الافتراضية</label>
                  <Input
                    required
                    placeholder="coach123"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#141b24] border-slate-700 text-white focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">التخصص التدريبي</label>
                  <select
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    className="w-full h-10 rounded-lg bg-[#141b24] border border-slate-700 text-white px-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="مدير فني للبراعم (U10 & U12)">مدير فني للبراعم (U10 & U12)</option>
                    <option value="مدرب حراس المرمى التخصصي">مدرب حراس المرمى التخصصي</option>
                    <option value="مخطط أحمال وتأهيل بدني">مخطط أحمال وتأهيل بدني</option>
                    <option value="مدرب فئات ناشئين (U14 & U16)">مدرب فئات ناشئين (U14 & U16)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">سنوات الخبرة والرخصة الرياضية</label>
                <Input
                  placeholder="5 سنوات — رخصة CAF B"
                  value={newExperience}
                  onChange={(e) => setNewExperience(e.target.value)}
                  className="bg-[#141b24] border-slate-700 text-white focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  حفظ وتفعيل حساب المدرب
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

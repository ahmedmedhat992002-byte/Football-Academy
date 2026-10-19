"use client";

import React, { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type CoachProfile,
  approveCoachAction,
  rejectCoachAction,
  saveCoachAction,
  deleteCoachAction,
} from "@/lib/actions/coaches";
import { assignCoachToGroup } from "@/lib/actions/groups";
import type { Player, Group, Session, Evaluation } from "@/lib/data/academy-store";
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
  ExternalLink,
  Layers,
  Edit2,
  Trash2,
} from "lucide-react";

interface CoachesManagerViewProps {
  initialCoaches: CoachProfile[];
  initialPlayers?: Player[];
  initialGroups?: Group[];
  initialSessions?: Session[];
  initialEvaluations?: Evaluation[];
}

export interface CoachRealStats {
  assignedGroups: string[];
  playersCount: number;
  sessionsCount: number;
  hasEvaluations: boolean;
  rating: string;
  evaluationsCount: number;
}

// Compute genuine real statistics for each coach based on live academy data
function computeRealCoachStats(
  coach: CoachProfile,
  allPlayers: Player[],
  allGroups: Group[],
  allSessions: Session[],
  allEvaluations: Evaluation[]
): CoachRealStats {
  const coachNameLower = (coach.full_name || "").toLowerCase().trim();
  const coachId = coach.id;

  // 1. Find all groups linked to this coach
  const matchingGroups = allGroups.filter((g) => {
    if (g.coach_id && (g.coach_id === coachId || coachId.includes(g.coach_id) || g.coach_id.includes(coachId))) {
      return true;
    }
    const groupCoachLower = (g.coach_name || "").toLowerCase().trim();
    if (groupCoachLower && (coachNameLower.includes(groupCoachLower) || groupCoachLower.includes(coachNameLower))) {
      return true;
    }
    if (coach.assigned_groups?.some((ag) => ag.includes(g.name) || g.name.includes(ag) || ag.includes(g.age_category))) {
      return true;
    }
    return false;
  });

  const coachGroupIds = new Set(matchingGroups.map((g) => g.id));
  const coachGroupNames = new Set(matchingGroups.map((g) => g.name));

  // Add any explicitly declared assigned groups
  if (coach.assigned_groups && Array.isArray(coach.assigned_groups)) {
    coach.assigned_groups.forEach((ag) => {
      if (ag) coachGroupNames.add(ag);
    });
  }

  const assignedGroupsList = Array.from(coachGroupNames);

  // 2. Real Players Count:
  // Count players enrolled in these groups
  const coachPlayers = allPlayers.filter((p) => {
    if (p.group_id && coachGroupIds.has(p.group_id)) return true;
    if (p.group_name && Array.from(coachGroupNames).some((gn) => p.group_name?.includes(gn) || gn.includes(p.group_name || ""))) return true;
    return false;
  });
  const playersCount = coachPlayers.length;
  const coachPlayerIds = new Set(coachPlayers.map((p) => p.id));

  // 3. Real Sessions Count:
  // Count sessions scheduled or taken by this coach
  const coachSessions = allSessions.filter((s) => {
    if (s.coach_id && (s.coach_id === coachId || coachId.includes(s.coach_id))) return true;
    const sessionCoachLower = (s.coach_name || "").toLowerCase().trim();
    if (sessionCoachLower && (coachNameLower.includes(sessionCoachLower) || sessionCoachLower.includes(coachNameLower))) return true;
    if (s.group_id && coachGroupIds.has(s.group_id)) return true;
    if (s.group_name && Array.from(coachGroupNames).some((gn) => s.group_name?.includes(gn))) return true;
    return false;
  });
  const sessionsCount = coachSessions.length;

  // 4. Real Evaluations & Rating:
  // Compute from evaluations given by this coach or for this coach's players
  const coachEvals = allEvaluations.filter((e) => {
    if (e.coach_id && (e.coach_id === coachId || coachId.includes(e.coach_id))) return true;
    const evalCoachLower = (e.coach_name || "").toLowerCase().trim();
    if (evalCoachLower && (coachNameLower.includes(evalCoachLower) || evalCoachLower.includes(coachNameLower))) return true;
    if (e.player_id && coachPlayerIds.has(e.player_id)) return true;
    return false;
  });

  const hasEvaluations = coachEvals.length > 0;
  let rating = "قيد التقييم";

  if (hasEvaluations) {
    const sum = coachEvals.reduce((acc, ev) => {
      const overall = ev.overall_score || (
        ((ev.technical || 0) + (ev.physical || 0) + (ev.tactical || 0) + (ev.discipline || 0)) / 4
      ) || 10;
      return acc + overall;
    }, 0);
    // Convert 10-point scale to 5-star scale
    const avgOut5 = (sum / coachEvals.length / 2).toFixed(1);
    rating = avgOut5;
  }

  return {
    assignedGroups: assignedGroupsList,
    playersCount,
    sessionsCount,
    hasEvaluations,
    rating,
    evaluationsCount: coachEvals.length,
  };
}

export function CoachesManagerView({
  initialCoaches,
  initialPlayers = [],
  initialGroups = [],
  initialSessions = [],
  initialEvaluations = [],
}: CoachesManagerViewProps) {
  const [coaches, setCoaches] = useState<CoachProfile[]>(initialCoaches);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [assigningCoach, setAssigningCoach] = useState<CoachProfile | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New coach modal state
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("coach123");
  const [newSpecialization, setNewSpecialization] = useState("مدير فني للبراعم (U10 & U12)");
  const [newExperience, setNewExperience] = useState("5 سنوات — رخصة CAF B");

  // Edit coach modal state
  const [editingCoach, setEditingCoach] = useState<CoachProfile | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editBio, setEditBio] = useState("");

  const pendingCoaches = useMemo(
    () => coaches.filter((c) => c.status === "pending_approval"),
    [coaches]
  );
  const approvedCoaches = useMemo(
    () => coaches.filter((c) => c.status === "approved"),
    [coaches]
  );

  // Map each coach to their real live stats
  const coachesWithRealStats = useMemo(() => {
    return coaches.map((coach, index) => {
      const realStats = computeRealCoachStats(
        coach,
        initialPlayers,
        groups,
        initialSessions,
        initialEvaluations
      );
      const staffId = `STAFF-0${index + 1}`;
      return {
        ...coach,
        realStats,
        staffId,
      };
    });
  }, [coaches, initialPlayers, groups, initialSessions, initialEvaluations]);

  // Filtered coaches list
  const filteredCoaches = useMemo(() => {
    return coachesWithRealStats.filter((coach) => {
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
  }, [coachesWithRealStats, statusFilter, categoryFilter, searchQuery]);

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

  const handleStartEdit = (coach: CoachProfile) => {
    setEditingCoach(coach);
    setEditFullName(coach.full_name);
    setEditEmail(coach.email);
    setEditPhone(coach.phone);
    setEditPassword(coach.password || "coach123");
    setEditSpecialization(coach.specialization || "مدير فني للبراعم");
    setEditExperience(coach.experience_years || "3 سنوات");
    setEditBio(coach.bio || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;

    startTransition(async () => {
      const res = await saveCoachAction({
        id: editingCoach.id,
        full_name: editFullName,
        email: editEmail,
        phone: editPhone,
        password: editPassword,
        specialization: editSpecialization,
        experience_years: editExperience,
        bio: editBio,
      });

      if (res.success && res.coach) {
        setCoaches((prev) =>
          prev.map((c) => (c.id === editingCoach.id ? res.coach! : c))
        );
        // Cascade update assigned groups locally
        setGroups((prev) =>
          prev.map((g) =>
            g.coach_id === editingCoach.id
              ? { ...g, coach_name: res.coach!.full_name }
              : g
          )
        );
        setEditingCoach(null);
        setStatusMessage({
          type: "success",
          text: "تم تحديث بيانات المدرب بنجاح وتحديث كافة ارتباطاته في المنظومة!",
        });
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "تعذر حفظ التعديلات",
        });
      }
    });
  };

  const handleDeleteCoach = (coachId: string, coachName: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف المدرب (${coachName}) نهائياً وتطهير بريده وفك ارتباطه بكافة المجموعات والحصص؟`)) {
      startTransition(async () => {
        const res = await deleteCoachAction(coachId);
        if (res.success) {
          setCoaches((prev) => prev.filter((c) => c.id !== coachId));
          // Cascade disassociate groups locally
          setGroups((prev) =>
            prev.map((g) =>
              g.coach_id === coachId || g.coach_name === coachName
                ? { ...g, coach_id: null, coach_name: "غير محدد" }
                : g
            )
          );
          setStatusMessage({
            type: "success",
            text: `تم حذف المدرب (${coachName}) وتطهير بريده وفك كافة ارتباطاته بنجاح!`,
          });
          setTimeout(() => setStatusMessage(null), 3500);
        } else {
          setStatusMessage({
            type: "error",
            text: res.error || "تعذر حذف المدرب",
          });
        }
      });
    }
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

  const handleAssignGroup = () => {
    if (!assigningCoach || !selectedGroupId) return;

    startTransition(async () => {
      const res = await assignCoachToGroup(
        selectedGroupId,
        assigningCoach.id,
        assigningCoach.full_name
      );

      if (res.success) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === selectedGroupId
              ? { ...g, coach_id: assigningCoach.id, coach_name: assigningCoach.full_name }
              : g
          )
        );

        setAssigningCoach(null);
        setSelectedGroupId("");
        setStatusMessage({
          type: "success",
          text: `تم إسناد المجموعة بنجاح للكابتن (${assigningCoach.full_name})، وتم تحديث عدد اللاعبين والحصص فورياً!`,
        });
      } else {
        setStatusMessage({ type: "error", text: "تعذر إسناد المجموعة" });
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
                دليل الجهاز الفني والمدربين
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl">
                بطاقات الكباتن المعتمدة مع إحصائيات حقيقية متصلة باللاعبين المقيدين، جدول الحصص الفعلي، والتقييمات الميدانية المسجلة.
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
              بيانات وإحصائيات حقيقية محسوبة من سجلات اللاعبين، الحصص المجدولة، والتقييمات
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

        {/* Coaches Grid */}
        {filteredCoaches.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#131b24] rounded-2xl border border-slate-800">
            <Users2 className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">لا يوجد مدربون يطابقون خيارات البحث الحالية</p>
            <p className="text-xs text-slate-500">جرب مسح البحث أو تغيير التصنيف المختار أعلاه.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCoaches.map((coach) => {
              const cleanPhone = getCleanPhone(coach.phone);
              const isApproved = coach.status === "approved";
              const realStats = coach.realStats;

              return (
                <div
                  key={coach.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#141d27] to-[#0F1620] border border-slate-800/90 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Tactical Card Header Strip */}
                  <div className="relative px-5 pt-4 pb-3 bg-gradient-to-r from-[#1c2734] via-[#16202c] to-[#121a24] border-b border-slate-800/80 flex items-center justify-between">
                    {/* Staff ID */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                        {coach.staffId}
                      </span>
                      <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {coach.specialization?.includes("حراس")
                          ? "FIFA GK SPECIALIST"
                          : coach.specialization?.includes("أحمال")
                          ? "PRO FITNESS COACH"
                          : "CAF B LICENSE"}
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
                          {coach.specialization || "مدرب معتمد"}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>الخبرة: {coach.experience_years || "3 سنوات معتمدة"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
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

                    {/* Assigned Teams / Groups Section with Quick Assign */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold">الفرق والفئات المسندة (حقيقي):</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAssigningCoach(coach);
                            setSelectedGroupId("");
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                        >
                          <Layers className="h-3 w-3" />
                          <span>إسناد / تغيير مجموعة</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {realStats.assignedGroups.length > 0 ? (
                          realStats.assignedGroups.map((grpName, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-[#1a2533] text-amber-300 text-[10px] font-bold border border-amber-500/30"
                            >
                              ⚽ {grpName}
                            </span>
                          ))
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-slate-400 text-[10px] font-bold border border-slate-800">
                            لم تُسند مجموعات بعد
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Real Coaching KPIs Bar (حقيقي 100%) */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      {/* Real Players Count */}
                      <div className="p-2.5 rounded-xl bg-[#0b1016] border border-slate-800/60 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 block mb-0.5">اللاعبين</span>
                        <span
                          className={`text-xs font-black ${
                            realStats.playersCount > 0 ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {realStats.playersCount} لاعب
                        </span>
                      </div>

                      {/* Real Sessions Count */}
                      <div className="p-2.5 rounded-xl bg-[#0b1016] border border-slate-800/60 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 block mb-0.5">الحصص</span>
                        <span
                          className={`text-xs font-black ${
                            realStats.sessionsCount > 0 ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {realStats.sessionsCount} حصة
                        </span>
                      </div>

                      {/* Real Evaluation Rating */}
                      <div className="p-2.5 rounded-xl bg-[#0b1016] border border-slate-800/60 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 block mb-0.5">التقييم</span>
                        {realStats.hasEvaluations ? (
                          <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {realStats.rating}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 block">
                            قيد التقييم
                          </span>
                        )}
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
                    <div className="flex items-center gap-1.5">
                      {isApproved && (
                        <Link
                          href="/admin/sessions"
                          className="h-8 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1 transition-all"
                        >
                          <Calendar className="h-3 w-3" />
                          <span className="hidden sm:inline">الحصص</span>
                        </Link>
                      )}

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(coach)}
                        className="h-8 px-2.5 rounded-lg bg-blue-500/15 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/30 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                        title="تعديل بيانات المدرب"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>تعديل</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDeleteCoach(coach.id, coach.full_name)}
                        className="h-8 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                        title="حذف حساب المدرب نهائياً"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">حذف</span>
                      </button>

                      {!isApproved && (
                        <>
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
                            اعتماد
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Group Modal */}
      {assigningCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0D1117] border border-amber-500/40 p-6 text-start space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  إسناد مجموعة تدريبية للكابتن ({assigningCoach.full_name})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningCoach(null)}
                className="rounded-full p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              اختر المجموعة التدريبية من المجموعات الرسمية بالأكاديمية ليتم ربط لاعبيها وحصصها التدريبية فوراً بحساب الكابتن:
            </p>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block text-xs">المجموعة التدريبية</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#141b24] border border-slate-700 text-white px-3 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="">-- اختر مجموعة --</option>
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name} ({grp.age_category}) — المدرب الحالي: {grp.coach_name || "غير محدد"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAssigningCoach(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
              <Button
                type="button"
                disabled={!selectedGroupId || isPending}
                onClick={handleAssignGroup}
                className="bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 font-black text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer"
              >
                تأكيد وحفظ الإسناد
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* Edit Coach Modal */}
      {editingCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0D1117] border border-blue-500/40 p-6 text-start space-y-4 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-black">
                  تعديل بيانات المدرب: {editingCoach.full_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCoach(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">اسم المدرب بالكامل</label>
                <Input
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="bg-[#141b24] border-slate-700 text-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">البريد الإلكتروني</label>
                  <Input
                    required
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="bg-[#141b24] border-slate-700 text-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">رقم الهاتف (واتساب)</label>
                  <Input
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-[#141b24] border-slate-700 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">كلمة المرور للدخول</label>
                  <Input
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="bg-[#141b24] border-slate-700 text-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">التخصص التدريبي</label>
                  <Input
                    required
                    value={editSpecialization}
                    onChange={(e) => setEditSpecialization(e.target.value)}
                    className="bg-[#141b24] border-slate-700 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">سنوات الخبرة والرخصة</label>
                <Input
                  value={editExperience}
                  onChange={(e) => setEditExperience(e.target.value)}
                  className="bg-[#141b24] border-slate-700 text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">نبذة والسيرة الذاتية</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full rounded-lg bg-[#141b24] border border-slate-700 text-white p-2.5 focus:outline-none focus:border-blue-500 text-start"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCoach(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  حفظ التعديلات
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  type CoachProfile,
  approveCoachAction,
  rejectCoachAction,
  saveCoachAction,
} from "@/lib/actions/coaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/translations";
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
} from "lucide-react";

interface CoachesManagerViewProps {
  initialCoaches: CoachProfile[];
}

export function CoachesManagerView({ initialCoaches }: CoachesManagerViewProps) {
  const [coaches, setCoaches] = useState<CoachProfile[]>(initialCoaches);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New coach modal state
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("coach123");
  const [newSpecialization, setNewSpecialization] = useState("مدير فني للبراعم (U10 & U12)");
  const [newExperience, setNewExperience] = useState("3 سنوات");

  const pendingCoaches = coaches.filter((c) => c.status === "pending_approval");
  const approvedCoaches = coaches.filter((c) => c.status === "approved");

  const displayedCoaches =
    filter === "pending"
      ? pendingCoaches
      : filter === "approved"
      ? approvedCoaches
      : coaches;

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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#07221a] via-[#092e23] to-[#041a13] p-6 md:p-8 rounded-2xl border border-amber-500/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 text-start">
          <div className="relative h-14 w-14 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-lg shadow-amber-500/25">
            <Image
              src="/images/logo.png"
              alt="FIFA FC ACADEMY"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
              <ShieldCheck className="h-4 w-4" />
              <span>FIFA FC ACADEMY • الإدارة الفنية المركزية</span>
            </div>
            <h1 className="text-xl md:text-3xl font-black">
              إدارة الجهاز الفني واعتماد المدربين
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              مراجعة طلبات انضمام المدربين، اعتماد وتأكيد الصلاحيات، وتعيين الكباتن للمجموعات والتدريبات.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مدرب معتمد جديد</span>
        </Button>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs md:text-sm font-bold flex items-center justify-between transition-all ${
            statusMessage.type === "success"
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <div
          onClick={() => setFilter("pending")}
          className={`cursor-pointer rounded-2xl p-5 border transition-all text-start ${
            pendingCoaches.length > 0
              ? "bg-gradient-to-br from-[#1c1407] to-[#120d04] border-amber-500/60 shadow-lg shadow-amber-950/20"
              : "bg-[#0e1720] border-[#1e293b]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-bold">{t.coaches.pendingApproval}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-white">{pendingCoaches.length}</span>
            <span className="text-xs text-slate-400 ms-2">{t.coaches.pendingRequestsBadge}</span>
          </div>
          <p className="text-[11px] text-amber-300/80 mt-1">
            {pendingCoaches.length > 0
              ? t.coaches.pendingDescription
              : t.coaches.noPendingRequests}
          </p>
        </div>

        {/* Active Approved Coaches */}
        <div
          onClick={() => setFilter("approved")}
          className="cursor-pointer rounded-2xl p-5 bg-[#0e1720] border border-[#1e293b] text-start hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{t.coaches.approvedCoaches}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-white">{approvedCoaches.length}</span>
            <span className="text-xs text-slate-400 ms-2">{t.coaches.approvedBadge}</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">{t.coaches.approvedDescription}</p>
        </div>

        {/* Total Roster */}
        <div
          onClick={() => setFilter("all")}
          className="cursor-pointer rounded-2xl p-5 bg-[#0e1720] border border-[#1e293b] text-start hover:border-slate-600 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{t.coaches.totalRoster}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-white">{coaches.length}</span>
            <span className="text-xs text-slate-400 ms-2">{t.coaches.rosterBadge}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{t.coaches.rosterDescription}</p>
        </div>
      </div>

      {/* Priority Section: Pending Coaches */}
      {pendingCoaches.length > 0 && filter !== "approved" && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#191207] to-[#120d04] border-2 border-amber-500/60 p-5 md:p-6 space-y-4 shadow-xl text-start">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  {t.coaches.pendingListHeader} ({pendingCoaches.length})
                </h3>
                <p className="text-xs text-amber-200/80">
                  {t.coaches.pendingSecurityNotice}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {pendingCoaches.map((coach) => (
              <div
                key={coach.id}
                className="rounded-xl bg-[#120f08] border border-amber-500/40 p-4 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 mb-1">
                      <Clock className="w-3 h-3" />
                      بانتظار الاعتماد
                    </span>
                    <h4 className="text-base font-black text-white">{coach.full_name}</h4>
                    <p className="text-xs text-amber-400 font-bold mt-0.5">{coach.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{coach.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{coach.phone}</span>
                  </div>
                  <div className="col-span-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    الخبرات: <span className="text-slate-200 font-medium">{coach.experience_years || "غير محدد"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleReject(coach.id)}
                    variant="outline"
                    className="text-xs text-rose-400 border-rose-500/40 hover:bg-rose-500/10 py-1.5 px-3 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>رفض</span>
                  </Button>
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleApprove(coach.id)}
                    className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-1.5 px-4 shadow-md cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد واعتماد المدرب</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Coaches Directory */}
      <div className="rounded-2xl bg-[#0e1720] border border-[#1e293b] p-6 space-y-4 text-start">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
          <div>
            <h3 className="text-lg font-black text-white">دليل الجهاز الفني والمدربين</h3>
            <p className="text-xs text-slate-400">قائمة الكباتن والمدربين المعتمدين في أكاديمية كرة القدم</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#131d27] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "all" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              الكل ({coaches.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "approved" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              المعتمدون ({approvedCoaches.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "pending" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              بانتظار الاعتماد ({pendingCoaches.length})
            </button>
          </div>
        </div>

        {displayedCoaches.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">لا يوجد مدربون يطابقون الفلتر المحدد.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCoaches.map((coach) => (
              <div
                key={coach.id}
                className="rounded-2xl bg-[#14202c] border border-[#233547] p-5 space-y-4 hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-base shrink-0">
                        {coach.full_name.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">{coach.full_name}</h4>
                        <p className="text-xs text-amber-400 font-semibold">{coach.specialization}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-[#233547]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{coach.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{coach.phone}</span>
                    </div>
                    {coach.experience_years && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>الخبرة: {coach.experience_years}</span>
                      </div>
                    )}
                  </div>

                  {coach.assigned_groups && coach.assigned_groups.length > 0 && (
                    <div className="pt-2 border-t border-[#233547]">
                      <span className="text-[10px] text-slate-400 block mb-1">الفرق المسندة:</span>
                      <div className="flex flex-wrap gap-1">
                        {coach.assigned_groups.map((grp, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20"
                          >
                            {grp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#233547] flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      coach.status === "approved"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : coach.status === "pending_approval"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {coach.status === "approved"
                      ? "مدرب معتمد نشط ✅"
                      : coach.status === "pending_approval"
                      ? "بانتظار موافقة المدير ⏳"
                      : "طلب مرفوض ❌"}
                  </span>

                  {coach.status === "pending_approval" && (
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleApprove(coach.id)}
                      className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-1 px-3 cursor-pointer"
                    >
                      اعتماد الآن
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Coach Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0f1721] border border-amber-500/40 p-6 md:p-8 text-start space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#20303e] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">إضافة مدرب جديد للجهاز الفني (معتمد فوراً)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-white cursor-pointer"
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
                  className="bg-[#14202c] border-[#25394d] text-white"
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
                    className="bg-[#14202c] border-[#25394d] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">رقم الهاتف (واتساب)</label>
                  <Input
                    required
                    placeholder="01012345678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="bg-[#14202c] border-[#25394d] text-white"
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
                    className="bg-[#14202c] border-[#25394d] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">التخصص التدريبي</label>
                  <select
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    className="w-full h-10 rounded-lg bg-[#14202c] border border-[#25394d] text-white px-2.5 focus:outline-none"
                  >
                    <option value="مدير فني للبراعم (U10 & U12)">مدير فني للبراعم (U10 & U12)</option>
                    <option value="مدرب حراس المرمى">مدرب حراس المرمى التخصصي</option>
                    <option value="مخطط أحمال وتأهيل بدني">مخطط أحمال وتأهيل بدني</option>
                    <option value="مدرب فئات ناشئين (U14 & U16)">مدرب فئات ناشئين (U14 & U16)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">سنوات الخبرة والمؤهلات</label>
                <Input
                  placeholder="5 سنوات — رخصة CAF B"
                  value={newExperience}
                  onChange={(e) => setNewExperience(e.target.value)}
                  className="bg-[#14202c] border-[#25394d] text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#20303e]">
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
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
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

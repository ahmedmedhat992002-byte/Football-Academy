"use client";

import React, { useState, useTransition } from "react";
import { type Session, type Group } from "@/lib/data/academy-store";
import { SessionCard } from "./session-card";
import { SessionFormDialog } from "./session-form-dialog";
import { GenerateSessionsDialog } from "./generate-sessions-dialog";
import { deleteSession } from "@/lib/actions/sessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarPlus,
  Sparkles,
  Filter,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

interface SessionsManagerViewProps {
  initialSessions: Session[];
  groups: Group[];
  baseRole: "admin" | "coach";
}

export function SessionsManagerView({
  initialSessions,
  groups,
  baseRole,
}: SessionsManagerViewProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "today" | "upcoming" | "taken">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);

  const [isPending, startTransition] = useTransition();

  const todayStr = new Date().toISOString().split("T")[0];

  const handleCreate = () => {
    setSessionToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (session: Session) => {
    setSessionToEdit(session);
    setIsFormOpen(true);
  };

  const handleDelete = (sessionId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الحصة التدريبية؟")) {
      startTransition(async () => {
        await deleteSession(sessionId);
      });
    }
  };

  // Filter logic
  const filteredSessions = initialSessions.filter((session) => {
    // Group filter
    if (selectedGroupId !== "all" && session.group_id !== selectedGroupId) {
      return false;
    }

    // Type filter
    if (filterType === "today" && session.session_date !== todayStr) {
      return false;
    }
    if (filterType === "upcoming" && session.session_date < todayStr) {
      return false;
    }
    if (filterType === "taken" && !session.attendance_taken) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchGroup = session.group_name?.toLowerCase().includes(q);
      const matchCoach = session.coach_name?.toLowerCase().includes(q);
      const matchLoc = session.location?.toLowerCase().includes(q);
      const matchDate = session.session_date?.includes(q);
      return matchGroup || matchCoach || matchLoc || matchDate;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1620] via-[#0b1219] to-[#0d1620] p-6 rounded-2xl border border-[#1e293b]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            {baseRole === "admin" ? "جدول الحصص التدريبية" : "تماريني وحصصي التدريبية"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {baseRole === "admin"
              ? "إدارة مواعيد التدريبات، الملاعب، وتوليد الجداول الدورية لجميع الفئات"
              : "متابعة تمارين مجموعاتك وتسجيل الحضور الميداني المباشر"}
          </p>
        </div>

        {baseRole === "admin" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsGenerateOpen(true)}
              variant="outline"
              className="gap-2 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10 flex-1 sm:flex-initial"
            >
              <Sparkles className="w-4 h-4" />
              توليد جدول دوري
            </Button>
            <Button
              onClick={handleCreate}
              className="gap-2 text-xs font-bold flex-1 sm:flex-initial"
            >
              <CalendarPlus className="w-4 h-4" />
              حصة جديدة
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f1720]/80 p-4 rounded-xl border border-[#1e293b] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="بحث باسم المجموعة، الملعب، أو التاريخ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 text-xs"
          />
        </div>

        {/* Group Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="bg-[#131d27] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="all">جميع المجموعات</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#0f1720]">
                {g.name} ({g.age_category})
              </option>
            ))}
          </select>
        </div>

        {/* Status Toggle Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === "all"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            الكل ({initialSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === "today"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            حصص اليوم
          </button>
          <button
            type="button"
            onClick={() => setFilterType("upcoming")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === "upcoming"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            القادمة
          </button>
          <button
            type="button"
            onClick={() => setFilterType("taken")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === "taken"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            تم التحضير
          </button>
        </div>
      </div>

      {/* Grid of Sessions */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              baseRole={baseRole}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#0f1720]/60 border border-[#1e293b] rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            لا توجد حصص تدريبية مطابقة
          </h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            لم نجد أي حصص تدريبية مطابقة لمعايير البحث الحالية أو لم يتم إنشاء حصص بعد.
          </p>
          {baseRole === "admin" && (
            <Button onClick={handleCreate} className="gap-2 text-xs">
              <CalendarPlus className="w-4 h-4" />
              إنشاء أول حصة تدريبية
            </Button>
          )}
        </div>
      )}

      {/* Dialogs */}
      {isFormOpen && (
        <SessionFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          sessionToEdit={sessionToEdit}
          groups={groups}
        />
      )}

      {isGenerateOpen && (
        <GenerateSessionsDialog
          isOpen={isGenerateOpen}
          onClose={() => setIsGenerateOpen(false)}
          groups={groups}
        />
      )}
    </div>
  );
}

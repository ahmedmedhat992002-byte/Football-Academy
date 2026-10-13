"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Session } from "@/lib/data/academy-store";
import {
  type PlayerAttendanceRow,
  saveAttendanceBatchAction,
} from "@/lib/actions/attendance";
import { type AttendanceStatus } from "@/lib/validations/attendance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  PhoneCall,
  Save,
  Loader2,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
} from "lucide-react";
import { formatDate } from "@/lib/i18n/formatters";

interface QuickAttendanceViewProps {
  session: Session;
  initialRoster: PlayerAttendanceRow[];
  baseRole: "admin" | "coach";
}

export function QuickAttendanceView({
  session,
  initialRoster,
  baseRole,
}: QuickAttendanceViewProps) {
  const router = useRouter();
  const [roster, setRoster] = useState<PlayerAttendanceRow[]>(initialRoster);
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  const backUrl = baseRole === "admin" ? "/admin/sessions" : "/coach/sessions";

  // Quick statistics
  const presentCount = roster.filter((r) => r.status === "present").length;
  const absentCount = roster.filter((r) => r.status === "absent").length;
  const lateCount = roster.filter((r) => r.status === "late").length;
  const excusedCount = roster.filter((r) => r.status === "excused").length;
  const totalCount = roster.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Mark all present handler
  const handleMarkAllPresent = () => {
    setRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status: "present",
      }))
    );
    setSaveMessage("تم تعيين جميع اللاعبين كـ (حاضر)");
    setTimeout(() => setSaveMessage(null), 2500);
  };

  // Set single player status
  const handleStatusChange = (playerId: string, status: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.playerId === playerId ? { ...item, status } : item
      )
    );
  };

  // Update note
  const handleNoteChange = (playerId: string, note: string) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.playerId === playerId ? { ...item, note } : item
      )
    );
  };

  const toggleNote = (playerId: string) => {
    setOpenNotes((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  // Save handler
  const handleSave = () => {
    setErrorMessage(null);
    setSaveMessage(null);

    startTransition(async () => {
      const payload = {
        session_id: session.id,
        records: roster.map((r) => ({
          player_id: r.playerId,
          status: r.status,
          note: r.note || null,
        })),
      };

      const result = await saveAttendanceBatchAction(payload);
      if (result.success) {
        setSaveMessage("تم حفظ كشف الحضور بنجاح!");
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setErrorMessage(result.error || "فشل حفظ كشف الحضور");
      }
    });
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header */}
      <div className="bg-[#0b1219] border border-[#1e293b] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="gold" className="font-bold text-xs">
                  {session.age_category || "U10"}
                </Badge>
                <h1 className="text-lg sm:text-xl font-black text-white">
                  تسجيل حضور الميدان: {session.group_name}
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {formatDate(session.session_date)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300" dir="ltr">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {session.start_time} - {session.end_time}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {session.location}
                </span>
              </p>
            </div>
          </div>

          {/* Quick 1-click Mark All Present button */}
          <Button
            type="button"
            onClick={handleMarkAllPresent}
            variant="default"
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs py-2.5 shadow-lg shadow-amber-950/30"
          >
            <CheckCheck className="w-4 h-4" />
            تحضير الكل حاضر (دفعة واحدة)
          </Button>
        </div>

        {/* Live Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {/* Present */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-amber-400 font-semibold">حاضر</p>
              <p className="text-xl font-black text-white mt-0.5">{presentCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Absent */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-rose-400 font-semibold">غائب</p>
              <p className="text-xl font-black text-white mt-0.5">{absentCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>

          {/* Late */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-amber-400 font-semibold">متأخر</p>
              <p className="text-xl font-black text-white mt-0.5">{lateCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Excused */}
          <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-cyan-400 font-semibold">معتذر</p>
              <p className="text-xl font-black text-white mt-0.5">{excusedCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Attendance Percentage Progress */}
        <div className="mt-4 pt-3 border-t border-[#1e293b]/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            إجمالي اللاعبين المسجلين: <strong className="text-white">{totalCount}</strong>
          </span>
          <span>
            نسبة الحضور: <strong className="text-amber-400 font-bold">{attendanceRate}%</strong>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {saveMessage && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Roster Cards List */}
      <div className="space-y-3">
        {roster.map((player, index) => {
          const isNoteOpen = openNotes[player.playerId] || Boolean(player.note);

          return (
            <div
              key={player.playerId}
              className={`p-4 rounded-xl border transition-all ${
                player.status === "present"
                  ? "bg-[#141209] border-amber-500/40"
                  : player.status === "absent"
                  ? "bg-[#180e12] border-rose-500/40"
                  : player.status === "late"
                  ? "bg-[#18140c] border-amber-500/40"
                  : "bg-[#0b161c] border-cyan-500/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                {/* Player identity */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-amber-400 shrink-0 text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {player.playerName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>طوارئ: {player.emergencyPhone || "غير مسجل"}</span>
                      {player.emergencyPhone && (
                        <a
                          href={`tel:${player.emergencyPhone}`}
                          className="text-amber-400 hover:text-amber-300 p-0.5 rounded"
                          title="اتصال طارئ"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Note toggle button */}
                <button
                  type="button"
                  onClick={() => toggleNote(player.playerId)}
                  className={`text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                    player.note
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {player.note ? "تعديل الملاحظة" : "إضافة ملاحظة"}
                </button>
              </div>

              {/* 4 Big Touch Buttons for Coach (Mobile-Friendly) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* حاضر */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(player.playerId, "present")}
                  className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    player.status === "present"
                      ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-[1.02]"
                      : "bg-[#111c26] text-slate-300 hover:bg-[#152330] border border-slate-800"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  حاضر
                </button>

                {/* غائب */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(player.playerId, "absent")}
                  className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    player.status === "absent"
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-[1.02]"
                      : "bg-[#111c26] text-slate-300 hover:bg-[#152330] border border-slate-800"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  غائب
                </button>

                {/* متأخر */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(player.playerId, "late")}
                  className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    player.status === "late"
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-[1.02]"
                      : "bg-[#111c26] text-slate-300 hover:bg-[#152330] border border-slate-800"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  متأخر
                </button>

                {/* معتذر */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(player.playerId, "excused")}
                  className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    player.status === "excused"
                      ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 scale-[1.02]"
                      : "bg-[#111c26] text-slate-300 hover:bg-[#152330] border border-slate-800"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  معتذر
                </button>
              </div>

              {/* Collapsible note input */}
              {isNoteOpen && (
                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <input
                    type="text"
                    value={player.note}
                    onChange={(e) => handleNoteChange(player.playerId, e.target.value)}
                    placeholder="اكتب ملاحظة فنية أو عذر الغياب هنا..."
                    className="w-full bg-[#0a1118] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Bar (Always Accessible on Mobile) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0a1118]/95 backdrop-blur-md border-t border-[#1e293b] p-4 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block text-xs text-slate-300">
            <span>
              إجمالي الحضور: <strong className="text-amber-400 font-bold">{presentCount}</strong> / {totalCount} لاعب
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href={backUrl} className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full text-xs">
                رجوع
              </Button>
            </Link>

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 sm:flex-initial gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs py-3 px-6 shadow-xl shadow-amber-950/30"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ كشف الحضور الآن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

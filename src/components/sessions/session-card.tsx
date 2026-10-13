"use client";

import React from "react";
import Link from "next/link";
import { type Session } from "@/lib/data/academy-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/i18n/formatters";

interface SessionCardProps {
  session: Session;
  baseRole: "admin" | "coach";
  onEdit?: (session: Session) => void;
  onDelete?: (sessionId: string) => void;
}

export function SessionCard({
  session,
  baseRole,
  onEdit,
  onDelete,
}: SessionCardProps) {
  const isPast = new Date(session.session_date) < new Date(new Date().toDateString());
  const isToday =
    session.session_date === new Date().toISOString().split("T")[0];

  const attendanceUrl =
    baseRole === "admin"
      ? `/admin/attendance/${session.id}`
      : `/coach/attendance/${session.id}`;

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-amber-500/50 transition-all group bg-[#0e1720]/80 backdrop-blur-md border-[#1e293b]">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="gold" className="text-xs font-bold">
                {session.age_category || "U10"}
              </Badge>
              <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                {session.group_name}
              </h3>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                  اليوم
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>المدرب:</span>
              <span className="text-slate-200 font-medium">
                {session.coach_name || "كابتن محمود"}
              </span>
            </p>
          </div>

          {/* Action icons for admin */}
          {baseRole === "admin" && (
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(session)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="تعديل الحصة"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(session.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="حذف الحصة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="space-y-2 py-3 border-y border-[#1e293b]/70 my-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium text-slate-200">
              {formatDate(session.session_date)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span dir="ltr" className="text-slate-200 font-mono">
              {session.start_time} - {session.end_time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{session.location}</span>
          </div>

          {session.notes && (
            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80 mt-1 line-clamp-2">
              {session.notes}
            </p>
          )}
        </div>

        {/* Attendance Status */}
        <div className="mb-4">
          {session.attendance_taken ? (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تم تسجيل الحضور
                </span>
                <span className="text-[11px] text-slate-300">
                  {session.present_count || 0} حاضر من أصل {session.total_players || 14}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="text-amber-400 font-bold">
                  {session.present_count || 0} حاضر
                </span>
                <span className="text-rose-400">
                  {session.absent_count || 0} غائب
                </span>
                <span className="text-amber-400">
                  {session.late_count || 0} متأخر
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                بانتظار تسجيل الحضور
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {session.total_players || 14} لاعب
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Button */}
      <Link href={attendanceUrl} className="w-full">
        <Button
          variant={session.attendance_taken ? "outline" : "default"}
          className="w-full gap-2 text-xs font-bold py-2"
        >
          <ClipboardCheck className="w-4 h-4" />
          {session.attendance_taken
            ? "مراجعة كشف الحضور"
            : "تسجيل حضور الميدان (سريع)"}
        </Button>
      </Link>
    </Card>
  );
}

"use client";

import React, { useTransition } from "react";
import { type Player } from "@/lib/data/academy-store";
import { deletePlayer } from "@/lib/actions/players";
import { formatDate } from "@/lib/i18n/formatters";
import {
  User,
  Phone,
  Calendar,
  Users,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onEdit?: (player: Player) => void;
  canManage?: boolean;
}

export function PlayerCard({
  player,
  onEdit,
  canManage = true,
}: PlayerCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف اللاعب ${player.full_name}؟`)) {
      startTransition(async () => {
        await deletePlayer(player.id);
      });
    }
  };

  // Calculate age from birth date
  const getAge = (birthDateStr: string) => {
    try {
      const birthDate = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? age : 0;
    } catch {
      return null;
    }
  };

  const age = getAge(player.birth_date);

  // Status configuration
  const statusConfig = {
    active: {
      label: "نشط",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      dotClass: "bg-amber-500",
    },
    paused: {
      label: "موقوف مؤقتاً",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      dotClass: "bg-amber-500",
    },
    left: {
      label: "منسحب",
      badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
      dotClass: "bg-rose-500",
    },
  }[player.status || "active"];

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all text-start flex flex-col justify-between group">
      <div>
        {/* Header: Avatar, Name & Status */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-bold border border-slate-200 group-hover:border-amber-400 transition-colors">
              <User className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-900 group-hover:text-amber-500 transition-colors">
                {player.full_name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>
                  {formatDate(player.birth_date, { day: "numeric", month: "short", year: "numeric" })}
                  {age !== null ? ` (${age} سنة)` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${statusConfig.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Info Rows: Group & Emergency Phone */}
        <div className="mt-3.5 space-y-2.5 text-xs text-slate-600 font-medium">
          {/* Group */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users className="h-3.5 w-3.5" />
              <span>المجموعة:</span>
            </div>
            <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              {player.group_name || "غير محدد"}
            </span>
          </div>

          {/* Emergency Phone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Phone className="h-3.5 w-3.5 text-amber-500" />
              <span>هاتف الطوارئ:</span>
            </div>
            <a
              href={`tel:${player.emergency_phone}`}
              className="font-mono font-bold text-amber-500 hover:underline"
              dir="ltr"
            >
              {player.emergency_phone}
            </a>
          </div>

          {/* Notes */}
          {player.notes && (
            <div className="rounded-xl bg-slate-50/70 p-2.5 border border-slate-100 text-[11px] text-slate-600 mt-2 line-clamp-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-0.5">
                <FileText className="h-3 w-3" />
                <span>ملاحظات:</span>
              </div>
              <p>{player.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      {canManage && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onEdit?.(player)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>تعديل</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>حذف</span>
          </button>
        </div>
      )}
    </div>
  );
}

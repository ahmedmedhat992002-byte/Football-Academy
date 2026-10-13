"use client";

import React, { useTransition } from "react";
import { type Group } from "@/lib/data/academy-store";
import { deleteGroup } from "@/lib/actions/groups";
import { t } from "@/lib/i18n/translations";
import {
  Users,
  Calendar,
  UserCheck,
  Edit,
  Trash2,
  Clock,
  ChevronLeft,
} from "lucide-react";

interface GroupCardProps {
  group: Group;
  onEdit?: (group: Group) => void;
  canManage?: boolean;
}

export function GroupCard({
  group,
  onEdit,
  canManage = true,
}: GroupCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف ${group.name}؟`)) {
      startTransition(async () => {
        await deleteGroup(group.id);
      });
    }
  };

  const dayLabels: Record<string, string> = {
    Saturday: "السبت",
    Sunday: "الأحد",
    Monday: "الإثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all text-start flex flex-col justify-between group">
      <div>
        {/* Header: Category Badge & Player Count */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-black text-amber-500">
            {group.age_category}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <Users className="h-3.5 w-3.5 text-amber-500" />
            <span>{group.players_count || 0} لاعب</span>
          </div>
        </div>

        {/* Group Name & Coach */}
        <div className="mt-4 space-y-2">
          <h3 className="text-base font-black text-slate-900 group-hover:text-amber-500 transition-colors">
            {group.name}
          </h3>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <UserCheck className="h-4 w-4 text-slate-400" />
            <span>المدرب المسؤول: {group.coach_name || "كابتن أحمد"}</span>
          </div>
        </div>

        {/* Training Days Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>أيام التدريب:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {group.training_days.map((day, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
              >
                {dayLabels[day] || day}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      {canManage && (
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onEdit?.(group)}
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

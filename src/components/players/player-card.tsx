"use client";

import React, { useState, useTransition } from "react";
import { type Player } from "@/lib/data/academy-store";
import { deletePlayer, togglePlayerKit } from "@/lib/actions/players";
import { formatDate } from "@/lib/i18n/formatters";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { WhatsAppTemplates } from "@/lib/utils/whatsapp";
import { InjuryDialog } from "./injury-dialog";
import { BadgeAwardDialog } from "./badge-award-dialog";
import {
  User,
  Phone,
  Calendar,
  Users,
  Edit,
  Trash2,
  FileText,
  Shirt,
  Sparkles,
  HeartPulse,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onEdit?: (player: Player) => void;
  onDelete?: (playerId: string) => void;
  onPlayerUpdated?: (player: Player) => void;
  canManage?: boolean;
}

export function PlayerCard({
  player,
  onEdit,
  onDelete,
  onPlayerUpdated,
  canManage = true,
}: PlayerCardProps) {
  const [isPending, startTransition] = useTransition();
  const [injuryOpen, setInjuryOpen] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [kitReceived, setKitReceived] = useState<boolean>(
    (player as any).kit_received || false
  );

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف اللاعب ${player.full_name} نهائياً؟`)) {
      onDelete?.(player.id);
      startTransition(async () => {
        const res = await deletePlayer(player.id);
        if (!res.success) {
          alert("تعذر حذف اللاعب");
          window.location.reload();
        }
      });
    }
  };

  const handleToggleKit = () => {
    if (!canManage) return;
    const nextVal = !kitReceived;
    setKitReceived(nextVal);
    startTransition(async () => {
      await togglePlayerKit(player.id, nextVal, (player as any).kit_size || "M");
    });
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

  const activeInjury = player.active_injury;
  const kitSize = (player as any).kit_size || "M";

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all text-start flex flex-col justify-between group relative overflow-hidden">
      <div>
        {/* Active Injury Banner if Injured */}
        {activeInjury && (
          <div
            onClick={() => setInjuryOpen(true)}
            className="mb-3 -mt-2 -mx-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-black flex items-center justify-between cursor-pointer hover:bg-rose-500/15 transition-all"
            title="انقر لإدارة السجل الطبي أو تسجيل التعافي"
          >
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
              <span>مصاب: {activeInjury.injury_type}</span>
            </div>
            {activeInjury.expected_return_date && (
              <span className="text-[10px] text-rose-500 font-bold">
                عودة: {activeInjury.expected_return_date}
              </span>
            )}
          </div>
        )}

        {/* Header: Avatar, Name & Status */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-bold border border-slate-200 group-hover:border-amber-400 transition-colors">
              <User className="h-6 w-6 text-slate-500" />
              {(player as any).jersey_number && (
                <span className="absolute -bottom-1 -left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-md shadow-xs">
                  #{(player as any).jersey_number}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm md:text-base font-black text-slate-900 group-hover:text-amber-500 transition-colors">
                  {player.full_name}
                </h3>
                {player.badges_count && player.badges_count > 0 ? (
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-black bg-amber-500/20 text-amber-600 border border-amber-500/30 px-1.5 py-0.5 rounded-full"
                    title={`حائز على ${player.badges_count} وسام تشجيعي`}
                  >
                    ⭐ {player.badges_count}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>
                  {formatDate(player.birth_date, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
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

        {/* Info Rows: Group, Emergency Phone, Kit Distribution */}
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

          {/* Kit Delivery Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Shirt className="h-3.5 w-3.5 text-amber-500" />
              <span>الزي الرياضي (مقاس {kitSize}):</span>
            </div>
            <button
              type="button"
              onClick={handleToggleKit}
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                kitReceived
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
              title="انقر لتغيير حالة تسليم طقم الأكاديمية"
            >
              {kitReceived ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>تم التسليم</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span>لم يستلم بعد</span>
                </>
              )}
            </button>
          </div>

          {/* Emergency Phone & WhatsApp Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Phone className="h-3.5 w-3.5 text-amber-500" />
              <span>ولي الأمر:</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${player.emergency_phone}`}
                className="font-mono font-bold text-slate-800 hover:text-amber-500 text-xs"
                dir="ltr"
              >
                {player.emergency_phone}
              </a>
              <WhatsAppButton
                phone={player.emergency_phone}
                message={`مرحباً ولي أمر البطل (${player.full_name})، نتواصل معكم من إدارة أكاديمية FIFA FC ACADEMY ⚽`}
                variant="outline"
                size="sm"
                label="مراسلة"
              />
            </div>
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
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Medical button */}
          <button
            type="button"
            onClick={() => setInjuryOpen(true)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
              activeInjury
                ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
            title="السجل الطبي والإصابات"
          >
            <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
            <span className="hidden sm:inline">إصابة</span>
          </button>

          {/* Badge award button */}
          <button
            type="button"
            onClick={() => setBadgeOpen(true)}
            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-all flex items-center gap-1"
            title="منح وسام تشجيعي / نجم الأسبوع"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden sm:inline">تكريم</span>
          </button>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(player)}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>تعديل</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>حذف</span>
            </button>
          </div>
        )}
      </div>

      {/* Injury Dialog */}
      <InjuryDialog
        open={injuryOpen}
        onOpenChange={setInjuryOpen}
        player={player}
        onSaved={() => {
          // Trigger revalidation
          window.location.reload();
        }}
      />

      {/* Badge Award Dialog */}
      <BadgeAwardDialog
        open={badgeOpen}
        onOpenChange={setBadgeOpen}
        player={player}
        onSaved={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}

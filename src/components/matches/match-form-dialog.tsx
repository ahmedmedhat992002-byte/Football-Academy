"use client";

import React, { useState } from "react";
import { type AcademyMatch, type Group, type MatchType } from "@/lib/data/academy-store";
import { createMatch, updateMatch } from "@/lib/actions/matches";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react";

interface MatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: Group[];
  matchToEdit?: AcademyMatch | null;
  onSaved?: () => void;
}

export function MatchFormDialog({
  open,
  onOpenChange,
  groups,
  matchToEdit,
  onSaved,
}: MatchFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groupId, setGroupId] = useState(matchToEdit?.group_id || groups[0]?.id || "");
  const [opponent, setOpponent] = useState(matchToEdit?.opponent || "");
  const [matchDate, setMatchDate] = useState(
    matchToEdit?.match_date || new Date().toISOString().split("T")[0]
  );
  const [matchTime, setMatchTime] = useState(matchToEdit?.match_time || "17:00");
  const [location, setLocation] = useState(
    matchToEdit?.location || "الملعب الرئيسي للأكاديمية"
  );
  const [matchType, setMatchType] = useState<MatchType>(
    matchToEdit?.match_type || "friendly"
  );
  const [notes, setNotes] = useState(matchToEdit?.notes || "");

  React.useEffect(() => {
    if (matchToEdit) {
      setGroupId(matchToEdit.group_id);
      setOpponent(matchToEdit.opponent);
      setMatchDate(matchToEdit.match_date);
      setMatchTime(matchToEdit.match_time);
      setLocation(matchToEdit.location);
      setMatchType(matchToEdit.match_type);
      setNotes(matchToEdit.notes || "");
    } else {
      setGroupId(groups[0]?.id || "");
      setOpponent("");
      setMatchDate(new Date().toISOString().split("T")[0]);
      setMatchTime("17:00");
      setLocation("الملعب الرئيسي للأكاديمية");
      setMatchType("friendly");
      setNotes("");
    }
    setError(null);
  }, [matchToEdit, groups, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim()) {
      setError("يرجى إدخال اسم الفريق المنافس");
      return;
    }
    if (!groupId) {
      setError("يرجى اختيار الفريق المشارك");
      return;
    }

    setLoading(true);
    setError(null);

    const selectedGroup = groups.find((g) => g.id === groupId);

    try {
      if (matchToEdit) {
        const res = await updateMatch(matchToEdit.id, {
          group_id: groupId,
          group_name: selectedGroup?.name,
          opponent,
          match_date: matchDate,
          match_time: matchTime,
          location,
          match_type: matchType,
          notes,
        });
        if (!res.success) {
          setError(res.error || "حدث خطأ أثناء التعديل");
          setLoading(false);
          return;
        }
      } else {
        const res = await createMatch({
          group_id: groupId,
          group_name: selectedGroup?.name,
          opponent,
          match_date: matchDate,
          match_time: matchTime,
          location,
          match_type: matchType,
          status: "upcoming",
          notes,
        });
        if (!res.success) {
          setError(res.error || "حدث خطأ أثناء إضافة المباراة");
          setLoading(false);
          return;
        }
      }

      onOpenChange(false);
      if (onSaved) onSaved();
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-[#0c141d] border-amber-500/30 text-white">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2 text-lg font-black text-amber-400">
            <Trophy className="h-5 w-5" />
            <span>{matchToEdit ? "تعديل موعد المباراة" : "جدولة مباراة جديدة"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-start">
              {error}
            </div>
          )}

          {/* Group */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-amber-400" />
              الفريق / المجموعة المشاركة
            </Label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-xl bg-[#141e2b] border border-[#233347] px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.age_category})
                </option>
              ))}
            </select>
          </div>

          {/* Opponent */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300">
              اسم الفريق المنافس / الأكاديمية المقابلة
            </Label>
            <Input
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="مثال: أكاديمية الأهلي - براعم الزمالك - نجوم المستقبل"
              className="bg-[#141e2b] border-[#233347] text-white text-xs"
              required
            />
          </div>

          {/* Match Type */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300">نوع المباراة</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "friendly", label: "مباراة ودية 🤝" },
                { type: "tournament", label: "بطولة كروية 🏆" },
                { type: "league", label: "دوري رسمي 🥇" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setMatchType(item.type as MatchType)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    matchType === item.type
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs"
                      : "bg-[#141e2b] text-slate-400 border-[#233347] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 text-start">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                تاريخ المباراة
              </Label>
              <Input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="bg-[#141e2b] border-[#233347] text-white text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                وقت الانطلاق
              </Label>
              <Input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="bg-[#141e2b] border-[#233347] text-white text-xs"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              مكان إقامة المباراة
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: الملعب الرئيسي للأكاديمية - ملعب النادي الرياضي"
              className="bg-[#141e2b] border-[#233347] text-white text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300">ملاحظات وتعليمات للمباراة</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: الحضور بالزي الأساسي الأسود - التجمع قبل المباراة بـ 45 دقيقة"
              className="bg-[#141e2b] border-[#233347] text-white text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-3 border-t border-[#1e2a39]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#233347] text-slate-300 hover:bg-[#152332]"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black"
            >
              {loading && <Loader2 className="h-4 w-4 me-1.5 animate-spin" />}
              {matchToEdit ? "حفظ التعديلات" : "تأكيد الجدولة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

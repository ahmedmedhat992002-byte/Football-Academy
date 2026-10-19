"use client";

import React, { useState } from "react";
import { type Player, type PlayerInjury } from "@/lib/data/academy-store";
import {
  recordInjury,
  updateInjuryStatus,
  deleteInjury,
} from "@/lib/actions/injuries";
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
import { Activity, HeartPulse, CheckCircle2, Trash2, Loader2 } from "lucide-react";

interface InjuryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player | null;
  onSaved?: () => void;
}

const COMMON_INJURIES = [
  "شد عضلي في العضلة الخلفية",
  "التواء في الكاحل (أنكل)",
  "كدمة في الركبة",
  "إجهاد عضلي عام",
  "إصابة مشط القدم",
  "نزلة برد ووعكة صحية",
];

export function InjuryDialog({
  open,
  onOpenChange,
  player,
  onSaved,
}: InjuryDialogProps) {
  const [loading, setLoading] = useState(false);
  const activeInjury = player?.active_injury;

  const [injuryType, setInjuryType] = useState(
    activeInjury?.injury_type || COMMON_INJURIES[0]
  );
  const [description, setDescription] = useState(activeInjury?.description || "");
  const [injuryDate, setInjuryDate] = useState(
    activeInjury?.injury_date || new Date().toISOString().split("T")[0]
  );
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    activeInjury?.expected_return_date || ""
  );
  const [doctorNotes, setDoctorNotes] = useState(activeInjury?.doctor_notes || "");

  React.useEffect(() => {
    if (activeInjury) {
      setInjuryType(activeInjury.injury_type);
      setDescription(activeInjury.description || "");
      setInjuryDate(activeInjury.injury_date);
      setExpectedReturnDate(activeInjury.expected_return_date || "");
      setDoctorNotes(activeInjury.doctor_notes || "");
    } else {
      setInjuryType(COMMON_INJURIES[0]);
      setDescription("");
      setInjuryDate(new Date().toISOString().split("T")[0]);
      setExpectedReturnDate("");
      setDoctorNotes("");
    }
  }, [activeInjury, open]);

  if (!player) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeInjury) {
        await updateInjuryStatus(
          activeInjury.id,
          "active",
          doctorNotes || description
        );
      } else {
        await recordInjury({
          player_id: player.id,
          player_name: player.full_name,
          injury_type: injuryType,
          description,
          injury_date: injuryDate,
          expected_return_date: expectedReturnDate || undefined,
          status: "active",
          doctor_notes: doctorNotes,
        });
      }

      onOpenChange(false);
      if (onSaved) onSaved();
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRecovered = async () => {
    if (!activeInjury) return;
    setLoading(true);
    try {
      await updateInjuryStatus(activeInjury.id, "recovered", "تم التعافي بالكامل والعودة للتمارين");
      onOpenChange(false);
      if (onSaved) onSaved();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-[#0c141d] border-amber-500/30 text-white">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2 text-lg font-black text-amber-400">
            <HeartPulse className="h-5 w-5 text-rose-400" />
            <span>السجل الطبي وإصابات اللاعب</span>
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-1">
            اللاعب: <span className="font-bold text-white">{player.full_name}</span>
          </p>
        </DialogHeader>

        {activeInjury && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-start space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                مسجل كلاعب مصاب حالياً
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleMarkRecovered}
                disabled={loading}
                className="h-7 text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                تأكيد التعافي والعودة
              </Button>
            </div>
            <p className="text-xs text-slate-300">
              {activeInjury.injury_type} — منذ: {activeInjury.injury_date}
            </p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 py-1">
          {/* Injury Type */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300">نوع الإصابة أو الشكوى</Label>
            <Input
              value={injuryType}
              onChange={(e) => setInjuryType(e.target.value)}
              placeholder="مثال: شد عضلي في العضلة الخلفية"
              className="bg-[#141e2b] border-[#233347] text-white text-xs"
              required
            />
            {/* Quick choices */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_INJURIES.slice(0, 4).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setInjuryType(item)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#162232] text-slate-300 hover:text-amber-300 border border-[#233347]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 text-start">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">تاريخ الإصابة</Label>
              <Input
                type="date"
                value={injuryDate}
                onChange={(e) => setInjuryDate(e.target.value)}
                className="bg-[#141e2b] border-[#233347] text-white text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">تاريخ العودة المتوقع</Label>
              <Input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="bg-[#141e2b] border-[#233347] text-white text-xs"
              />
            </div>
          </div>

          {/* Doctor Notes */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300">
              توصيات الطبيب / المعالج الطبيعي
            </Label>
            <Input
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="مثال: راحة سلبية لمدة 5 أيام، كمادات ثلج، جلسات تأهيل خفيف"
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
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 text-white font-black"
            >
              {loading && <Loader2 className="h-4 w-4 me-1.5 animate-spin" />}
              {activeInjury ? "تحديث بيانات الإصابة" : "تسجيل الإصابة في الملف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

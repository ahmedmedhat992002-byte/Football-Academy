"use client";

import React, { useState } from "react";
import {
  type Player,
  type BadgeType,
  BADGE_DEFINITIONS,
} from "@/lib/data/academy-store";
import { awardBadge } from "@/lib/actions/badges";
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
import { Award, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

interface BadgeAwardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player | null;
  coachName?: string;
  onSaved?: () => void;
}

export function BadgeAwardDialog({
  open,
  onOpenChange,
  player,
  coachName = "الجهاز الفني",
  onSaved,
}: BadgeAwardDialogProps) {
  const [loading, setLoading] = useState(false);
  const [badgeType, setBadgeType] = useState<BadgeType>("star_of_week");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  if (!player) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const def = BADGE_DEFINITIONS[badgeType];

    try {
      const res = await awardBadge({
        player_id: player.id,
        player_name: player.full_name,
        badge_type: badgeType,
        badge_title: def.title,
        awarded_date: new Date().toISOString().split("T")[0],
        coach_name: coachName,
        notes: notes.trim() || def.description,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onOpenChange(false);
          if (onSaved) onSaved();
        }, 1200);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-[#0c141d] border-amber-500/30 text-white">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2 text-lg font-black text-amber-400">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span>منح وسام تشجيعي / نجم الأسبوع</span>
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-1">
            تكريم البطل: <span className="font-bold text-white">{player.full_name}</span>
          </p>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-3xl animate-bounce">
              🌟
            </div>
            <h3 className="text-base font-black text-amber-300">
              تم منح الوسام للبطل بنجاح!
            </h3>
            <p className="text-xs text-slate-300">
              سيظهر الوسام التقديري مباشرة في ملف اللاعب وبوابة ولي الأمر.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Badges Selector */}
            <div className="space-y-2 text-start">
              <Label className="text-xs font-bold text-slate-300">اختر الوسام التقديري</Label>
              <div className="space-y-2">
                {(Object.entries(BADGE_DEFINITIONS) as [BadgeType, typeof BADGE_DEFINITIONS[BadgeType]][]).map(
                  ([type, def]) => (
                    <div
                      key={type}
                      onClick={() => setBadgeType(type)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        badgeType === type
                          ? "bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-950/40"
                          : "bg-[#141e2b] border-[#233347] text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <span className="text-2xl">{def.icon}</span>
                      <div className="text-start flex-1">
                        <div className="text-xs font-black text-amber-300">{def.title}</div>
                        <div className="text-[11px] text-slate-400">{def.description}</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5 text-start">
              <Label className="text-xs font-bold text-slate-300">كلمة تشجيعية من الكابتن للبطل</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: أحسنت يا بطل على الروح القتالية والالتزام العالي!"
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
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black shadow-lg shadow-amber-950/40"
              >
                {loading && <Loader2 className="h-4 w-4 me-1.5 animate-spin" />}
                منح الوسام وتتويج البطل 🌟
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import { type AcademyMatch, type Player } from "@/lib/data/academy-store";
import { updateMatch } from "@/lib/actions/matches";
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
import { Award, Star, Trophy, Loader2 } from "lucide-react";

interface MatchResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: AcademyMatch | null;
  players: Player[];
  onSaved?: () => void;
}

export function MatchResultDialog({
  open,
  onOpenChange,
  match,
  players,
  onSaved,
}: MatchResultDialogProps) {
  const [loading, setLoading] = useState(false);
  const [ourScore, setOurScore] = useState<number>(match?.our_score ?? 0);
  const [opponentScore, setOpponentScore] = useState<number>(match?.opponent_score ?? 0);
  const [scorersText, setScorersText] = useState<string>(
    match?.scorers ? match.scorers.join(", ") : ""
  );
  const [manOfTheMatch, setManOfTheMatch] = useState<string>(
    match?.man_of_the_match || ""
  );

  React.useEffect(() => {
    if (match) {
      setOurScore(match.our_score ?? 0);
      setOpponentScore(match.opponent_score ?? 0);
      setScorersText(match.scorers ? match.scorers.join(", ") : "");
      setManOfTheMatch(match.man_of_the_match || "");
    }
  }, [match, open]);

  if (!match) return null;

  // Filter players for this match's group
  const groupPlayers = players.filter(
    (p) => !match.group_id || p.group_id === match.group_id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const scorers = scorersText
      .split(/[,،]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateMatch(match.id, {
        our_score: ourScore,
        opponent_score: opponentScore,
        scorers,
        man_of_the_match: manOfTheMatch || null,
        status: "completed",
      });
      onOpenChange(false);
      if (onSaved) onSaved();
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
            <Trophy className="h-5 w-5" />
            <span>تسجيل نتيجة وأحداث المباراة</span>
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-1">
            ضد: <span className="font-bold text-white">{match.opponent}</span> — {match.group_name}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Scoreboard visual */}
          <div className="p-4 rounded-2xl bg-[#121c27] border border-[#233347] flex items-center justify-around text-center">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-400 block">أكاديميتنا</span>
              <Input
                type="number"
                min={0}
                max={99}
                value={ourScore}
                onChange={(e) => setOurScore(parseInt(e.target.value) || 0)}
                className="w-16 h-14 text-center text-2xl font-black bg-[#1a2636] border-amber-500/40 text-amber-300 mx-auto"
              />
            </div>

            <div className="text-xl font-black text-slate-500 self-center">VS</div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block truncate max-w-[110px]">
                {match.opponent}
              </span>
              <Input
                type="number"
                min={0}
                max={99}
                value={opponentScore}
                onChange={(e) => setOpponentScore(parseInt(e.target.value) || 0)}
                className="w-16 h-14 text-center text-2xl font-black bg-[#1a2636] border-[#233347] text-white mx-auto"
              />
            </div>
          </div>

          {/* Scorers */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>⚽</span>
              الهدافون / مسجلو الأهداف (مفصولين بفواصل)
            </Label>
            <Input
              value={scorersText}
              onChange={(e) => setScorersText(e.target.value)}
              placeholder="مثال: يوسف أحمد (2), كريم علي"
              className="bg-[#141e2b] border-[#233347] text-white text-xs"
            />
          </div>

          {/* Man of the match */}
          <div className="space-y-1.5 text-start">
            <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              رجل المباراة (Man of the Match ⭐)
            </Label>
            <select
              value={manOfTheMatch}
              onChange={(e) => setManOfTheMatch(e.target.value)}
              className="w-full rounded-xl bg-[#141e2b] border border-[#233347] px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            >
              <option value="">-- لم يتم الاختيار --</option>
              {groupPlayers.map((p) => (
                <option key={p.id} value={p.full_name}>
                  {p.full_name}
                </option>
              ))}
            </select>
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
              حفظ النتيجة واعتماد المباراة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

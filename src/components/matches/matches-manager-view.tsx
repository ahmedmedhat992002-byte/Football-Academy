"use client";

import React, { useState } from "react";
import {
  type AcademyMatch,
  type Group,
  type Player,
} from "@/lib/data/academy-store";
import { MatchFormDialog } from "./match-form-dialog";
import { MatchResultDialog } from "./match-result-dialog";
import { deleteMatch } from "@/lib/actions/matches";
import { formatDate } from "@/lib/i18n/formatters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Star,
  Swords,
  Trash2,
  Edit2,
  CheckCircle2,
  MessageSquareText,
} from "lucide-react";
import { WhatsAppTemplates, createWhatsAppLink } from "@/lib/utils/whatsapp";

interface MatchesManagerViewProps {
  initialMatches: AcademyMatch[];
  groups: Group[];
  players: Player[];
  canManage?: boolean;
}

export function MatchesManagerView({
  initialMatches,
  groups,
  players,
  canManage = true,
}: MatchesManagerViewProps) {
  const [matches, setMatches] = useState<AcademyMatch[]>(initialMatches);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState<AcademyMatch | null>(null);

  const [resultOpen, setResultOpen] = useState(false);
  const [matchForResult, setMatchForResult] = useState<AcademyMatch | null>(null);

  // Sync state if initialMatches updates
  React.useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  // Filter
  const filteredMatches = matches.filter((m) => {
    if (selectedGroup !== "all" && m.group_id !== selectedGroup) return false;
    if (selectedStatus !== "all" && m.status !== selectedStatus) return false;
    return true;
  });

  // Stats
  const upcomingCount = matches.filter((m) => m.status === "upcoming").length;
  const completedMatches = matches.filter((m) => m.status === "completed");
  const winsCount = completedMatches.filter(
    (m) => (m.our_score ?? 0) > (m.opponent_score ?? 0)
  ).length;
  const totalGoals = completedMatches.reduce(
    (acc, m) => acc + (m.our_score ?? 0),
    0
  );

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه المباراة؟")) {
      const res = await deleteMatch(id);
      if (res.success) {
        setMatches((prev) => prev.filter((m) => m.id !== id));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0c1622] via-[#16273b] to-[#0c1622] p-6 rounded-2xl border border-amber-500/30 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
            <Trophy className="h-3 w-3" />
            <span>منظومة المباريات والمنافسات</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">
            إدارة المباريات والبطولات الودية والرسمية
          </h1>
          <p className="text-xs text-slate-300">
            جدولة مواعيد المباريات، تسجيل نتائج وأهداف الأبطال، واختيار رجل المباراة
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => {
              setMatchToEdit(null);
              setFormOpen(true);
            }}
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black shadow-lg shadow-amber-950/40"
          >
            <Plus className="h-4 w-4 me-1.5" />
            جدولة مباراة جديدة
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-[#0d1520] border-[#1e2a38] text-start">
          <span className="text-[11px] font-bold text-slate-400">إجمالي المباريات</span>
          <div className="text-2xl font-black text-white mt-1">{matches.length}</div>
          <span className="text-[10px] text-amber-400 mt-1 block">ودية ورسمية</span>
        </Card>

        <Card className="p-4 bg-[#0d1520] border-[#1e2a38] text-start">
          <span className="text-[11px] font-bold text-slate-400">المباريات القادمة</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{upcomingCount}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">بانتظار الانطلاق</span>
        </Card>

        <Card className="p-4 bg-[#0d1520] border-[#1e2a38] text-start">
          <span className="text-[11px] font-bold text-slate-400">الانتصارات 🏆</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{winsCount}</div>
          <span className="text-[10px] text-emerald-500 mt-1 block">فوز مستحق لأبطالنا</span>
        </Card>

        <Card className="p-4 bg-[#0d1520] border-[#1e2a38] text-start">
          <span className="text-[11px] font-bold text-slate-400">الأهداف المسجلة ⚽</span>
          <div className="text-2xl font-black text-blue-400 mt-1">{totalGoals}</div>
          <span className="text-[10px] text-blue-400 mt-1 block">هدف بأقدام براعمنا</span>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0d1520] rounded-xl border border-[#1e2a38]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">تصفية حسب:</span>
          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-lg bg-[#141e2b] border border-[#233347] px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
          >
            <option value="all">كل الفرق والمجموعات</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.age_category})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg bg-[#141e2b] border border-[#233347] px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
          >
            <option value="all">كل الحالات</option>
            <option value="upcoming">المباريات القادمة</option>
            <option value="completed">المباريات المكتملة</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-bold">
          عرض {filteredMatches.length} من أصل {matches.length} مباراة
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((m) => {
            const isCompleted = m.status === "completed";
            const ourWon =
              isCompleted && (m.our_score ?? 0) > (m.opponent_score ?? 0);
            const draw =
              isCompleted && (m.our_score ?? 0) === (m.opponent_score ?? 0);

            return (
              <Card
                key={m.id}
                className="p-5 bg-[#0e1722] border-[#1e2a38] hover:border-amber-500/40 transition-all text-white space-y-4 shadow-lg"
              >
                {/* Header: Match Type & Group */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1b2633]">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        m.match_type === "tournament"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : m.match_type === "league"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }
                    >
                      {m.match_type === "tournament"
                        ? "بطولة رسمية 🏆"
                        : m.match_type === "league"
                        ? "دوري كروي 🥇"
                        : "مباراة ودية 🤝"}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400">
                      {m.group_name}
                    </span>
                  </div>

                  <Badge
                    className={
                      !isCompleted
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : ourWon
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : draw
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    }
                  >
                    {!isCompleted
                      ? "قادمة ⏳"
                      : ourWon
                      ? "فوز الأكاديمية 🥇"
                      : draw
                      ? "تعادل 🤝"
                      : "نهاية المباراة"}
                  </Badge>
                </div>

                {/* Scoreboard Block */}
                <div className="p-3.5 rounded-2xl bg-[#131d2a] border border-[#233347] flex items-center justify-between text-center">
                  <div className="flex-1 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-1 text-xs font-black text-amber-400">
                      FIFA
                    </div>
                    <span className="text-xs font-black text-white block">أكاديميتنا</span>
                    <span className="text-[10px] text-amber-400">{m.group_name}</span>
                  </div>

                  <div className="px-4 py-1.5 rounded-xl bg-[#090f16] border border-[#1e2a38]">
                    {isCompleted ? (
                      <div className="text-2xl font-black text-white tracking-widest">
                        <span className={ourWon ? "text-amber-400" : "text-white"}>
                          {m.our_score ?? 0}
                        </span>
                        <span className="text-slate-600 mx-2">-</span>
                        <span>{m.opponent_score ?? 0}</span>
                      </div>
                    ) : (
                      <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                        <Swords className="h-3.5 w-3.5" />
                        <span>ضد</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-1 text-xs font-black text-slate-300">
                      VS
                    </div>
                    <span className="text-xs font-black text-white block truncate max-w-[120px] mx-auto">
                      {m.opponent}
                    </span>
                    <span className="text-[10px] text-slate-400">المنافس</span>
                  </div>
                </div>

                {/* Scorers & Man of the Match */}
                {isCompleted && (
                  <div className="space-y-1.5 text-xs text-start bg-[#121c27] p-3 rounded-xl border border-[#1e2938]">
                    {m.scorers && m.scorers.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span>⚽</span>
                        <span className="font-bold">مسجلو الأهداف:</span>
                        <span className="text-amber-300">{m.scorers.join("، ")}</span>
                      </div>
                    )}
                    {m.man_of_the_match && (
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold">رجل المباراة:</span>
                        <span className="text-white font-black">{m.man_of_the_match}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Date, Time, Location */}
                <div className="grid grid-cols-2 gap-2 text-xs text-start text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span>{formatDate(m.match_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>{m.match_time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 truncate">
                    <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{m.location}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#1b2633] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {canManage && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setMatchForResult(m);
                          setResultOpen(true);
                        }}
                        className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold h-8"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                        {isCompleted ? "تعديل النتيجة" : "تسجيل النتيجة"}
                      </Button>
                    )}

                    {/* WhatsApp Announcement Link */}
                    <a
                      href={createWhatsAppLink(
                        "",
                        WhatsAppTemplates.matchNotice({
                          playerName: "أبطال فريق " + (m.group_name || ""),
                          opponent: m.opponent,
                          matchDate: formatDate(m.match_date),
                          matchTime: m.match_time,
                          location: m.location,
                        })
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold transition-all h-8"
                      title="مشاركة إعلان المباراة عبر الواتساب"
                    >
                      <MessageSquareText className="h-3.5 w-3.5" />
                      <span>إعلان واتساب</span>
                    </a>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setMatchToEdit(m);
                          setFormOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2636] transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-[#0d1520] border-[#1e2a38] space-y-3">
          <Trophy className="h-10 w-10 text-amber-400 mx-auto" />
          <p className="text-base font-black text-white">لا توجد مباريات مسجلة حالياً</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            يمكنك جدولة أول مباراة ودية أو بطولة قادمة للأكاديمية والبدء في تسجيل
            الأهداف والنتائج.
          </p>
          {canManage && (
            <Button
              onClick={() => {
                setMatchToEdit(null);
                setFormOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs mt-2"
            >
              <Plus className="h-4 w-4 me-1" />
              جدولة أول مباراة الآن
            </Button>
          )}
        </Card>
      )}

      {/* Match Form Dialog */}
      <MatchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        groups={groups}
        matchToEdit={matchToEdit}
        onSaved={async () => {
          // Re-fetch matches from server
          const { getMatches } = await import("@/lib/actions/matches");
          const fresh = await getMatches();
          setMatches(fresh);
        }}
      />

      {/* Match Result Dialog */}
      <MatchResultDialog
        open={resultOpen}
        onOpenChange={setResultOpen}
        match={matchForResult}
        players={players}
        onSaved={async () => {
          const { getMatches } = await import("@/lib/actions/matches");
          const fresh = await getMatches();
          setMatches(fresh);
        }}
      />
    </div>
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getGroups } from "@/lib/actions/groups";
import { getPlayers } from "@/lib/actions/players";
import { GroupCard } from "@/components/groups/group-card";
import { PlayersManagerView } from "@/components/players/players-manager-view";
import { Users2, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoachGroupsPage() {
  const user = await getCurrentUser();
  const coachId = user?.id || "00000000-0000-0000-0000-000000000002";

  const [allGroups, allPlayers] = await Promise.all([
    getGroups(),
    getPlayers(),
  ]);

  // Coach only sees their assigned groups
  const coachGroups = allGroups.filter(
    (g) => g.coach_id === coachId || g.coach_name?.includes("محمود")
  );

  const coachGroupIds = coachGroups.map((g) => g.id);
  const coachPlayers = allPlayers.filter(
    (p) => p.group_id && coachGroupIds.includes(p.group_id)
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1620] via-[#152332] to-[#0c1620] border border-amber-500/30 p-6 text-white shadow-xl text-start">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 mb-2">
          <Shield className="h-3.5 w-3.5 text-amber-400" />
          <span>مجموعات الكابتن المعتمدة</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black">
          المجموعات واللاعبين تحت إشرافك
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          قائمة الفرق التدريبية المسندة إليك واللاعبين المقيدين بكل فئة سنية
        </p>
      </div>

      {/* Coach Groups Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-start">
          <Users2 className="h-5 w-5 text-amber-600" />
          <h2 className="text-base font-extrabold text-slate-900">
            المجموعات التدريبية المخصصة ({coachGroups.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coachGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              canManage={false}
            />
          ))}
        </div>
      </div>

      {/* Coach Players Section */}
      <div className="pt-4 border-t border-slate-200">
        <PlayersManagerView
          initialPlayers={coachPlayers}
          groups={coachGroups}
          canManage={false}
        />
      </div>
    </div>
  );
}

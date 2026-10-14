"use client";

import React, { useState } from "react";
import { type Player, type Group } from "@/lib/data/academy-store";
import { PlayerCard } from "./player-card";
import { PlayerFormDialog } from "./player-form-dialog";
import { PlayersFilterBar } from "./players-filter-bar";
import { Button } from "@/components/ui/button";
import { UserCheck, Plus } from "lucide-react";
import { t } from "@/lib/i18n/translations";

interface PlayersManagerViewProps {
  initialPlayers: Player[];
  groups: Group[];
  canManage?: boolean;
}

export function PlayersManagerView({
  initialPlayers,
  groups,
  canManage = true,
}: PlayersManagerViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);

  // Client-side filtering for fast responsive UI
  const filteredPlayers = initialPlayers.filter((player) => {
    // Group filter
    if (selectedGroup !== "all" && player.group_id !== selectedGroup) {
      return false;
    }

    // Status filter
    if (selectedStatus !== "all" && player.status !== selectedStatus) {
      return false;
    }

    // Search term filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const matchName = player.full_name.toLowerCase().includes(term);
      const matchPhone = player.emergency_phone.includes(term);
      const matchNotes = player.notes ? player.notes.toLowerCase().includes(term) : false;
      return matchName || matchPhone || matchNotes;
    }

    return true;
  });

  const activeCount = initialPlayers.filter((p) => p.status === "active").length;
  const pausedCount = initialPlayers.filter((p) => p.status === "paused").length;

  const handleCreate = () => {
    setPlayerToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (player: Player) => {
    setPlayerToEdit(player);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="text-start">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900">
              {t.players.recordsTitle}
            </h1>
            <span className="rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-black px-2.5 py-0.5">
              {filteredPlayers.length} {t.players.playerUnit}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span>{t.players.activeCountLabel}: <strong className="text-amber-500">{activeCount}</strong></span>
            <span>•</span>
            <span>{t.players.pausedCountLabel}: <strong className="text-amber-700">{pausedCount}</strong></span>
          </div>
        </div>

        {canManage && (
          <Button
            type="button"
            variant="pitch"
            onClick={handleCreate}
            className="gap-2 font-bold shadow-md h-11"
          >
            <Plus className="h-4 w-4" />
            <span>{t.players.addPlayer}</span>
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <PlayersFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        groups={groups}
      />

      {/* Players Grid */}
      {initialPlayers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <UserCheck className="h-12 w-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-black text-slate-800">
            {t.players.noPlayersTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {t.players.noPlayersDesc}
          </p>
          {canManage && (
            <Button variant="pitch" onClick={handleCreate} className="mt-3 font-bold px-6">
              {t.players.addPlayer}
            </Button>
          )}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center space-y-3">
          <UserCheck className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">{t.players.noResultsTitle}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t.players.noResultsDesc}
          </p>
          {canManage && (
            <Button variant="pitch" onClick={handleCreate} className="mt-2 font-bold">
              {t.players.addPlayer}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onEdit={handleEdit}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <PlayerFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        playerToEdit={playerToEdit}
        groups={groups}
      />
    </div>
  );
}

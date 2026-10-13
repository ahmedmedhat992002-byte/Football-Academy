"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";
import { type Group } from "@/lib/data/academy-store";

interface PlayersFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedGroup: string;
  onGroupChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  groups: Group[];
}

export function PlayersFilterBar({
  searchTerm,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  selectedStatus,
  onStatusChange,
  groups,
}: PlayersFilterBarProps) {
  const hasFilters = searchTerm !== "" || selectedGroup !== "all" || selectedStatus !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onGroupChange("all");
    onStatusChange("all");
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-start">
      {/* Search Input */}
      <div className="relative flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث باسم اللاعب، الهاتف، أو الملاحظات..."
          className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 ps-4 pe-10 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-start"
        />
        <div className="absolute end-3 top-2.5 text-slate-400 pointer-events-none">
          <Search className="h-4 w-4" />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Group Selector */}
        <select
          value={selectedGroup}
          onChange={(e) => onGroupChange(e.target.value)}
          className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-amber-500"
        >
          <option value="all">كل المجموعات</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name} ({group.age_category})
            </option>
          ))}
        </select>

        {/* Status Selector */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-amber-500"
        >
          <option value="all">كل الحالات</option>
          <option value="active">النشطون فقط</option>
          <option value="paused">الموقوفون مؤقتاً</option>
          <option value="left">المنسحبون</option>
        </select>

        {/* Clear Filters Button */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 h-10 rounded-xl px-3 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>إعادة ضبط</span>
          </button>
        )}
      </div>
    </div>
  );
}

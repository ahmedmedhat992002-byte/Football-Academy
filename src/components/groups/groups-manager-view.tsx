"use client";

import React, { useState } from "react";
import { type Group } from "@/lib/data/academy-store";
import { GroupCard } from "./group-card";
import { GroupFormDialog } from "./group-form-dialog";
import { Button } from "@/components/ui/button";
import { Users, Plus, Sparkles } from "lucide-react";

interface GroupsManagerViewProps {
  initialGroups: Group[];
}

export function GroupsManagerView({ initialGroups }: GroupsManagerViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  const handleCreate = () => {
    setGroupToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (group: Group) => {
    setGroupToEdit(group);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="text-start">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900">
              المجموعات والفئات السنية
            </h1>
            <span className="rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-black px-2.5 py-0.5">
              {initialGroups.length} مجموعات
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة فرق الأكاديمية، تعيين الكباتن وتحديد مواعيد وأيام التدريب الأسبوعية
          </p>
        </div>

        <Button
          type="button"
          variant="pitch"
          onClick={handleCreate}
          className="gap-2 font-bold shadow-md h-11"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مجموعة جديدة</span>
        </Button>
      </div>

      {/* Groups Grid */}
      {initialGroups.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد مجموعات حالياً</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ابدأ بإضافة أول فئة سنية لتقسيم اللاعبين وتوزيعهم على الكباتن وجداول التمارين.
          </p>
          <Button variant="pitch" onClick={handleCreate} className="mt-2 font-bold">
            إضافة أول مجموعة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {initialGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={handleEdit}
              canManage={true}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <GroupFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        groupToEdit={groupToEdit}
      />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/i18n/formatters";
import type { Group } from "@/lib/data/academy-store";
import { ChevronLeft } from "lucide-react";

interface CoachAssignedGroupsCardProps {
  coachGroups: Group[];
}

export function CoachAssignedGroupsCard({
  coachGroups,
}: CoachAssignedGroupsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
        <div className="text-start">
          <CardTitle className="text-base font-bold text-slate-900">
            مجموعاتك التدريبية
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            الفئات السنية وجداول تدريبات كل مجموعة
          </p>
        </div>
        <Link href="/coach/groups">
          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 text-xs font-bold cursor-pointer">
            عرض الكل
            <ChevronLeft className="h-3.5 w-3.5 ms-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {coachGroups.map((grp) => (
          <div
            key={grp.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-start"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{grp.name}</span>
                <Badge variant="outline" className="text-xs font-semibold border-amber-300 text-amber-800 bg-amber-50">
                  {grp.age_category}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>أيام التدريب: {Array.isArray(grp.training_days) ? grp.training_days.join("، ") : "الأحد، الثلاثاء"}</span>
                <span>•</span>
                <span>{formatNumber(grp.players_count || 16)} لاعباً</span>
              </p>
            </div>

            <Link href="/coach/pitch">
              <Button size="sm" variant="outline" className="text-xs font-bold border-amber-200 text-amber-800 hover:bg-amber-50 cursor-pointer">
                بدء التمرين
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

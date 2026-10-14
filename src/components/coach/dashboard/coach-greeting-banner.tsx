import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface CoachGreetingBannerProps {
  coachName: string;
  assignedGroupsSummary: string;
}

export function CoachGreetingBanner({
  coachName,
  assignedGroupsSummary,
}: CoachGreetingBannerProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#0c1620] via-[#152332] to-[#0c1620] p-6 text-white shadow-xl border border-amber-500/30">
      <div className="flex items-center gap-4 text-start">
        <div className="relative h-14 w-14 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-lg shadow-amber-500/25">
          <Image
            src="/images/logo.png"
            alt="FIFA FC ACADEMY"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
            <Zap className="h-3.5 w-3.5" />
            <span>FIFA FC ACADEMY • الجهاز الفني الميداني</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            كابتن {coachName}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
            المجموعات الموكلة إليك:{" "}
            <span className="text-amber-300 font-semibold">
              {assignedGroupsSummary || "لا توجد مجموعات معينة"}
            </span>{" "}
            — تسجيل حضور فوري، تقييم دوري، ومتابعة تطور الأداء الميداني
          </p>
        </div>
      </div>

      <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
        <Badge variant="default" className="bg-amber-500/20 text-amber-300 px-3.5 py-1 text-xs font-bold border border-amber-500/40">
          صلاحية كابتن تدريب (Coach)
        </Badge>
        <span className="text-[11px] text-amber-200/80">الموسم التدريبي 2026</span>
      </div>
    </div>
  );
}

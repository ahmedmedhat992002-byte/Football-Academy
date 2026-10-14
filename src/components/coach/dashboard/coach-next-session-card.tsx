import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber, formatDate } from "@/lib/i18n/formatters";
import { t } from "@/lib/i18n/translations";
import type { Session } from "@/lib/data/academy-store";
import {
  CalendarDays,
  Clock,
  Users2,
  Zap,
} from "lucide-react";

interface CoachNextSessionCardProps {
  nextSession: Session | undefined;
  coachPlayersCount: number;
}

export function CoachNextSessionCard({
  nextSession,
  coachPlayersCount,
}: CoachNextSessionCardProps) {
  return (
    <Card className="border-amber-500/30 bg-[#0e1622] shadow-xs overflow-hidden">
      <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-start space-y-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-base md:text-lg font-bold text-white">
              الحصة التدريبية القادمة: {nextSession ? `${nextSession.group_name} (${nextSession.location || "الملعب الرئيسي"})` : "لا توجد حصص قادمة مجدولة"}
            </h3>
          </div>
          <p className="text-xs text-slate-300 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
              {nextSession ? formatDate(nextSession.session_date) : "اليوم"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              {nextSession?.start_time || "--:--"} - {nextSession?.end_time || "--:--"}
            </span>
            <span className="flex items-center gap-1">
              <Users2 className="h-3.5 w-3.5 text-amber-400" />
              {formatNumber(coachPlayersCount)} لاعباً مسجلاً
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link href="/coach/pitch" className="w-full sm:w-auto">
            <Button variant="pitch" className="w-full sm:w-auto h-11 px-6 font-bold shadow-md cursor-pointer hover:shadow-lg">
              <Zap className="h-4 w-4 me-2 animate-bounce" />
              <span>{t.attendance.quickAction}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

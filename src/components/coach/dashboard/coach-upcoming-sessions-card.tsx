import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/i18n/formatters";
import type { Session } from "@/lib/data/academy-store";
import { CalendarDays, Clock, ChevronLeft } from "lucide-react";

interface CoachUpcomingSessionsCardProps {
  upcomingSessions: Session[];
}

export function CoachUpcomingSessionsCard({
  upcomingSessions,
}: CoachUpcomingSessionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
        <div className="text-start">
          <CardTitle className="text-base font-bold text-slate-900">
            جدول الحصص القادمة
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            مواعيد التمارين والملاعب المخصصة
          </p>
        </div>
        <Link href="/coach/sessions">
          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 text-xs font-bold cursor-pointer">
            كل الحصص
            <ChevronLeft className="h-3.5 w-3.5 ms-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {upcomingSessions.map((sess) => (
          <div
            key={sess.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-start"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  {sess.group_name || "تمرين المجموعة"}
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  {sess.location || "الملعب الرئيسي"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 text-slate-400" />
                  {formatDate(sess.session_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {sess.start_time} - {sess.end_time}
                </span>
              </p>
            </div>

            <Link href={`/coach/attendance/${sess.id}`}>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold cursor-pointer">
                تسجيل الحضور
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

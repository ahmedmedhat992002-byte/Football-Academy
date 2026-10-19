"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users2,
  UserCheck,
  CalendarDays,
  CreditCard,
  Zap,
  Award,
} from "lucide-react";

interface MobileNavProps {
  userRole?: "admin" | "coach" | "parent";
}

interface MobileNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export function MobileNav({ userRole = "admin" }: MobileNavProps) {
  const pathname = usePathname();

  const adminLinks: MobileNavItem[] = [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/players", label: "اللاعبين", icon: Users2 },
    { href: "/admin/coaches", label: "المدربين", icon: UserCheck },
    { href: "/admin/sessions", label: "الحصص", icon: CalendarDays },
    { href: "/admin/subscriptions", label: "الاشتراكات", icon: CreditCard },
  ];

  const coachLinks: MobileNavItem[] = [
    { href: "/coach", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/coach/groups", label: "الفرق", icon: Users2 },
    { href: "/coach/pitch", label: "الميدان", icon: Zap, highlight: true },
    { href: "/coach/sessions", label: "الحصص", icon: CalendarDays },
    { href: "/coach/evaluations", label: "التقييم", icon: Award },
  ];

  const parentLinks: MobileNavItem[] = [
    { href: "/parent", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/parent/children", label: "الأبناء", icon: Users2 },
    { href: "/parent/sessions", label: "التمارين", icon: CalendarDays },
    { href: "/parent/payments", label: "الاشتراك", icon: CreditCard },
    { href: "/parent/report", label: "التقرير", icon: Award },
  ];

  const mobileLinks =
    userRole === "coach"
      ? coachLinks
      : userRole === "parent"
      ? parentLinks
      : adminLinks;

  return (
    <nav
      aria-label="شريط التنقل السفلي للموبايل"
      className="fixed bottom-0 start-0 end-0 z-40 flex h-16 items-center justify-around border-t border-[#1a232f] bg-[#090e15]/95 px-1 sm:px-2 backdrop-blur-xl lg:hidden shadow-2xl shadow-black/80 pb-[env(safe-area-inset-bottom)]"
    >
      {mobileLinks.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" &&
            item.href !== "/coach" &&
            item.href !== "/parent" &&
            pathname.startsWith(item.href));

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-6 group active:scale-90 transition-transform duration-150"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/40 ring-4 ring-[#090e15]">
                <Icon className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="mt-1 text-[10px] font-black text-amber-400">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-1.5 active:scale-95 transition-all duration-150 relative",
              isActive
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-amber-200"
            )}
          >
            {/* Top gold active dot indicator */}
            {isActive && (
              <span className="absolute top-0.5 h-1 w-5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            )}
            <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
            <span className="mt-0.5 text-[10px] sm:text-[11px] truncate max-w-[64px] text-center">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

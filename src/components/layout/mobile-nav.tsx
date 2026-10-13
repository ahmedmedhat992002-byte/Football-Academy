"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users2,
  ClipboardCheck,
  CreditCard,
  Zap,
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

  const mobileLinks: MobileNavItem[] =
    userRole === "coach"
      ? [
          { href: "/coach", label: t.nav.dashboard, icon: LayoutDashboard },
          { href: "/coach/groups", label: t.nav.groups, icon: Users2 },
          { href: "/coach/pitch", label: t.attendance.quickAction, icon: Zap, highlight: true },
          { href: "/coach/sessions", label: t.nav.sessions, icon: ClipboardCheck },
        ]
      : userRole === "parent"
      ? [
          { href: "/parent", label: t.nav.dashboard, icon: LayoutDashboard },
          { href: "/parent/children", label: t.parentPortal.childrenList, icon: Users2 },
          { href: "/parent/payments", label: t.nav.payments, icon: CreditCard },
          { href: "/parent/report", label: t.nav.monthlyReport, icon: ClipboardCheck },
        ]
      : [
          { href: "/admin", label: t.nav.dashboard, icon: LayoutDashboard },
          { href: "/admin/groups", label: t.nav.groups, icon: Users2 },
          { href: "/admin/sessions", label: t.nav.attendance, icon: ClipboardCheck },
          { href: "/admin/payments", label: t.nav.payments, icon: CreditCard },
        ];

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-40 flex h-16 items-center justify-around border-t border-[#1a232f] bg-[#090e15]/95 px-2 backdrop-blur-md lg:hidden shadow-lg shadow-black/40">
      {mobileLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-6 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30 ring-4 ring-[#090e15] group-active:scale-95 transition-transform">
                <Icon className="h-6 w-6" />
              </div>
              <span className="mt-1 text-[11px] font-bold text-amber-400">
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
              "flex flex-1 flex-col items-center justify-center py-1 transition-colors",
              isActive
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-amber-200"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
            <span className="mt-0.5 text-[11px] truncate max-w-[70px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

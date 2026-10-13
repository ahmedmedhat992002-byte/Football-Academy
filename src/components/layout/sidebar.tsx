"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users2,
  UserCheck,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Receipt,
  Award,
  FileSpreadsheet,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

interface SidebarProps {
  userRole?: "admin" | "coach" | "parent";
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function Sidebar({ userRole = "admin" }: SidebarProps) {
  const pathname = usePathname();

  const adminNavItems: NavItem[] = [
    { href: "/admin", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/admin/groups", label: t.nav.groups, icon: Users2 },
    { href: "/admin/players", label: t.nav.players, icon: UserCheck },
    { href: "/admin/sessions", label: t.nav.sessions, icon: CalendarDays },
    { href: "/admin/attendance", label: t.nav.attendance, icon: ClipboardCheck },
    { href: "/admin/subscriptions", label: t.nav.subscriptions, icon: CreditCard },
    { href: "/admin/payments", label: t.nav.payments, icon: Receipt },
    { href: "/admin/coaches", label: "الجهاز الفني والمدربين", icon: Users2 },
    { href: "/admin/evaluations", label: t.nav.evaluations, icon: Award },
    { href: "/admin/settings", label: t.nav.settings, icon: Settings },
  ];

  const coachNavItems: NavItem[] = [
    { href: "/coach", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/coach/groups", label: t.nav.groups, icon: Users2 },
    { href: "/coach/sessions", label: t.nav.sessions, icon: CalendarDays },
    { href: "/coach/pitch", label: t.nav.pitchAttendance, icon: Zap, badge: "الملعب" },
    { href: "/coach/evaluations", label: t.nav.evaluations, icon: Award },
  ];

  const parentNavItems: NavItem[] = [
    { href: "/parent", label: t.nav.parentPortal, icon: LayoutDashboard },
    { href: "/parent/children", label: t.parentPortal.childrenList, icon: UserCheck },
    { href: "/parent/sessions", label: t.nav.sessions, icon: CalendarDays },
    { href: "/parent/payments", label: t.nav.payments, icon: Receipt },
    { href: "/parent/report", label: t.nav.monthlyReport, icon: FileSpreadsheet },
  ];

  const navItems =
    userRole === "coach"
      ? coachNavItems
      : userRole === "parent"
      ? parentNavItems
      : adminNavItems;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-e border-[#1c242e] bg-[#090e15] text-slate-200">
      {/* Academy Badge */}
      <div className="p-3.5 border-b border-[#141d27]">
        <div className="flex items-center gap-3 rounded-2xl bg-[#0e1622] p-3 border border-amber-500/35 text-white shadow-md">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-amber-400 shadow-md shadow-amber-500/25 overflow-hidden bg-black shrink-0">
            <Image
              src="/images/logo.png"
              alt="FIFA FC ACADEMY"
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 text-start">
            <p className="text-xs font-black text-amber-400 tracking-wider">
              FIFA FC ACADEMY
            </p>
            <p className="text-[10px] text-amber-300/90 font-bold truncate">
              {t.roles[userRole]}
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold shadow-md shadow-amber-950/30"
                  : "text-slate-400 hover:bg-[#131d28] hover:text-amber-200"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110",
                    isActive ? "text-slate-950" : "text-slate-400 group-hover:text-amber-400"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                  isActive
                    ? "bg-slate-950/20 text-slate-950"
                    : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-[#141d27]">
        <form action={async () => {
          const { logoutAction } = await import("@/lib/auth/actions");
          await logoutAction();
        }}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>{t.nav.logout}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

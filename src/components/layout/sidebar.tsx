"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  UserCheck,
  ClipboardCheck,
  CreditCard,
  Award,
  FileSpreadsheet,
  Settings,
  Trophy,
  LogOut,
  ChevronRight,
  PanelRightOpen,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

interface SidebarProps {
  userRole?: "admin" | "coach" | "parent";
  isOpen?: boolean;
  onToggle?: () => void;
}

interface DockItem {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({
  userRole = "admin",
  isOpen = true,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();

  const adminDockItems: DockItem[] = [
    { id: "home", href: "/admin", label: "لوحة التحكم", icon: Home },
    { id: "players", href: "/admin/players", label: "قائمة اللاعبين", icon: Users },
    { id: "matches", href: "/admin/matches", label: "المباريات والبطولات", icon: Trophy },
    { id: "coaches", href: "/admin/coaches", label: "الجهاز الفني والمدربين", icon: UserCheck },
    { id: "attendance", href: "/admin/attendance", label: "تسجيل الحضور", icon: ClipboardCheck },
    { id: "finance", href: "/admin/subscriptions", label: "المالية والاشتراكات", icon: CreditCard },
    { id: "reports", href: "/admin/evaluations", label: "التقارير والتقييمات", icon: Award },
    { id: "files", href: "/admin/sessions", label: "الحصص والتمارين", icon: FileSpreadsheet },
    { id: "settings", href: "/admin/settings", label: "إعدادات الأكاديمية", icon: Settings },
  ];

  const coachDockItems: DockItem[] = [
    { id: "home", href: "/coach", label: "لوحة التحكم", icon: Home },
    { id: "matches", href: "/coach/matches", label: "المباريات والبطولات", icon: Trophy },
    { id: "players", href: "/coach/groups", label: "المجموعات والفرق", icon: Users },
    { id: "attendance", href: "/coach/pitch", label: "تسجيل الحضور الميداني", icon: ClipboardCheck },
    { id: "sessions", href: "/coach/sessions", label: "جدول التدريبات", icon: FileSpreadsheet },
    { id: "reports", href: "/coach/evaluations", label: "تقييمات اللاعبين", icon: Award },
    { id: "settings", href: "/coach", label: "الإعدادات", icon: Settings },
  ];

  const parentDockItems: DockItem[] = [
    { id: "home", href: "/parent", label: "لوحة التحكم", icon: Home },
    { id: "players", href: "/parent/children", label: "ملف الأبناء", icon: Users },
    { id: "coaches", href: "/parent", label: "الجهاز الفني والمدربين", icon: UserCheck },
    { id: "attendance", href: "/parent/sessions", label: "مواعيد التمارين", icon: ClipboardCheck },
    { id: "finance", href: "/parent/payments", label: "الاشتراكات والدفع", icon: CreditCard },
    { id: "reports", href: "/parent/report", label: "التقرير الشهري", icon: Award },
    { id: "files", href: "/parent/report", label: "الملفات والمستندات", icon: FileSpreadsheet },
    { id: "settings", href: "/parent", label: "الإعدادات", icon: Settings },
  ];

  const dockItems =
    userRole === "coach"
      ? coachDockItems
      : userRole === "parent"
      ? parentDockItems
      : adminDockItems;

  return (
    <>
      {/* Floating Mini Trigger Button (Visible when Sidebar is Collapsed / Hidden) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: "fixed",
            right: "12px",
            top: "84px",
            zIndex: 40,
          }}
          className="hidden lg:flex items-center justify-center h-11 w-11 rounded-2xl bg-[#090e15] border border-amber-500/40 text-amber-400 shadow-xl shadow-black/50 hover:bg-[#131e28] hover:text-amber-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
          title="إظهار القائمة الجانبية"
          aria-label="إظهار القائمة الجانبية"
        >
          <PanelRightOpen className="h-5 w-5" />
          {/* Tooltip to the left */}
          <div
            role="tooltip"
            className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0e1724] text-amber-200 text-xs font-bold whitespace-nowrap shadow-2xl border border-amber-500/30 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 flex items-center"
          >
            <span>إظهار القائمة الجانبية</span>
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#0e1724]" />
          </div>
        </button>
      )}

      {/* Main Floating Mini-Dock */}
      <aside
        aria-label="القائمة الجانبية المصغرة"
        style={{
          position: "fixed",
          right: "16px",
          top: "84px",
          width: "68px",
          borderRadius: "16px",
          backgroundColor: "#090e15",
          zIndex: 40,
        }}
        className={cn(
          "hidden lg:flex flex-col items-center justify-between py-3.5 border border-[#1c2632] shadow-2xl shadow-black/60 select-none transition-all duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[150%] opacity-0 pointer-events-none"
        )}
      >
        {/* Top Header / Collapse Button inside dock */}
        {onToggle && (
          <div className="relative group w-full flex justify-center mb-1">
            <button
              type="button"
              onClick={onToggle}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-amber-400 hover:bg-[#131e28] transition-colors cursor-pointer"
              aria-label="إخفاء القائمة الجانبية"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div
              role="tooltip"
              className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#0e1724] text-slate-300 text-[11px] font-bold whitespace-nowrap shadow-xl border border-slate-700/60 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 translate-x-2 group-hover:translate-x-0 z-50 flex items-center"
            >
              <span>إخفاء القائمة</span>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#0e1724]" />
            </div>
          </div>
        )}

        {/* Top Icons Navigation */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/coach" &&
                item.href !== "/parent" &&
                pathname.startsWith(item.href));

            return (
              <div key={item.id} className="relative group flex items-center justify-center w-full">
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 ring-1 ring-amber-300/50 scale-105"
                      : "text-slate-400 hover:bg-[#152230] hover:text-amber-300 hover:scale-105"
                  )}
                  aria-label={item.label}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      isActive ? "text-slate-950 stroke-[2.5]" : "group-hover:scale-110"
                    )}
                  />
                </Link>

                {/* Smooth Hover Tooltip appearing to the left in RTL */}
                <div
                  role="tooltip"
                  className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0e1724] text-amber-100 text-xs font-bold whitespace-nowrap shadow-2xl border border-amber-500/30 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 flex items-center"
                >
                  <span>{item.label}</span>
                  {/* Arrow pointing towards dock */}
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#0e1724]" />
                </div>
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="w-7 h-px bg-[#1c2632] my-2" />

        {/* Pinned Red Logout at Bottom */}
        <div className="relative group flex items-center justify-center w-full px-2">
          <form action={logoutAction} className="w-full flex justify-center">
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 hover:scale-105 transition-all duration-200 cursor-pointer"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="h-5 w-5 shrink-0 text-[#EF4444]" />
            </button>
          </form>

          {/* Logout Tooltip */}
          <div
            role="tooltip"
            className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-rose-950 text-rose-200 text-xs font-bold whitespace-nowrap shadow-2xl border border-rose-800/60 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 flex items-center"
          >
            <span>تسجيل الخروج</span>
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-rose-950" />
          </div>
        </div>
      </aside>
    </>
  );
}

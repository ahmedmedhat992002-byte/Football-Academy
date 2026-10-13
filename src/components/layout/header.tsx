"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n/translations";
import {
  Home,
  Shield,
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Sparkles,
  CheckCheck,
  Calendar,
  CreditCard,
  Award,
  Users2,
  Zap,
  Settings,
  X,
  Clock,
  ArrowRight,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { getNotifications, markAllNotificationsAsRead } from "@/lib/actions/notifications";

interface HeaderProps {
  userName?: string;
  userRole?: "admin" | "coach" | "parent";
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "attendance" | "payment" | "evaluation" | "session";
  href: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export function Header({
  userName = "المستخدم",
  userRole = "admin",
}: HeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchLiveNotifications() {
      try {
        const live = await getNotifications(userRole);
        if (Array.isArray(live)) {
          setNotifications(live as any);
        }
      } catch {
        // Fallback to initial
      }
    }
    fetchLiveNotifications();
  }, [userRole]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await markAllNotificationsAsRead();
    } catch {
      // Fallback
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const roleLabel =
    userRole === "parent" ? "ولي أمر اللاعب" : t.roles[userRole];

  const dashboardHref =
    userRole === "coach" ? "/coach" : userRole === "parent" ? "/parent" : "/admin";

  // Search items bank
  const searchableItems = [
    { label: "لوحة التحكم", category: "تنقل", href: dashboardHref, icon: Sparkles },
    { label: "المجموعات التدريبية (U8, U10, U12, U14)", category: "المجموعات", href: `/${userRole === "parent" ? "parent/children" : userRole}/groups`, icon: Users2 },
    { label: "قائمة اللاعبين", category: "اللاعبين", href: userRole === "parent" ? "/parent/children" : "/admin/players", icon: Users2 },
    { label: "الحصص وجدول التمارين", category: "التدريبات", href: `/${userRole}/sessions`, icon: Calendar },
    { label: "تسجيل الحضور الميداني", category: "الميدان", href: "/coach/pitch", icon: Zap },
    { label: "الاشتراكات والدفع", category: "المالية", href: userRole === "parent" ? "/parent/payments" : "/admin/subscriptions", icon: CreditCard },
    { label: "التقييمات الشهرية والتقارير", category: "التقارير", href: userRole === "parent" ? "/parent/report" : `/${userRole}/evaluations`, icon: Award },
    { label: "إعدادات الأكاديمية", category: "الإدارة", href: "/admin/settings", icon: Settings },
  ];

  const filteredItems = searchQuery.trim()
    ? searchableItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a1118] border-b border-[#17232d] text-white px-4 md:px-8 py-3">
      <div className="mx-auto max-w-[1440px] flex items-center justify-between gap-4">
        {/* Right side (RTL start): Home button + Academy Brand */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Gold Home Icon */}
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-950/40 hover:from-amber-400 hover:to-yellow-400 transition-all"
            title="الرئيسية"
          >
            <Home className="h-5 w-5" />
          </Link>

          {/* Academy Brand & Logo */}
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-amber-400/90 shadow-lg shadow-amber-500/25 overflow-hidden bg-black shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="FIFA FC ACADEMY"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="text-start">
              <div className="flex items-center gap-1.5">
                <span className="text-sm md:text-base font-black tracking-wider text-amber-400 leading-tight">
                  FIFA FC ACADEMY
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium hidden sm:block">
                أكاديمية فيفا إف سي — صناع الأبطال ⚽
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Live Interactive Search Bar */}
        <div
          ref={searchContainerRef}
          className="flex-1 max-w-xl mx-2 relative hidden md:block"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="ابحث عن لاعب، مجموعة، تمرين، أو صفحة..."
              className="w-full h-10 rounded-full bg-[#131e28] border border-[#20303e] ps-4 pe-11 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-start"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-3.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="absolute end-3.5 top-2.5 text-slate-400 pointer-events-none">
                <Search className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-12 start-0 end-0 rounded-2xl bg-[#0f1721] border border-[#223344] shadow-2xl p-2.5 z-50 animate-in fade-in-50 slide-in-from-top-2 text-start">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-[#20303e] flex items-center justify-between">
                <span>نتائج البحث عن "{searchQuery}"</span>
                <span className="text-amber-400">{filteredItems.length} نتيجة</span>
              </div>

              <div className="max-h-72 overflow-y-auto mt-1 space-y-1">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1a2634] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-amber-300">
                              {item.label}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 rotate-180" />
                      </Link>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    لم يتم العثور على نتائج مطابقة لـ "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Left side (RTL end): Notifications + User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Button & Popover */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#131e28] border border-[#20303e] text-slate-300 hover:text-white hover:bg-[#1a2835] transition-colors cursor-pointer"
              aria-label="التنبيهات"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -start-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[9px] font-black text-slate-950 ring-2 ring-[#0a1118]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute end-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0f1721] border border-[#223344] shadow-2xl p-3 z-50 text-start animate-in fade-in-50 slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#20303e]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">التنبيهات والإشعارات</h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                        {unreadCount} جديدة
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span>تحديد الكل كمقروء</span>
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto mt-2 space-y-1.5">
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        markAsRead(item.id);
                        setShowNotifications(false);
                      }}
                      className={`block p-2.5 rounded-xl transition-colors border ${
                        item.unread
                          ? "bg-[#14212e] border-amber-500/30 hover:bg-[#182938]"
                          : "bg-transparent border-transparent hover:bg-[#15202b]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {item.unread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          )}
                          <p className="text-xs font-bold text-white">{item.title}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-[#20303e] hidden sm:block" />

          {/* User Profile Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-[#131e28] transition-colors text-start cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold ring-2 ring-amber-400/50">
                <User className="h-4 w-4" />
              </div>

              <div className="hidden sm:block text-start">
                <p className="text-xs font-bold text-white leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {roleLabel}
                </p>
              </div>

              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ms-0.5 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute end-0 mt-2 w-52 rounded-xl bg-[#131e28] border border-[#20303e] p-2 shadow-2xl z-50 text-start animate-in fade-in-50 slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-[#20303e] sm:hidden">
                  <p className="text-xs font-bold text-white">{userName}</p>
                  <p className="text-[10px] text-amber-400">{roleLabel}</p>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#1c2b38] transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>لوحة التحكم ({roleLabel})</span>
                </Link>
                {userRole === "admin" && (
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#1c2b38] transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>إعدادات النظام</span>
                  </Link>
                )}
                <form action={logoutAction} className="mt-1 pt-1 border-t border-[#20303e]">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
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
  PanelRightClose,
  PanelRightOpen,
  Camera,
} from "lucide-react";
import { AvatarUploader } from "@/components/ui/avatar-uploader";
import { logoutAction } from "@/lib/auth/actions";
import {
  getNotifications,
  markAllNotificationsAsRead,
  type SystemNotification,
} from "@/lib/actions/notifications";

interface HeaderProps {
  userName?: string;
  userRole?: "admin" | "coach" | "parent";
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  canToggleSidebar?: boolean;
}

export function Header({
  userName = "حسام الدين خالد",
  userRole = "admin",
  isSidebarOpen = true,
  onToggleSidebar,
  canToggleSidebar = true,
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("أكتوبر 2026");
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Avatar state
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string>("");

  useEffect(() => {
    const loadAvatar = () => {
      try {
        const stored = localStorage.getItem("academy_user_avatar");
        if (stored) setUserAvatar(stored);
      } catch {
        // Ignore
      }
    };
    loadAvatar();
    window.addEventListener("academy_avatar_changed", loadAvatar);
    return () => window.removeEventListener("academy_avatar_changed", loadAvatar);
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const monthFilterRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(event.target as Node))
      ) {
        setIsSearchFocused(false);
      }
      if (monthFilterRef.current && !monthFilterRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
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
          setNotifications(live);
        }
      } catch {
        // Fallback
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
    userRole === "parent" ? "ولي أمر اللاعب" : userRole === "coach" ? "كابتن مدرب" : "مدير الأكاديمية";

  const displayName =
    !userName || userName === "المستخدم" ? "حسام الدين خالد" : userName;

  const dashboardHref =
    userRole === "coach" ? "/coach" : userRole === "parent" ? "/parent" : "/admin";

  const availableMonths = [
    "أكتوبر 2026",
    "سبتمبر 2026",
    "أغسطس 2026",
    "يوليو 2026",
    "الموسم الرياضي 2026-2027",
  ];

  // Search items bank
  const searchableItems = [
    { label: "لوحة التحكم", category: "تنقل", href: dashboardHref, icon: Sparkles },
    { label: "المجموعات التدريبية (U8, U10, U12, U14)", category: "المجموعات", href: `/${userRole === "parent" ? "parent/children" : userRole}/groups`, icon: Users2 },
    { label: "قائمة اللاعبين", category: "اللاعبين", href: userRole === "parent" ? "/parent/children" : "/admin/players", icon: Users2 },
    { label: "الجهاز الفني والمدربين", category: "الكادر", href: "/admin/coaches", icon: Users2 },
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
    <header className="sticky top-0 z-50 w-full bg-[#0a1118]/95 backdrop-blur-md border-b border-[#17232d] text-white px-3 sm:px-4 md:px-8 py-2.5 sm:py-3 transition-colors">
      <div className="mx-auto max-w-[1560px] flex items-center justify-between gap-2 sm:gap-4">
        {/* Right side (RTL start): Academy Logo & Title + Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sidebar Toggle Button for Desktop */}
          {canToggleSidebar && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl bg-[#131e28] border border-[#20303e] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 hover:bg-[#182633] transition-all cursor-pointer active:scale-95"
              title={isSidebarOpen ? "إخفاء القائمة الجانبية" : "إظهار القائمة الجانبية"}
              aria-label={isSidebarOpen ? "إخفاء القائمة الجانبية" : "إظهار القائمة الجانبية"}
            >
              {isSidebarOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5 text-amber-400" />
              )}
            </button>
          )}

          {/* Single Academy Brand & Logo */}
          <Link
            href="/"
            title="أكاديمية كرة القدم - بناء الأبطال .. صناعة المستقبل"
            aria-label="أكاديمية كرة القدم - بناء الأبطال .. صناعة المستقبل"
            className="flex items-center gap-2 sm:gap-3 group active:scale-95 transition-transform"
          >
            <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full ring-2 ring-amber-400/90 shadow-lg shadow-amber-500/25 overflow-hidden bg-black shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="أكاديمية كرة القدم - بناء الأبطال .. صناعة المستقبل"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="text-start">
              <span className="text-xs sm:text-sm md:text-base font-black tracking-wide text-white leading-tight block group-hover:text-amber-400 transition-colors whitespace-nowrap">
                أكاديمية كرة القدم
              </span>
              <p className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium hidden sm:block">
                بناء الأبطال .. صناعة المستقبل
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Search Input + Date/Month Filter */}
        <div className="flex-1 max-w-2xl mx-2 hidden md:flex items-center gap-3 justify-center">
          {/* Rounded Search Input */}
          <div
            ref={searchContainerRef}
            className="relative flex-1 max-w-md"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="ابحث عن لاعب، مدرب، أو فاتورة..."
                className="w-full h-10 rounded-full bg-[#131e28] border border-[#20303e] ps-4 pe-11 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-start"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute end-3.5 top-2.5 text-slate-400 hover:text-white"
                  aria-label="مسح البحث"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <div className="absolute end-3.5 top-2.5 text-slate-400 pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Desktop Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-12 start-0 end-0 rounded-2xl bg-[#0f1721] border border-[#223344] shadow-2xl p-2.5 z-50 animate-in fade-in-50 slide-in-from-top-2 text-start">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-[#20303e] flex items-center justify-between">
                  <span>نتائج البحث عن &quot;{searchQuery}&quot;</span>
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
                      لم يتم العثور على نتائج مطابقة لـ &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date/Month Filter Dropdown (Desktop) */}
          <div ref={monthFilterRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center gap-2 h-10 px-3.5 rounded-full bg-[#131e28] border border-[#20303e] hover:border-amber-500/50 hover:bg-[#192734] text-xs font-semibold text-slate-200 transition-colors cursor-pointer active:scale-95"
              aria-expanded={showMonthDropdown}
              aria-label="تصفية حسب التاريخ والشهر"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>{selectedMonth}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ms-0.5" />
            </button>

            {showMonthDropdown && (
              <div className="absolute top-12 end-0 w-52 rounded-2xl bg-[#0f1721] border border-[#223344] shadow-2xl p-2 z-50 text-start animate-in fade-in-50 slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-[#20303e]">
                  اختر الفترة الزمنية
                </div>
                <div className="mt-1 space-y-1">
                  {availableMonths.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(m);
                        setShowMonthDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-start cursor-pointer ${
                        selectedMonth === m
                          ? "bg-amber-500/20 text-amber-300 font-bold"
                          : "text-slate-300 hover:bg-[#1a2634] hover:text-white"
                      }`}
                    >
                      <span>{m}</span>
                      {selectedMonth === m && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left side (RTL end): Mobile Search Button + Notifications + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-[#131e28] border border-[#20303e] text-slate-300 hover:text-amber-400 active:scale-90 transition-all cursor-pointer"
            aria-label="بحث في المنظومة"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notification Bell Button & Popover */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#131e28] border border-[#20303e] text-slate-300 hover:text-white hover:bg-[#1a2835] active:scale-90 transition-all cursor-pointer"
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
              <div className="absolute end-0 mt-2 w-72 sm:w-80 md:w-96 rounded-2xl bg-[#0f1721] border border-[#223344] shadow-2xl p-3 z-50 text-start animate-in fade-in-50 slide-in-from-top-2">
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

          {/* User Profile */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-xl p-1 hover:bg-[#131e28] transition-colors text-start cursor-pointer group active:scale-95"
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 font-bold ring-2 ring-amber-400/60 shadow-md shadow-amber-950/50 shrink-0 overflow-hidden">
                {userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userAvatar} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>

              <div className="hidden md:block text-start">
                <p className="text-xs font-bold text-white leading-tight group-hover:text-amber-300 transition-colors">
                  {displayName} - {roleLabel}
                </p>
                <p className="text-[10px] text-amber-400 mt-0.5 font-medium">
                  لوحة الإدارة المركزية
                </p>
              </div>

              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ms-0.5 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute end-0 mt-2 w-52 sm:w-56 rounded-2xl bg-[#131e28] border border-[#20303e] p-2 shadow-2xl z-50 text-start animate-in fade-in-50 slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-[#20303e]">
                  <p className="text-xs font-bold text-white">{displayName}</p>
                  <p className="text-[10px] text-amber-400 font-semibold">{roleLabel}</p>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#1c2b38] transition-colors mt-1"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>لوحة التحكم ({roleLabel})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTempAvatar(userAvatar);
                    setShowDropdown(false);
                    setShowAvatarModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#1c2b38] transition-colors cursor-pointer text-start"
                >
                  <Camera className="h-3.5 w-3.5 text-amber-400" />
                  <span>تغيير الصورة الشخصية</span>
                </button>
                {userRole === "admin" && (
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#1c2b38] transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>إعدادات النظام</span>
                  </Link>
                )}
                <form action={logoutAction} className="mt-1 pt-1 border-t border-[#20303e]">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
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

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && (
        <div ref={mobileSearchRef} className="md:hidden pt-2.5 pb-1 animate-in fade-in-50 slide-in-from-top-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن لاعب، مدرب، أو فاتورة..."
              autoFocus
              className="w-full h-10 rounded-full bg-[#131e28] border border-[#20303e] ps-4 pe-10 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-start"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="absolute end-3 top-2.5 text-slate-400 pointer-events-none">
                <Search className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Mobile Search Results */}
          {searchQuery.trim() && (
            <div className="mt-2 rounded-xl bg-[#0f1721] border border-[#223344] p-2 shadow-xl max-h-60 overflow-y-auto space-y-1 text-start">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => {
                        setShowMobileSearch(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1a2634] text-xs text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-amber-400" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  لا توجد نتائج مطابقة
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Profile Photo Update Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0D1117] border border-amber-500/40 p-6 text-start space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  تحديث صورتك الشخصية ({displayName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <AvatarUploader
              value={tempAvatar}
              onChange={setTempAvatar}
              label="اختر صورة جديدة"
              sublabel="ارفع صورتك من جهازك أو اختر رمزاً رياضياً معتمداً"
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem("academy_user_avatar", tempAvatar);
                    setUserAvatar(tempAvatar);
                    window.dispatchEvent(new Event("academy_avatar_changed"));
                  } catch {
                    // Ignore
                  }
                  setShowAvatarModal(false);
                }}
                className="bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-colors"
              >
                حفظ وتحديث الصورة
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import React from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Footer } from "./footer";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: "admin" | "coach" | "parent";
  userName?: string;
  hideSidebar?: boolean;
}

export function AppShell({
  children,
  userRole = "admin",
  userName = "المستخدم",
  hideSidebar = false,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f9] text-slate-900 font-sans">
      {/* Header */}
      <Header userName={userName} userRole={userRole} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-x-hidden">
        {/* Desktop Sidebar (optional when navigating deeper modules) */}
        {!hideSidebar && <Sidebar userRole={userRole} />}

        {/* Content area */}
        <main className="flex-1 px-4 py-5 md:px-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav userRole={userRole} />
    </div>
  );
}

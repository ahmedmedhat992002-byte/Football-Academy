"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Footer } from "./footer";
import { AiChatWidget } from "@/components/ai/ai-chat-widget";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Restore sidebar visibility preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("academy_sidebar_visible");
      if (saved !== null) {
        setIsSidebarOpen(saved === "true");
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("academy_sidebar_visible", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f9] text-slate-900 font-sans relative">
      {/* Top Header */}
      <Header
        userName={userName}
        userRole={userRole}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        canToggleSidebar={!hideSidebar}
      />

      {/* Main Layout Area */}
      <div className="relative flex flex-1 w-full overflow-x-hidden">
        {/* Floating Mini-Dock (Fixed on right side, can show/hide) */}
        {!hideSidebar && (
          <Sidebar
            userRole={userRole}
            isOpen={isSidebarOpen}
            onToggle={handleToggleSidebar}
          />
        )}

        {/* Main Content Area - Expands when sidebar is hidden */}
        <main
          className={`flex-1 px-3 sm:px-4 md:px-8 py-4 sm:py-6 pb-24 lg:pb-8 transition-all duration-300 ease-in-out ${
            !hideSidebar && isSidebarOpen ? "lg:pe-24 lg:ps-8" : "lg:px-8"
          }`}
        >
          <div className="mx-auto max-w-[1560px] w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Chatbot Widget */}
      <AiChatWidget userRole={userRole} userName={userName} />

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav userRole={userRole} />
    </div>
  );
}

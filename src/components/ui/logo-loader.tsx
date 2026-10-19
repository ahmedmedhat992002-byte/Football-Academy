"use client";

import React from "react";
import Image from "next/image";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "inline" | "card" | "floating" | "fullscreen";
  text?: string;
  subtext?: string;
  isSlowNetwork?: boolean;
  className?: string;
}

export function LogoLoader({
  size = "md",
  variant = "card",
  text = "جاري التحميل...",
  subtext,
  isSlowNetwork = false,
  className = "",
}: LogoLoaderProps) {
  // Dimensions for the logo
  const sizeMap = {
    sm: { box: 36, img: 26, ringOffset: 3 },
    md: { box: 48, img: 36, ringOffset: 4 },
    lg: { box: 64, img: 48, ringOffset: 5 },
  };

  const currentSize = sizeMap[size];

  // The mini spinning logo unit
  const LogoUnit = (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: currentSize.box, height: currentSize.box }}
    >
      {/* Outer Rotating Conic Gold Ring */}
      <div
        className="absolute inset-0 rounded-full animate-orbit-spin pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(245, 158, 11, 0.2) 120deg, #F59E0B 270deg, #FDE68A 360deg)",
          padding: "2px",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), black calc(100% - 2px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
        }}
      />

      {/* Outer soft gold pulse glow */}
      <div
        className="absolute inset-0 rounded-full animate-logo-pulse pointer-events-none opacity-60"
        style={{
          boxShadow: "0 0 16px rgba(245, 158, 11, 0.55)",
        }}
      />

      {/* Central circular container holding the official logo */}
      <div
        className="relative flex items-center justify-center rounded-full overflow-hidden bg-[#0D1117] border border-amber-500/40 shadow-inner"
        style={{
          width: currentSize.box - currentSize.ringOffset * 2,
          height: currentSize.box - currentSize.ringOffset * 2,
        }}
      >
        <Image
          src="/images/logo.png"
          alt="FIFA FC ACADEMY"
          width={currentSize.img}
          height={currentSize.img}
          className="object-contain animate-logo-pulse"
          priority
        />
      </div>
    </div>
  );

  // Variant: Inline (just the rotating logo, e.g. for buttons)
  if (variant === "inline") {
    return <div className={`inline-flex items-center gap-2 ${className}`}>{LogoUnit}</div>;
  }

  // Variant: Floating (pill that pops up during page transition or slow network)
  if (variant === "floating") {
    return (
      <aside
        aria-live="polite"
        aria-label="حالة التحميل"
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0D1117]/95 text-white border border-amber-500/50 shadow-2xl shadow-amber-500/20 backdrop-blur-md animate-page-enter ${className}`}
      >
        {LogoUnit}
        <div className="text-start leading-tight">
          <p className="text-xs font-black text-amber-400">
            {isSlowNetwork ? "الشبكة بطيئة، جاري الانتقال..." : text}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {subtext || "FIFA FC ACADEMY"}
          </p>
        </div>
      </aside>
    );
  }

  // Variant: Fullscreen Overlay (for major loading states)
  if (variant === "fullscreen") {
    return (
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-page-enter ${className}`}
      >
        <div className="flex flex-col items-center p-6 rounded-3xl bg-[#0D1117] border border-amber-500/30 shadow-2xl max-w-sm text-center">
          {LogoUnit}
          <div className="mt-4 space-y-1">
            <h3 className="text-sm font-black text-amber-400">{text}</h3>
            <p className="text-xs text-slate-400">
              {subtext || (isSlowNetwork ? "جاري انتظار استجابة الشبكة..." : "FIFA FC ACADEMY")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default Variant: Card (used in page skeletons and route loaders)
  return (
    <div
      className={`flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#0D1117] via-[#161F2E] to-[#0D1117] border border-amber-500/30 text-white shadow-lg animate-page-enter ${className}`}
    >
      {LogoUnit}
      <div className="text-start flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm font-black text-amber-400">{text}</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
            FIFA FC
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          {subtext || (isSlowNetwork ? "جاري محاولة الاتصال، يرجى الانتظار..." : "جاري استرجاع البيانات وتحديث الشاشة...")}
        </p>
      </div>
    </div>
  );
}

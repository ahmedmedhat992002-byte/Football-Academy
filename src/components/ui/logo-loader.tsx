"use client";

import React from "react";
import Image from "next/image";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "card" | "fullscreen" | "floating" | "inline";
  text?: string;
  subtext?: string;
  isSlowNetwork?: boolean;
  className?: string;
}

export function LogoLoader({
  size = "md",
  variant = "card",
  text = "جاري تحميل الصفحة\nوتحديث البيانات...",
  subtext,
  isSlowNetwork = false,
  className = "",
}: LogoLoaderProps) {
  // Split lines for centered 2-line Arabic display
  const lines = text.split("\n");

  // The Exact Luxury Golden Card from the User Image
  const LuxuryLoadingCard = (
    <div
      className={`relative w-[320px] sm:w-[350px] aspect-[1/1.18] rounded-[32px] p-7 flex flex-col items-center justify-between overflow-hidden select-none border-[1.5px] border-[#DFBA62]/75 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_45px_rgba(223,186,98,0.22)] animate-page-enter ${className}`}
      style={{
        background:
          "radial-gradient(circle at 50% 24%, #152b47 0%, #0a1525 45%, #03070e 100%)",
      }}
    >
      {/* Background Subtle Tech/Circuit Grid & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="goldGlow" cx="50%" cy="25%" r="45%">
              <stop offset="0%" stopColor="#DFBA62" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#DFBA62" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#goldGlow)" />
          {/* Faint ambient circuit lines */}
          <line x1="15%" y1="28%" x2="40%" y2="28%" stroke="#DFBA62" strokeWidth="0.7" opacity="0.3" />
          <line x1="40%" y1="28%" x2="48%" y2="35%" stroke="#DFBA62" strokeWidth="0.7" opacity="0.3" />
          <line x1="85%" y1="28%" x2="60%" y2="28%" stroke="#DFBA62" strokeWidth="0.7" opacity="0.3" />
          <line x1="60%" y1="28%" x2="52%" y2="35%" stroke="#DFBA62" strokeWidth="0.7" opacity="0.3" />
        </svg>
      </div>

      {/* Top Section: Emblem + Cosmic Glowing Golden Rings */}
      <div className="relative flex items-center justify-center w-full mt-2 h-[120px]">
        {/* Ambient Golden Core Glow */}
        <div
          className="absolute w-36 h-36 rounded-full pointer-events-none opacity-80 animate-logo-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(230, 190, 80, 0.45) 0%, rgba(245, 197, 66, 0.15) 50%, transparent 70%)",
          }}
        />

        {/* Outer Cosmic Elliptical Ring 1 (Tilted Galaxy Ring) */}
        <div
          className="absolute w-[148px] h-[148px] rounded-full pointer-events-none animate-cosmic-orbit"
          style={{
            border: "2px solid transparent",
            borderTopColor: "rgba(255, 230, 150, 0.95)",
            borderBottomColor: "rgba(245, 180, 50, 0.75)",
            filter: "drop-shadow(0 0 10px rgba(245, 197, 66, 0.9))",
          }}
        />

        {/* Outer Cosmic Ring 2 (Counter rotating with sparkles effect) */}
        <div
          className="absolute w-[164px] h-[164px] rounded-full pointer-events-none animate-cosmic-orbit-reverse opacity-70"
          style={{
            border: "1.5px dashed rgba(245, 210, 120, 0.8)",
            filter: "drop-shadow(0 0 14px rgba(245, 197, 66, 0.8))",
          }}
        />

        {/* Little Golden Star / Sparkle Accents */}
        <div className="absolute -top-1 left-16 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse" />
        <div className="absolute top-8 right-14 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse delay-150" />
        <div className="absolute -bottom-2 right-20 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse delay-300" />
        <div className="absolute bottom-6 left-12 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse delay-500" />

        {/* Central Circular Emblem */}
        <div className="relative z-10 w-[78px] h-[78px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden bg-black p-[2.5px] shadow-[0_0_24px_rgba(0,0,0,0.9),0_0_20px_rgba(245,197,66,0.55)] border-[2px] border-[#DFBA62]">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-[#182333] to-[#0a0f16] flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="FIFA FC ACADEMY"
              width={76}
              height={76}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Middle Section: Arabic Text */}
      <div className="relative z-10 text-center my-3 space-y-1">
        <h2 className="text-xl sm:text-[22px] font-black text-[#E8C872] leading-snug tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          {lines.map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>
        {isSlowNetwork && (
          <p className="text-[11px] font-bold text-amber-300/80 animate-pulse mt-1">
            الشبكة بطيئة، جاري استكمال المعالجة...
          </p>
        )}
      </div>

      {/* Bottom Section: Three Glowing Golden Dots */}
      <div className="relative z-10 flex items-center justify-center gap-3 mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#E6C875] animate-dot-1" />
        <span className="w-3.5 h-3.5 rounded-full bg-[#F5D061] animate-dot-2" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E6C875] animate-dot-3" />
      </div>
    </div>
  );

  // Variant: Fullscreen (centered over dimmed backdrop)
  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-page-enter">
        {LuxuryLoadingCard}
      </div>
    );
  }

  // Variant: Floating (centered modal when navigating takes > 180ms or on slow network)
  if (variant === "floating") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-none animate-page-enter">
        <div className="pointer-events-auto">
          {LuxuryLoadingCard}
        </div>
      </div>
    );
  }

  // Variant: Inline (compact spinner for buttons)
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="relative w-7 h-7 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
        <span className="text-xs font-bold text-amber-400">جاري المعالجة...</span>
      </div>
    );
  }

  // Default Variant: Card (centered on the page)
  return (
    <div className="w-full flex items-center justify-center py-10 sm:py-16">
      {LuxuryLoadingCard}
    </div>
  );
}

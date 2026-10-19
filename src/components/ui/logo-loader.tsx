"use client";

import React from "react";
import Image from "next/image";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "card" | "fullscreen" | "floating" | "inline";
  className?: string;
}

export function LogoLoader({
  size = "md",
  variant = "card",
  className = "",
}: LogoLoaderProps) {
  // Sizing definitions
  const dimensions = {
    sm: { emblem: 56, ring: 110, ringOffset: 3 },
    md: { emblem: 82, ring: 156, ringOffset: 4 },
    lg: { emblem: 104, ring: 196, ringOffset: 5 },
  };

  const { emblem, ring } = dimensions[size];

  // The Pure Cosmic Golden FIFA FC Emblem (Matches the User Image Exactly)
  const PureCosmicEmblem = (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: ring, height: ring }}
    >
      {/* Ambient Golden Core Glow */}
      <div
        className="absolute w-28 h-28 rounded-full pointer-events-none opacity-85 animate-logo-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(230, 190, 80, 0.5) 0%, rgba(245, 197, 66, 0.18) 50%, transparent 70%)",
        }}
      />

      {/* Outer Cosmic Elliptical Ring (Tilted Galaxy Ring with Golden Glow) */}
      <div
        className="absolute rounded-full pointer-events-none animate-cosmic-orbit"
        style={{
          width: ring - 8,
          height: ring - 8,
          border: "2.2px solid transparent",
          borderTopColor: "rgba(255, 235, 160, 0.98)",
          borderBottomColor: "rgba(245, 180, 50, 0.8)",
          filter: "drop-shadow(0 0 12px rgba(245, 197, 66, 0.95))",
        }}
      />

      {/* Outer Counter-Rotating Ring with Light Sparkles */}
      <div
        className="absolute rounded-full pointer-events-none animate-cosmic-orbit-reverse opacity-75"
        style={{
          width: ring + 4,
          height: ring + 4,
          border: "1.5px dashed rgba(245, 215, 125, 0.85)",
          filter: "drop-shadow(0 0 14px rgba(245, 197, 66, 0.85))",
        }}
      />

      {/* Ambient Sparkles & Golden Stars */}
      <div className="absolute top-3 left-4 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse" />
      <div className="absolute top-7 right-3 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse delay-150" />
      <div className="absolute bottom-5 right-5 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse delay-300" />
      <div className="absolute bottom-4 left-6 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse delay-500" />

      {/* Central Circular Emblem */}
      <div
        className="relative z-10 rounded-full overflow-hidden bg-black p-[2.5px] shadow-[0_0_28px_rgba(0,0,0,0.85),0_0_22px_rgba(245,197,66,0.6)] border-[2.2px] border-[#DFBA62]"
        style={{ width: emblem, height: emblem }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-[#182333] to-[#0a0f16] flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="FIFA FC ACADEMY"
            width={emblem - 6}
            height={emblem - 6}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Golden Reflection / Floor Lens Glow (as seen in image) */}
      <div
        className="absolute -bottom-2 w-24 h-4 rounded-full pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245, 208, 97, 0.75) 0%, rgba(245, 197, 66, 0.25) 50%, transparent 75%)",
          filter: "blur(3px)",
        }}
      />
    </div>
  );

  // Variant: Fullscreen / Overlay (without blur)
  if (variant === "fullscreen" || variant === "floating") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none animate-page-enter">
        <div className="pointer-events-auto p-4 flex items-center justify-center">
          {PureCosmicEmblem}
        </div>
      </div>
    );
  }

  // Variant: Inline (compact)
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {PureCosmicEmblem}
      </div>
    );
  }

  // Default Variant: Centered on page
  return (
    <div className={`w-full flex items-center justify-center py-6 sm:py-10 animate-page-enter ${className}`}>
      {PureCosmicEmblem}
    </div>
  );
}

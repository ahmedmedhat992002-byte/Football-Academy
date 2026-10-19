"use client";

import React from "react";
import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { createWhatsAppLink } from "@/lib/utils/whatsapp";

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  label?: string;
  variant?: "outline" | "solid" | "icon" | "badge";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function WhatsAppButton({
  phone,
  message,
  label = "واتساب",
  variant = "outline",
  size = "sm",
  className,
  showIcon = true,
}: WhatsAppButtonProps) {
  const link = createWhatsAppLink(phone, message);

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-xs gap-2",
    lg: "px-4 py-2 text-sm gap-2.5",
  };

  const variantClasses = {
    solid: "bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-950/30",
    outline:
      "border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold",
    badge:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded-full px-2 py-0.5",
    icon: "p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30",
  };

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all active:scale-95 text-start cursor-pointer",
        variant !== "icon" ? sizeClasses[size] : "",
        variantClasses[variant],
        className
      )}
      title={`إرسال رسالة واتساب إلى ${phone || "ولي الأمر"}`}
      aria-label={`إرسال رسالة واتساب إلى ${phone || "ولي الأمر"}`}
    >
      {showIcon && <MessageSquareText className={cn("shrink-0", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />}
      {variant !== "icon" && <span>{label}</span>}
    </a>
  );
}

"use client";

import React, { useRef, useState } from "react";
import { Camera, Upload, X, Check, Image as ImageIcon, Sparkles } from "lucide-react";

interface AvatarUploaderProps {
  value?: string;
  onChange: (base64: string) => void;
  onClear?: () => void;
  label?: string;
  sublabel?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Preset sports avatar icons
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
];

export function AvatarUploader({
  value,
  onChange,
  onClear,
  label = "الصورة الشخصية",
  sublabel = "يمكنك رفع صورة من هاتفك/جهازك أو اختيار رمز رياضي",
  className = "",
  size = "md",
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dimensionClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  }[size];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and resize image using canvas to keep it lightweight (< 300KB)
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          onChange(compressed);
        } else {
          onChange(event.target?.result as string);
        }
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onClear) onClear();
    else onChange("");
  };

  return (
    <div className={`space-y-2.5 text-start ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5 text-amber-400" />
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">(اختياري)</span>
        </label>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            <X className="h-3 w-3" />
            <span>إزالة الصورة</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#0f1721] border border-slate-700/80">
        {/* Avatar Preview Circle */}
        <div
          className={`relative ${dimensionClasses} rounded-full overflow-hidden bg-[#16212d] border-2 border-[#F59E0B] shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center group cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
          title="اضغط لاختيار صورة"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-amber-400/80">
              <Camera className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-bold text-slate-400 mt-1">اختر صورة</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
            تغيير
          </div>
        </div>

        {/* Action Buttons & Description */}
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-[11px] text-slate-300 leading-tight truncate">{sublabel}</p>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isProcessing ? "جاري الرفع..." : value ? "تغيير الصورة" : "رفع من الجهاز"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>رموز جاهزة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Avatars Bar */}
      {showPresets && (
        <div className="p-2.5 rounded-xl bg-[#141d27] border border-amber-500/30 flex items-center gap-2.5 animate-in fade-in-50">
          <span className="text-[10px] text-slate-400 font-bold">اختر رمزاً سريعاً:</span>
          <div className="flex items-center gap-2 overflow-x-auto">
            {PRESET_AVATARS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(url);
                  setShowPresets(false);
                }}
                className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                  value === url ? "border-amber-400 ring-2 ring-amber-400/50" : "border-slate-600"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

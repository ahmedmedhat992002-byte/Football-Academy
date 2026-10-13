"use client";

import React from "react";
import { Printer } from "lucide-react";

interface PrintReportButtonProps {
  className?: string;
  label?: string;
}

export function PrintReportButton({
  className = "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/30 transition-all cursor-pointer active:scale-95",
  label = "طباعة التقرير الشامل",
}: PrintReportButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={className}
      title="طباعة التقرير الفني والبدني بصيغة A4"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

import React from "react";
import { Shield, Radio } from "lucide-react";
import { t } from "@/lib/i18n/translations";

export function Footer() {
  return (
    <footer className="w-full bg-[#0a1118] border-t border-[#17232d] text-slate-400 py-3.5 px-4 md:px-8 mt-auto">
      <div className="mx-auto max-w-[1440px] flex items-center justify-between text-xs font-medium">
        {/* Right side (RTL start): Brand Copyright */}
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <span>{t.app.name} © 2025</span>
        </div>

        {/* Left side (RTL end): System Status */}
        <div className="flex items-center gap-2 text-amber-400">
          <Radio className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span>النظام يعمل بشكل طبيعي</span>
        </div>
      </div>
    </footer>
  );
}

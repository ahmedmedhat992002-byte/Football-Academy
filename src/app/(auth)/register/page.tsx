import React, { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { t } from "@/lib/i18n/translations";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الانضمام والتسجيل | FIFA FC ACADEMY",
  description: "انضم إلى صرح FIFA FC ACADEMY وابدأ تدريباتك الاحترافية مع أفضل المدربين المعتمدين",
};

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#070e14] overflow-hidden">
      {/* Decorative soccer pitch gradients */}
      <div className="absolute -top-32 -start-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -end-32 h-96 w-96 rounded-full bg-yellow-600/10 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>

        <p className="mt-6 text-xs text-slate-400 text-center">
          {t.app.name} © 2026 — {t.app.tagline}
        </p>
      </div>
    </div>
  );
}

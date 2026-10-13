import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If coach account is pending approval by the Admin
  if (user.status === "pending_approval") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0e1720] border-2 border-amber-500/50 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-2xl animate-pulse">
            ⏳
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              الجهاز الفني — بانتظار الاعتماد
            </span>
            <h2 className="text-xl font-black text-white">
              حساب المدرب بانتظار موافقة مدير الأكاديمية
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              أهلاً بك يا {user.fullName}. تم تسجيل طلب انضمامك كمدرب بنجاح وهو قيد المراجعة حالياً من قِبل إدارة الأكاديمية.
              <br />
              كشوفات اللاعبين، الحصص التدريبية، ونظام التقييم الفني ستفتح تلقائياً فور اعتماد المدير لحسابك.
            </p>
          </div>
          <div className="pt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              التحقق من حالة الاعتماد ⟳
            </button>
            <a
              href="/login"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              تسجيل الخروج والعودة
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell userRole="coach" userName={user.fullName} hideSidebar={false}>
      {children}
    </AppShell>
  );
}

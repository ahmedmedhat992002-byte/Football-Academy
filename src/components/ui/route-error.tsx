"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  dashboardHref?: string;
  dashboardLabel?: string;
}

export function RouteError({
  error,
  reset,
  dashboardHref = "/admin",
  dashboardLabel = "العودة للوحة التحكم",
}: RouteErrorProps) {
  useEffect(() => {
    console.error("Route error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[55vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-destructive/30 rounded-2xl p-6 text-center shadow-lg space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto text-2xl">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-foreground">
            حدث خطأ غير متوقع أثناء تحميل البيانات
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            تعذر إكمال طلبك في الوقت الحالي. يمكنك محاولة إعادة التحميل الآن أو الرجوع للرئيسية.
          </p>
        </div>

        {error.message && process.env.NODE_ENV === "development" && (
          <div className="p-2.5 rounded-lg bg-muted text-[11px] font-mono text-destructive text-start overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            type="button"
            onClick={() => reset()}
            className="gap-2 font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </Button>

          <Link
            href={dashboardHref}
            className={cn(buttonVariants({ variant: "outline" }), "gap-2 font-bold")}
          >
            <Home className="w-4 h-4" />
            {dashboardLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

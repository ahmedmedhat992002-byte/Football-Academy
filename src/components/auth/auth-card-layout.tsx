import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthCardLayoutProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  maxWidth?: string;
  footerText?: string;
}

export function AuthCardLayout({
  icon,
  title,
  description,
  children,
  maxWidth = "max-w-md",
  footerText = "FIFA FC ACADEMY © 2026 — أكاديمية كرة القدم الاحترافية",
}: AuthCardLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#070e14] overflow-hidden">
      {/* Decorative soccer pitch gradients */}
      <div className="absolute -top-32 -start-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -end-32 h-96 w-96 rounded-full bg-yellow-600/10 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className={cn("relative z-10 w-full flex flex-col items-center", maxWidth)}>
        <Card className="w-full shadow-2xl border-slate-200/80 bg-white">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 mb-2">
              {icon || <KeyRound className="h-8 w-8" />}
            </div>
            <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-slate-500">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {children}
          </CardContent>
        </Card>

        {footerText && (
          <p className="mt-6 text-xs text-slate-400 text-center">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );
}

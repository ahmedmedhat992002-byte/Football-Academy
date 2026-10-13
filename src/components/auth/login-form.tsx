"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction, demoLoginAction } from "@/lib/auth/actions";
import { t } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Trophy,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  UserCheck,
  Users,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { UserRole } from "@/types/database.types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await loginAction(data);
      if (result.success && result.redirectTo) {
        router.push(redirectParam || result.redirectTo);
        router.refresh();
      } else {
        setErrorMessage(result.error || t.common.error);
      }
    });
  };

  const handleDemoLogin = (role: UserRole) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await demoLoginAction(role);
      if (result.success && result.redirectTo) {
        router.push(redirectParam || result.redirectTo);
        router.refresh();
      } else {
        setErrorMessage(result.error || t.common.error);
      }
    });
  };

  const isLoading = isSubmitting || isPending;

  return (
    <Card className="w-full max-w-md shadow-2xl border-slate-200/80 bg-white">
      <CardHeader className="text-center space-y-2 pb-6">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full ring-4 ring-amber-400/90 shadow-xl shadow-amber-500/25 overflow-hidden bg-black shrink-0">
          <Image
            src="/images/logo.png"
            alt="FIFA FC ACADEMY"
            fill
            priority
            className="object-cover"
          />
        </div>
        <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          FIFA FC ACADEMY
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-slate-500">
          تسجيل الدخول للمنظومة الذكية (الإدارة • المدربون • أولياء الأمور)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 p-3 text-xs md:text-sm font-semibold text-rose-700 border border-rose-200/80 text-start">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5 text-start">
            <label className="text-xs font-bold text-slate-700">
              {t.auth.email}
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="name@academy.com"
                disabled={isLoading}
                className={`pe-10 ${errors.email ? "border-rose-400 focus-visible:ring-rose-500" : ""}`}
                {...register("email")}
              />
              <Mail className="absolute end-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1.5 text-start">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {t.auth.password}
              </label>
              <span className="text-[11px] text-amber-600 hover:text-amber-700 hover:underline cursor-pointer">
                {t.auth.forgotPassword}
              </span>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                className={`pe-10 ${errors.password ? "border-rose-400 focus-visible:ring-rose-500" : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="pitch"
            disabled={isLoading}
            className="w-full h-11 text-sm font-bold shadow-md cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.auth.submitting}</span>
              </div>
            ) : (
              <span>{t.auth.login}</span>
            )}
          </Button>
        </form>

        {/* Register prompt */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            ليس لديك حساب بعد؟{" "}
            <Link
              href="/register"
              className="font-bold text-amber-600 hover:text-amber-700 hover:underline inline-flex items-center gap-1"
            >
              <span>سجّل الآن كولي أمر</span>
            </Link>
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <p className="text-[11px] text-slate-400 text-center">
          أكاديمية كرة القدم المعتمدة © 2026 — بناء الأبطال وصناعة المستقبل
        </p>
      </CardFooter>
    </Card>
  );
}

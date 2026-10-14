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
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database.types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback${redirectParam ? `?next=${encodeURIComponent(redirectParam)}` : ""}`,
        },
      });
      if (error) {
        setErrorMessage(error.message || "فشل تسجيل الدخول باستخدام Google");
        setIsGoogleLoading(false);
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء الاتصال بخدمة Google");
      setIsGoogleLoading(false);
    }
  };

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
        window.location.href = redirectParam || result.redirectTo;
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
        window.location.href = redirectParam || result.redirectTo;
      } else {
        setErrorMessage(result.error || t.common.error);
      }
    });
  };

  const isLoading = isSubmitting || isPending;

  const isVerifiedParam = searchParams.get("verified") === "true";
  const isResetParam = searchParams.get("reset") === "success";
  const isPendingParam = searchParams.get("confirmed") === "pending";

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
        {isVerifiedParam && (
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3 text-xs md:text-sm font-bold text-emerald-800 border border-emerald-200 text-start">
            <span className="text-base">✅</span>
            <span>تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول مباشرة.</span>
          </div>
        )}

        {isResetParam && (
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3 text-xs md:text-sm font-bold text-emerald-800 border border-emerald-200 text-start">
            <span className="text-base">✅</span>
            <span>تم تغيير كلمة المرور بنجاح! يرجى تسجيل الدخول بكلمة المرور الجديدة.</span>
          </div>
        )}

        {isPendingParam && (
          <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 p-3 text-xs md:text-sm font-bold text-amber-800 border border-amber-200 text-start">
            <span className="text-base">✉️</span>
            <span>تم إرسال رسالة تحقق إلى بريدك في Gmail. يرجى فتح الرسالة وتأكيد الحساب للمتابعة.</span>
          </div>
        )}

        {searchParams.get("error") === "oauth_failed" && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 p-3 text-xs md:text-sm font-semibold text-rose-700 border border-rose-200 text-start">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>تعذر إكمال تسجيل الدخول بواسطة Google، يرجى المحاولة مرة أخرى أو استخدام البريد.</span>
          </div>
        )}

        {/* Google Quick Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs md:text-sm shadow-sm hover:shadow transition-all duration-200"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{isGoogleLoading ? "جارٍ الاتصال بـ Google..." : "المتابعة السريعة باستخدام Google"}</span>
        </button>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white px-3 text-slate-500 font-bold">أو الدخول بكلمة المرور</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5 text-start">
            <label className="text-xs font-bold text-slate-700">
              {t.auth.email} (Gmail)
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="name@gmail.com"
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
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                {t.auth.forgotPassword}؟
              </Link>
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

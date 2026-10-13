"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: data.password,
        });

        if (error) {
          setErrorMessage(error.message || "فشل تغيير كلمة المرور، قد يكون الرابط غير صالح أو منتهي الصلاحية.");
          return;
        }

        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 2000);
      } catch (err: any) {
        setErrorMessage("حدث خطأ أثناء حفظ كلمة المرور الجديدة");
      }
    });
  };

  const isLoading = isSubmitting || isPending;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#070e14] overflow-hidden">
      {/* Decorative soccer pitch gradients */}
      <div className="absolute -top-32 -start-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -end-32 h-96 w-96 rounded-full bg-yellow-600/10 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <Card className="w-full max-w-md shadow-2xl border-slate-200/80 bg-white">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 mb-2">
              <KeyRound className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              تعيين كلمة المرور الجديدة
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-slate-500">
              أدخل كلمة المرور الجديدة لتأمين حسابك
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-900 text-base">تم تحديث كلمة المرور بنجاح! 🎉</p>
                  <p className="text-xs text-slate-500">جارٍ نقلك تلقائياً إلى صفحة تسجيل الدخول...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-start">
                {errorMessage && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 p-3 text-xs md:text-sm font-semibold text-rose-700 border border-rose-200/80">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    كلمة المرور الجديدة
                  </label>
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
                      className="absolute end-3 top-3 text-slate-400 hover:text-slate-600"
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

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className={`pe-10 ${errors.confirmPassword ? "border-rose-400 focus-visible:ring-rose-500" : ""}`}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute end-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 py-2.5 rounded-xl text-xs md:text-sm mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جارٍ حفظ كلمة المرور...</span>
                    </div>
                  ) : (
                    <span>حفظ كلمة المرور الجديدة</span>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    العودة لصفحة تسجيل الدخول
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-slate-400 text-center">
          FIFA FC ACADEMY © 2026 — أكاديمية كرة القدم الاحترافية
        </p>
      </div>
    </div>
  );
}

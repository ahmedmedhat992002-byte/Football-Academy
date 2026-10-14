"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { AlertCircle, CheckCircle2, Loader2, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      } catch {
        setErrorMessage("حدث خطأ أثناء حفظ كلمة المرور الجديدة");
      }
    });
  };

  const isLoading = isSubmitting || isPending;

  return (
    <AuthCardLayout
      icon={<KeyRound className="h-8 w-8" />}
      title="تعيين كلمة المرور الجديدة"
      description="أدخل كلمة المرور الجديدة لتأمين حسابك"
    >
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
            <PasswordInput
              placeholder="••••••••"
              disabled={isLoading}
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              تأكيد كلمة المرور الجديدة
            </label>
            <PasswordInput
              placeholder="••••••••"
              disabled={isLoading}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 py-2.5 rounded-xl text-xs md:text-sm mt-2 cursor-pointer"
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
    </AuthCardLayout>
  );
}

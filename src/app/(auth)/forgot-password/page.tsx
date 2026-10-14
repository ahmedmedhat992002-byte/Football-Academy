"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await forgotPasswordAction(data);
      if (result.success) {
        setSuccessMessage(result.message || "تم إرسال رابط استعادة كلمة المرور إلى بريدك على Gmail بنجاح.");
        setSentEmail(data.email);
      } else {
        setErrorMessage(result.error || "تعذر إرسال رابط استعادة كلمة المرور، يرجى المحاولة لاحقاً");
      }
    });
  };

  const isLoading = isSubmitting || isPending;

  return (
    <AuthCardLayout
      icon={<KeyRound className="h-8 w-8" />}
      title="استعادة كلمة المرور"
      description="أدخل حساب Gmail المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور"
    >
      {successMessage && sentEmail ? (
        <div className="space-y-4 text-start">
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">تم إرسال الرابط بنجاح! ✉️</p>
              <p>{successMessage}</p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">📌 ملاحظة هامة:</p>
            <p>
              تحقق من صندوق الوارد في Gmail، وإذا لم تجد الرسالة تفقد مجلد <strong>الرسائل غير المرغوب فيها (Spam)</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-colors"
            >
              <span>فتح بريد Gmail الآن</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </a>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              <span>العودة لصفحة تسجيل الدخول</span>
            </Link>
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              البريد الإلكتروني (Gmail)
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="example@gmail.com"
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جارٍ إرسال الرابط إلى Gmail...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>إرسال رابط إعادة التعيين</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </div>
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
            >
              تذكرت كلمة المرور؟ العودة لتسجيل الدخول
            </Link>
          </div>
        </form>
      )}
    </AuthCardLayout>
  );
}

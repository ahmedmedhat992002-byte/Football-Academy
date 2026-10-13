"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  registerSchema,
  coachRegisterSchema,
  type RegisterInput,
  type CoachRegisterInput,
} from "@/lib/validations/auth";
import { registerAction } from "@/lib/auth/actions";
import { registerCoachAction, type CoachProfile } from "@/lib/actions/coaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Trophy,
  Mail,
  Lock,
  Phone,
  User,
  Calendar,
  AlertCircle,
  Shield,
  Loader2,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users2,
  Briefcase,
  Award,
} from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"parent" | "coach">("parent");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coachSubmitted, setCoachSubmitted] = useState<CoachProfile | null>(null);
  const [isPending, startTransition] = useTransition();

  const [emailVerificationSent, setEmailVerificationSent] = useState<string | null>(null);

  // Parent Form
  const parentForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      childName: "",
      childBirthDate: "2015-05-10",
      ageCategory: "U10",
    },
  });

  // Coach Form
  const coachForm = useForm<CoachRegisterInput>({
    resolver: zodResolver(coachRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      specialization: "مدرب فني معتمد (U10-U12)",
      experienceYears: "3 سنوات خبرة في قطاع البراعم",
      bio: "",
    },
  });

  const onParentSubmit = (data: RegisterInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await registerAction(data);
      if (result.success) {
        if (result.requiresEmailConfirmation) {
          setEmailVerificationSent(result.emailSentTo || data.email);
        } else if (result.redirectTo) {
          router.push(result.redirectTo);
          router.refresh();
        }
      } else {
        setErrorMessage(result.error || "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً");
      }
    });
  };

  const onCoachSubmit = (data: CoachRegisterInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await registerCoachAction(data);
      if (result.success && result.coach) {
        setCoachSubmitted(result.coach);
      } else {
        setErrorMessage(result.error || "حدث خطأ أثناء تقديم طلب الانضمام كمدرب");
      }
    });
  };

  const isLoading =
    isPending ||
    (accountType === "parent" ? parentForm.formState.isSubmitting : coachForm.formState.isSubmitting);

  // If email verification was dispatched, show Email Verification confirmation view
  if (emailVerificationSent) {
    return (
      <Card className="w-full max-w-lg shadow-2xl border-amber-500/40 bg-white text-start">
        <CardHeader className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 animate-pulse">
            <Mail className="h-9 w-9" />
          </div>
          <CardTitle className="text-xl md:text-2xl font-black text-slate-900">
            تحقق من بريدك لتفعيل الحساب! ✉️
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            تم إرسال رابط تأكيد الحساب إلى عنوان بريدك الإلكتروني في Gmail:
          </CardDescription>
          <div className="inline-block mx-auto font-mono text-sm font-bold text-amber-800 bg-amber-100/90 px-4 py-1.5 rounded-full border border-amber-300">
            {emailVerificationSent}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 text-xs leading-relaxed text-slate-700">
            <p className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              خطوات تفعيل حسابك:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 ps-1">
              <li>افتح تطبيق <strong>Gmail</strong> أو موقع <span className="font-mono text-amber-700 font-bold">mail.google.com</span>.</li>
              <li>ابحث عن رسالة التأكيد من <strong>FIFA FC ACADEMY</strong>.</li>
              <li>اضغط على رابط التحقق <strong>Confirm your email</strong>.</li>
              <li>بعد تأكيد البريد، يمكنك تسجيل الدخول فوراً بالبريد وكلمة المرور.</li>
            </ol>
          </div>

          <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">💡 تنبيه هام:</p>
            <p>
              إذا لم تجد الرسالة في صندوق الوارد (Inbox)، يرجى فحص مجلد <strong>الرسائل غير المرغوب فيها (Spam / Junk)</strong>.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
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
            <span>الانتقال لصفحة تسجيل الدخول</span>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // If coach successfully submitted application, show Pending Approval confirmation view
  if (coachSubmitted) {
    return (
      <Card className="w-full max-w-lg shadow-2xl border-amber-500/40 bg-white text-start">
        <CardHeader className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 animate-pulse">
            <Clock className="h-9 w-9" />
          </div>
          <CardTitle className="text-xl md:text-2xl font-black text-slate-900">
            تم استلام طلب انضمامك كمدرب بنجاح! ⚽
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            حساب المدرب مسجل الآن وهو <strong className="text-amber-700 font-black">قيد المراجعة والاعتماد من قبل مدير الأكاديمية</strong>.
            لن تتمكن من تسجيل الدخول إلى منظومة المدرب إلا بعد قيام المدير بتأكيد واعتماد حسابك.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">اسم الكابتن:</span>
              <span className="font-black text-slate-900">{coachSubmitted.full_name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">البريد الإلكتروني:</span>
              <span className="font-bold text-slate-800">{coachSubmitted.email}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">التخصص التدريبي:</span>
              <span className="font-bold text-amber-700">{coachSubmitted.specialization}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">حالة الحساب:</span>
              <span className="inline-flex items-center gap-1 font-black text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full text-[11px]">
                <Clock className="w-3 h-3" />
                بانتظار موافقة المدير (Pending Approval)
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-3.5 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-0.5">📌 ماذا يحدث الآن؟</p>
            <p>
              تم إرسال إشعار فوري لمدير الأكاديمية لمراجعة بياناتك واعتماد انضمامك للجهاز الفني. فور تأكيد الاعتماد يمكنك تسجيل الدخول بنفس البريد وكلمة المرور المسجلة.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-colors"
          >
            <span>الذهاب لصفحة تسجيل الدخول</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setCoachSubmitted(null);
              coachForm.reset();
            }}
            className="text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors cursor-pointer"
          >
            تقديم طلب لمدرب آخر
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-2xl border-slate-200/80 bg-white">
      <CardHeader className="text-center space-y-2 pb-5">
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
          الانضمام إلى FIFA FC ACADEMY
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-slate-500">
          اختر نوع الحساب للانضمام إلى صرح FIFA FC ACADEMY الكروي
        </CardDescription>

        {/* Account Type Selector Tabs */}
        <div className="pt-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAccountType("parent");
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                accountType === "parent"
                  ? "bg-white text-amber-900 shadow-sm border border-slate-200/70"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>ولي أمر ولاعب</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType("coach");
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                accountType === "coach"
                  ? "bg-white text-amber-900 shadow-sm border border-slate-200/70"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users2 className="w-3.5 h-3.5 text-amber-600" />
              <span>انضمام كمدرب (الجهاز الفني)</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 p-3 text-xs md:text-sm font-semibold text-rose-700 border border-rose-200/80 text-start">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =========================================================================
            TAB 1: PARENT REGISTRATION FORM
           ========================================================================= */}
        {accountType === "parent" && (
          <form onSubmit={parentForm.handleSubmit(onParentSubmit)} className="space-y-4 text-start">
            {/* Section: Parent Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Shield className="h-4 w-4 text-amber-600" />
                <span>بيانات ولي الأمر الأساسية</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">اسم ولي الأمر بالكامل</label>
                  <div className="relative">
                    <Input
                      placeholder="أ. محمد عبد الرحمن"
                      disabled={isLoading}
                      className="text-xs"
                      {...parentForm.register("fullName")}
                    />
                  </div>
                  {parentForm.formState.errors.fullName && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {parentForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">رقم الهاتف (واتساب)</label>
                  <Input
                    placeholder="01012345678"
                    disabled={isLoading}
                    className="text-xs"
                    {...parentForm.register("phone")}
                  />
                  {parentForm.formState.errors.phone && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {parentForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="parent@example.com"
                    disabled={isLoading}
                    className="text-xs"
                    {...parentForm.register("email")}
                  />
                  {parentForm.formState.errors.email && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {parentForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="text-xs"
                    {...parentForm.register("password")}
                  />
                  {parentForm.formState.errors.password && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {parentForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Child Info */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>بيانات اللاعب المشترك (الابن)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Child Name */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700">اسم اللاعب</label>
                  <Input
                    placeholder="عمر محمد"
                    disabled={isLoading}
                    className="text-xs"
                    {...parentForm.register("childName")}
                  />
                  {parentForm.formState.errors.childName && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {parentForm.formState.errors.childName.message}
                    </p>
                  )}
                </div>

                {/* Child Birth Date */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700">تاريخ ميلاد اللاعب</label>
                  <Input
                    type="date"
                    disabled={isLoading}
                    className="text-xs"
                    {...parentForm.register("childBirthDate")}
                  />
                  {parentForm.formState.errors.childBirthDate && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {parentForm.formState.errors.childBirthDate.message}
                    </p>
                  )}
                </div>

                {/* Age Category */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700">الفئة السنية</label>
                  <select
                    disabled={isLoading}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    {...parentForm.register("ageCategory")}
                  >
                    <option value="U8">فئة البراعم (U8)</option>
                    <option value="U10">فئة الأبطال (U10)</option>
                    <option value="U12">فئة النسور (U12)</option>
                    <option value="U14">فئة النجوم (U14)</option>
                  </select>
                </div>
              </div>
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
                  <span>جاري تسجيل الحساب...</span>
                </div>
              ) : (
                <span>إتمام تسجيل ولي الأمر واللاعب</span>
              )}
            </Button>
          </form>
        )}

        {/* =========================================================================
            TAB 2: COACH APPLICATION FORM (Requires Admin Approval)
           ========================================================================= */}
        {accountType === "coach" && (
          <form onSubmit={coachForm.handleSubmit(onCoachSubmit)} className="space-y-4 text-start">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs text-amber-900 font-semibold">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ملاحظة: يتطلب حساب المدرب مراجعة وتأكيد الاعتماد من مدير الأكاديمية قبل تفعيل الدخول.</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Award className="h-4 w-4 text-amber-600" />
                <span>بيانات الكابتن والمؤهلات التدريبية</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">اسم الكابتن بالكامل (ثلاثي)</label>
                  <Input
                    placeholder="كابتن كريم إبراهيم"
                    disabled={isLoading}
                    className="text-xs"
                    {...coachForm.register("fullName")}
                  />
                  {coachForm.formState.errors.fullName && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {coachForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">رقم الهاتف (واتساب)</label>
                  <Input
                    placeholder="01099887766"
                    disabled={isLoading}
                    className="text-xs"
                    {...coachForm.register("phone")}
                  />
                  {coachForm.formState.errors.phone && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {coachForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">البريد الإلكتروني للتدريب</label>
                  <Input
                    type="email"
                    placeholder="coach.karim@academy.com"
                    disabled={isLoading}
                    className="text-xs"
                    {...coachForm.register("email")}
                  />
                  {coachForm.formState.errors.email && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {coachForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="text-xs"
                    {...coachForm.register("password")}
                  />
                  {coachForm.formState.errors.password && (
                    <p className="text-[10px] text-rose-600 font-semibold">
                      {coachForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Specialization */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">التخصص التدريبي</label>
                  <select
                    disabled={isLoading}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    {...coachForm.register("specialization")}
                  >
                    <option value="مدير فني للبراعم (U10 & U12)">مدير فني للبراعم (U10 & U12)</option>
                    <option value="مدرب حراس المرمى">مدرب حراس المرمى التخصصي</option>
                    <option value="مخطط أحمال وتأهيل بدني">مخطط أحمال وتأهيل بدني وفسيولوجي</option>
                    <option value="مدرب فئات ناشئين (U14 & U16)">مدرب فئات ناشئين (U14 & U16)</option>
                    <option value="مدرب مهارات فردية وتأسيس">مدرب مهارات فردية وتأسيس كروي</option>
                  </select>
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">سنوات الخبرة والمؤهلات</label>
                  <Input
                    placeholder="4 سنوات — رخصة CAF C"
                    disabled={isLoading}
                    className="text-xs"
                    {...coachForm.register("experienceYears")}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>جاري إرسال طلب الانضمام...</span>
                </div>
              ) : (
                <span>إرسال طلب الانضمام كمدرب (بانتظار موافقة الإدارة)</span>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <p className="text-xs text-slate-500 text-center">
          لديك حساب معتمد بالفعل؟{" "}
          <Link href="/login" className="text-amber-600 font-bold hover:underline">
            تسجيل الدخول هنا
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

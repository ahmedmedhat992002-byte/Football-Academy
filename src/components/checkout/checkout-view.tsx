"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield,
  CreditCard,
  CheckCircle2,
  Printer,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Wallet,
  Building,
  Check,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";
import { processCheckoutAction, type CheckoutResult } from "@/lib/actions/checkout";
import type { PaymentMethod } from "@/types/database.types";

interface CheckoutViewProps {
  initialPlanId?: "monthly" | "quarterly" | "yearly";
  currentUser?: {
    id: string;
    fullName: string;
    phone?: string | null;
    email?: string;
    role?: string;
  } | null;
  childrenList?: Array<{
    id: string;
    full_name: string;
    group_name?: string;
  }>;
}

export function CheckoutView({
  initialPlanId = "quarterly",
  currentUser,
  childrenList = [],
}: CheckoutViewProps) {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "yearly">(
    initialPlanId || "quarterly"
  );

  const [parentName, setParentName] = useState(currentUser?.fullName || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [childName, setChildName] = useState(
    childrenList.length > 0 ? childrenList[0].full_name : ""
  );
  const [selectedChildId, setSelectedChildId] = useState(
    childrenList.length > 0 ? childrenList[0].id : ""
  );
  const [ageCategory, setAgeCategory] = useState("U10");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("instapay");
  const [instapayRef, setInstapayRef] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptResult, setReceiptResult] = useState<CheckoutResult["receipt"] | null>(null);

  const planOptions = {
    monthly: {
      name: "الاشتراك الشهري الأساسي",
      price: 1200,
      period: "شهر واحد",
      sessions: "8 حصص تدريبية",
      badge: "مرونة شهرية",
      features: [
        "8 حصص تدريبية في الشهر (حصتان أسبوعياً)",
        "تسجيل حضور فوري وإشعارات ولي الأمر",
        "تقرير تقييم مهارات شهري معتمد",
      ],
    },
    quarterly: {
      name: "باقة التدريب الفصلي (3 أشهر)",
      price: 3200,
      period: "3 أشهر",
      sessions: "24 حصة تدريبية",
      badge: "الأكثر طلباً ⭐ (توفير 400 ج.م)",
      features: [
        "24 حصة تدريبية مكثفة",
        "طقم تدريب رسمي مجاناً (قميص وشورت)",
        "مشاركة في المباريات الودية الرسمية",
        "تقارير دورية متقدمة",
      ],
    },
    yearly: {
      name: "العضوية السنوية الذهبية (12 شهر)",
      price: 11000,
      period: "سنة كاملة",
      sessions: "96 حصة تدريبية",
      badge: "توفير سنوي + أطقم مجانية",
      features: [
        "تدريب سنوي كامل بدون توقف (96 حصة)",
        "طاقمان تدريبيان + حقيبة رياضية متكاملة",
        "تسويق مهارات وترشيح لاختبارات الأندية",
        "تأمين رياضي وكارت عضوية سنوي",
      ],
    },
  };

  const activePlan = planOptions[selectedPlan];

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!parentName || !childName || !phone) {
      setErrorMessage("يرجى التأكد من استكمال بيانات ولي الأمر واللاعب");
      return;
    }

    if (paymentMethod === "instapay" && !instapayRef) {
      setErrorMessage("يرجى إدخال رقم العملية أو كود التحويل عبر إنستاباي للتأكيد");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await processCheckoutAction({
        parentName,
        phone,
        email: currentUser?.email,
        childName,
        childId: selectedChildId || undefined,
        ageCategory,
        planId: selectedPlan,
        paymentMethod,
        transactionRef:
          paymentMethod === "instapay"
            ? instapayRef
            : paymentMethod === "cash"
            ? "دفع نقدي بمقر الأكاديمية"
            : `بطاقة ****${cardNumber.slice(-4) || "8821"}`,
      });

      if (res.success && res.receipt) {
        setReceiptResult(res.receipt);
      } else {
        setErrorMessage(res.error || "حدث خطأ أثناء معالجة السداد");
      }
    } catch {
      setErrorMessage("تعذر الاتصال ببوابة السداد، يرجى المحاولة لاحقاً");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If receipt is completed, show the official digital receipt view
  if (receiptResult) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="rounded-3xl bg-[#0f1721] border border-amber-500/40 p-6 md:p-8 shadow-2xl text-start space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-2 pb-6 border-b border-[#20303e]">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
              <Clock className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white">
              تم تسجيل السداد — بانتظار اعتماد مدير الأكاديمية ⏳
            </h2>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              تم استلام بيانات التحويل وإرسال إشعار عاجل لمدير الأكاديمية لمراجعة وتأكيد الاشتراك. سيتم فتح حسابك والمنظومة بالكامل فور اعتماد المدير.
            </p>
          </div>

          {/* Official Receipt Card */}
          <div className="rounded-2xl bg-[#14202c] border border-[#233547] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#233547] pb-3">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="FIFA FC ACADEMY"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-black text-sm text-amber-400 block tracking-wider">FIFA FC ACADEMY</span>
                  <span className="text-[10px] text-slate-400 block">إيصال سداد رقمي معتمد</span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {receiptResult.receiptNo}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">اسم اللاعب المشترك:</span>
                <span className="font-bold text-white mt-0.5 block">{receiptResult.childName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ولي الأمر:</span>
                <span className="font-bold text-white mt-0.5 block">{receiptResult.parentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الباقة المفعلة:</span>
                <span className="font-bold text-amber-400 mt-0.5 block">{receiptResult.planName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">فترة الاشتراك:</span>
                <span className="font-bold text-white mt-0.5 block">حتى {receiptResult.endDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">طريقة السداد:</span>
                <span className="font-bold text-white mt-0.5 block">
                  {receiptResult.method === "instapay"
                    ? "إنستاباي / محفظة إلكترونية"
                    : receiptResult.method === "cash"
                    ? "سداد نقدي بالأكاديمية"
                    : "بطاقة بنكية"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">تاريخ العملية:</span>
                <span className="font-bold text-white mt-0.5 block">{receiptResult.paidAt}</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                <span className="text-slate-300 text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  حالة تفعيل الحساب:
                </span>
                <span className="text-xs font-black text-amber-300">
                  بانتظار تأكيد المدير ⏳
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#233547] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">المبلغ المدفوع:</span>
              <span className="text-xl font-black text-amber-400">
                {receiptResult.amount.toLocaleString()} ج.م
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b2b3b] hover:bg-[#23384c] text-slate-200 text-xs font-bold px-5 py-3 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة إيصال السداد</span>
            </button>

            <Link
              href="/parent"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-6 py-3 shadow-lg shadow-amber-950 transition-all cursor-pointer"
            >
              <span>الانتقال لبوابة ولي الأمر</span>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-4 sm:px-6">
      {/* Header with Logo */}
      <div className="text-start space-y-3 mb-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0">
              <Image src="/images/logo.png" alt="FIFA FC ACADEMY" fill className="object-cover" />
            </div>
            <span className="text-xs font-black text-amber-400 tracking-wider">FIFA FC ACADEMY</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white">
          بوابة السداد وتفعيل اشتراك FIFA FC ACADEMY
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          اختر الباقة المناسبة للاعب وسدد الرسوم لتأكيد الحضور والحصول على الإيصال الرقمي المعتمد فوراً
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Plan Selector & Payment Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plan Selector Tabs */}
          <div className="rounded-2xl bg-[#0f1721] border border-[#20303e] p-4 text-start space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              1. اختر باقة التدريب:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["monthly", "quarterly", "yearly"] as const).map((key) => {
                const p = planOptions[key];
                const isSelected = selectedPlan === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPlan(key)}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-950"
                        : "bg-[#14202c] border-[#223547] text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold block truncate">
                        {p.period}
                      </span>
                      <span className="text-sm font-black text-amber-400 mt-1 block">
                        {p.price} ج.م
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-bold text-amber-300 mt-1 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        مختارة
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitPayment} className="space-y-6 text-start">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Parent & Child info */}
            <div className="rounded-2xl bg-[#0f1721] border border-[#20303e] p-5 space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-amber-400" />
                <span>2. بيانات المشترك وولي الأمر:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">اسم ولي الأمر</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="أ. محمد أحمد"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-xl bg-[#14202c] border border-[#223547] px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">رقم الهاتف (واتساب)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-xl bg-[#14202c] border border-[#223547] px-3 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">اسم اللاعب المشترك</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="عمر محمد"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-xl bg-[#14202c] border border-[#223547] px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">الفئة السنية</label>
                  <select
                    value={ageCategory}
                    onChange={(e) => setAgeCategory(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-xl bg-[#14202c] border border-[#223547] px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="U8">براعم U8 (6 - 8 سنوات)</option>
                    <option value="U10">أبطال U10 (8 - 10 سنوات)</option>
                    <option value="U12">نسور U12 (10 - 12 سنة)</option>
                    <option value="U14">نجوم U14 (12 - 15 سنة)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="rounded-2xl bg-[#0f1721] border border-[#20303e] p-5 space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-400" />
                <span>3. وسيلة الدفع المعتمدة:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Method 1: InstaPay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("instapay")}
                  className={`p-3 rounded-xl border text-start cursor-pointer transition-all ${
                    paymentMethod === "instapay"
                      ? "bg-amber-500/15 border-amber-500 text-white"
                      : "bg-[#14202c] border-[#223547] text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold">إنستاباي / محفظة</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">تحويل فوري بدون رسوم</span>
                </button>

                {/* Method 2: Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`p-3 rounded-xl border text-start cursor-pointer transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "bg-amber-500/15 border-amber-500 text-white"
                      : "bg-[#14202c] border-[#223547] text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold">بطاقة بنكية</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">فيزا / ماستركارد</span>
                </button>

                {/* Method 3: Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-3 rounded-xl border text-start cursor-pointer transition-all ${
                    paymentMethod === "cash"
                      ? "bg-amber-500/15 border-amber-500 text-white"
                      : "bg-[#14202c] border-[#223547] text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold">نقداً بمقر الأكاديمية</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">حجز والدفع في الملعب</span>
                </button>
              </div>

              {/* Method Specific details */}
              {paymentMethod === "instapay" && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="text-xs text-amber-300 font-semibold space-y-1">
                    <p>قم بالتحويل على عنوان إنستاباي الرسمي للأكاديمية:</p>
                    <p className="font-mono text-sm font-black text-white bg-[#0e1720] p-2 rounded-lg inline-block border border-amber-500/40">
                      football.academy@instapay
                    </p>
                    <p className="text-[11px] text-slate-400">أو رقم المحفظة / فودافون كاش: 01012345678</p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-white block">
                      رقم العملية أو اسم الحساب المحول منه (Reference):
                    </label>
                    <input
                      type="text"
                      value={instapayRef}
                      onChange={(e) => setInstapayRef(e.target.value)}
                      placeholder="مثال: REF-987654 أو اسم صاحب المحفظة"
                      disabled={isSubmitting}
                      className="w-full h-10 rounded-xl bg-[#0f1721] border border-[#233547] px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "bank_transfer" && (
                <div className="space-y-3 p-4 rounded-xl bg-[#14202c] border border-[#233547]">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">رقم البطاقة</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      disabled={isSubmitting}
                      className="w-full h-10 rounded-xl bg-[#0f1721] border border-[#20303e] px-3 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">تاريخ الانتهاء</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        disabled={isSubmitting}
                        className="w-full h-10 rounded-xl bg-[#0f1721] border border-[#20303e] px-3 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">رمز الأمان (CVV)</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        disabled={isSubmitting}
                        className="w-full h-10 rounded-xl bg-[#0f1721] border border-[#20303e] px-3 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  سيتم تسجيل الاشتراك وتوليد إذن سداد رسمي. يمكنك تسليم الرسوم نقداً لإدارة الأكاديمية عند الحضور لأول حصة تدريبية.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-amber-950 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>جاري معالجة السداد وتفعيل الاشتراك...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>تأكيد السداد وتفعيل الاشتراك ({activePlan.price.toLocaleString()} ج.م)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Order Summary Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-[#0f1721] border border-[#20303e] p-6 text-start space-y-5 sticky top-24 shadow-xl">
            <div className="border-b border-[#20303e] pb-4 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                ملخص الطلب والاشتراك
              </span>
              <h3 className="text-lg font-black text-white">{activePlan.name}</h3>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {activePlan.badge}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>المدة الزمنية:</span>
                <span className="font-bold text-white">{activePlan.period}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>عدد الحصص التدريبية:</span>
                <span className="font-bold text-white">{activePlan.sessions}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>الملاعب المخصصة:</span>
                <span className="font-bold text-white">الملعب الرئيسي وملاعب النخيل</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>رسوم المنظومة الرقمية:</span>
                <span className="font-bold text-amber-400">مجاناً 100%</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#20303e] space-y-2">
              <h4 className="text-[11px] font-bold text-slate-300">المميزات المشمولة بالباقة:</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                {activePlan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-[#20303e] flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block">الإجمالي المطلوب سداده:</span>
                <span className="text-[10px] text-slate-500">شامل الضرائب والاشتراك</span>
              </div>
              <div className="text-end">
                <span className="text-2xl font-black text-amber-400">
                  {activePlan.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 ms-1 font-bold">ج.م</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
              <span>يتم تفعيل حسابك وإرسال إشعار فوري لمدير الأكاديمية فور إتمام السداد.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

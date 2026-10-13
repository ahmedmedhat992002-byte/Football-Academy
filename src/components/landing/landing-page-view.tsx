"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Trophy,
  Users,
  Calendar,
  CheckCircle2,
  Star,
  Zap,
  Award,
  ChevronLeft,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Menu,
  X,
  CreditCard,
  UserCheck,
  Check,
  Send,
  Loader2,
  HeartHandshake,
} from "lucide-react";
import { bookTrialAction } from "@/lib/auth/actions";
import type { UserRole } from "@/types/database.types";

interface LandingPageViewProps {
  currentUser?: {
    id: string;
    fullName: string;
    role: UserRole;
  } | null;
}

export function LandingPageView({ currentUser }: LandingPageViewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Trial booking form state
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [phone, setPhone] = useState("");
  const [ageCategory, setAgeCategory] = useState("U10");
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);
  const [trialSuccessMsg, setTrialSuccessMsg] = useState<string | null>(null);
  const [trialErrorMsg, setTrialErrorMsg] = useState<string | null>(null);

  const handleBookTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrialErrorMsg(null);
    setTrialSuccessMsg(null);

    if (!parentName || !childName || !phone) {
      setTrialErrorMsg("يرجى ملء جميع البيانات الأساسية لحجز الاختبار");
      return;
    }

    setIsSubmittingTrial(true);
    try {
      const res = await bookTrialAction({
        parentName,
        childName,
        phone,
        ageCategory,
      });

      if (res.success) {
        setTrialSuccessMsg(res.message);
        setParentName("");
        setChildName("");
        setPhone("");
      } else {
        setTrialErrorMsg(res.message);
      }
    } catch {
      setTrialErrorMsg("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً");
    } finally {
      setIsSubmittingTrial(false);
    }
  };

  const dashboardUrl =
    currentUser?.role === "coach"
      ? "/coach"
      : currentUser?.role === "parent"
      ? "/parent"
      : "/admin";

  return (
    <div className="min-h-screen bg-[#070e14] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* =========================================================================
          TOP NAVBAR
         ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#070e14]/90 backdrop-blur-md border-b border-[#142330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-amber-400 shadow-xl shadow-amber-500/25 overflow-hidden bg-black shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="FIFA FC ACADEMY"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="text-start">
              <span className="text-lg font-black tracking-wider text-amber-400 block font-sans">
                FIFA FC ACADEMY
              </span>
              <span className="text-[11px] text-amber-300/90 font-bold block">
                أكاديمية فيفا إف سي — صناع الأبطال ⚽
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#about" className="hover:text-amber-400 transition-colors">عن الأكاديمية</a>
            <a href="#programs" className="hover:text-amber-400 transition-colors">الفئات السنية</a>
            <a href="#platform" className="hover:text-amber-400 transition-colors">المنظومة الذكية</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">باقات الاشتراك</a>
            <a href="#coaches" className="hover:text-amber-400 transition-colors">المدربون</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">تواصل معنا</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <Link
                href={dashboardUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black px-4 py-2.5 transition-all shadow-md shadow-amber-950/40"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>لوحة التحكم ({currentUser.fullName.split(" ")[0]})</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-700 hover:border-amber-400 hover:text-amber-300 text-slate-200 text-xs font-bold px-4 py-2.5 transition-all"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black px-4 py-2.5 shadow-md shadow-amber-950/40 transition-all active:scale-95"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>سجّل لاعباً جديداً</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#142330] text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0c1620] border-b border-[#1b2c3c] px-4 py-4 space-y-3 text-start">
            <a
              href="#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-slate-300 py-1.5"
            >
              الفئات السنية
            </a>
            <a
              href="#platform"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-slate-300 py-1.5"
            >
              المنظومة الذكية
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-slate-300 py-1.5"
            >
              باقات الاشتراك
            </a>
            <a
              href="#trial"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-amber-400 py-1.5"
            >
              حجز اختبار أداء مجاني
            </a>
            <div className="pt-3 border-t border-[#1b2c3c] flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2.5 rounded-xl bg-[#152330] text-xs font-bold text-white"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-black text-slate-950"
              >
                سجّل لاعباً جديداً
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION
         ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Stadium Background with Gold & Obsidian Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-stadium.jpg"
            alt="ملعب الأكاديمية"
            fill
            priority
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070e14]/70 via-[#070e14]/90 to-[#070e14]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Official FIFA FC ACADEMY Crest Emblem */}
          <div className="flex justify-center pb-1">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/50 via-yellow-400/40 to-amber-600/50 rounded-full blur-xl opacity-80 group-hover:opacity-100 transition duration-1000 animate-pulse" />
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-amber-400/90 shadow-2xl shadow-amber-500/30 bg-black transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="FIFA FC ACADEMY Emblem"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-lg shadow-amber-950/50">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>FIFA FC ACADEMY — الصرح الكروي رقم #1 لصناعة النجوم</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            أكاديمية <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 font-sans tracking-wider">FIFA FC ACADEMY</span>
            <br />
            نصنع أبطال الغد.. ونطوّر مهارات المستقبل بأحدث الأساليب العالمية
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            برامج تدريبية تكتيكية وبدنية متطورة للفئات السنية من 6 إلى 16 سنة تحت إشراف نخبة من المدربين المعتمدين، مع منظومة رقمية متكاملة لمتابعة حضور وأداء لاعبك لحظة بلحظة.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#trial"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm px-8 py-4 shadow-xl shadow-amber-950/70 border border-amber-400/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>احجز اختبار أداء مجاني لابنك</span>
              <ChevronLeft className="h-4 w-4" />
            </a>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#13202d] hover:bg-[#1a2c3d] text-slate-200 border border-[#23384c] font-bold text-sm px-7 py-4 transition-all"
            >
              <span>دخول المنصة الرقمية</span>
              <ArrowRight className="h-4 w-4 rotate-180 text-amber-400" />
            </Link>
          </div>

          {/* Stats Ribbon */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-[#0c1620]/80 border border-[#1b2b3b] p-4 text-center">
              <div className="text-2xl md:text-3xl font-black text-amber-400">500+</div>
              <div className="text-xs text-slate-400 mt-1 font-bold">لاعب متدرب مسجل</div>
            </div>
            <div className="rounded-2xl bg-[#0c1620]/80 border border-[#1b2b3b] p-4 text-center">
              <div className="text-2xl md:text-3xl font-black text-amber-400">12</div>
              <div className="text-xs text-slate-400 mt-1 font-bold">مدرب معتمد دولياً</div>
            </div>
            <div className="rounded-2xl bg-[#0c1620]/80 border border-[#1b2b3b] p-4 text-center">
              <div className="text-2xl md:text-3xl font-black text-amber-400">4</div>
              <div className="text-xs text-slate-400 mt-1 font-bold">فئات سنية متخصصة</div>
            </div>
            <div className="rounded-2xl bg-[#0c1620]/80 border border-[#1b2b3b] p-4 text-center">
              <div className="text-2xl md:text-3xl font-black text-amber-400">98%</div>
              <div className="text-xs text-slate-400 mt-1 font-bold">رضا أولياء الأمور</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          AGE CATEGORIES & TRAINING PROGRAMS
         ========================================================================= */}
      <section id="programs" className="py-16 md:py-24 bg-[#0a131b] border-t border-[#142330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              مسارات التكوين والتطوير
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              برامج تدريبية متخصصة لكل فئة سنية
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              مناهج كروية معتمدة تراعي الخصائص العمرية والبدنية لكل لاعب لضمان التطور المستمر والشغف باللعبة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* U8 */}
            <div className="rounded-2xl bg-[#0f1b26] border border-[#1f3346] p-6 text-start flex flex-col justify-between hover:border-amber-500/50 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                    فئة U8
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">6 - 8 سنوات</span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300">
                  براعم المستقبل
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  التركيز على حب كرة القدم، التوافق الحركي العضلي، السيطرة الأولية على الكرة، واللعب الجماعي الممتع.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1b2b3b] mt-4 flex items-center justify-between text-xs text-slate-300">
                <span>السبت والثلاثاء</span>
                <span className="text-amber-400 font-bold">ملعب الصغار المغطى</span>
              </div>
            </div>

            {/* U10 */}
            <div className="rounded-2xl bg-[#0f1b26] border border-[#1f3346] p-6 text-start flex flex-col justify-between hover:border-amber-500/50 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                    فئة U10
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">8 - 10 سنوات</span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300">
                  فريق الأبطال
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تطوير مهارات التمرير القصير، المراوغة، التحرك الذكي بدون كرة، والجرأة في المواقف الهجومية الفردية.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1b2b3b] mt-4 flex items-center justify-between text-xs text-slate-300">
                <span>الأحد والثلاثاء</span>
                <span className="text-amber-400 font-bold">الملعب الرئيسي</span>
              </div>
            </div>

            {/* U12 */}
            <div className="rounded-2xl bg-[#0f1b26] border border-[#1f3346] p-6 text-start flex flex-col justify-between hover:border-amber-500/50 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                    فئة U12
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">10 - 12 سنة</span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300">
                  فريق النسور
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  الوعي التكتيكي، السرعات بالكرة، الضغط الدفاعي المنظم، والتسديد بكلتا القدمين من مسافات متنوعة.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1b2b3b] mt-4 flex items-center justify-between text-xs text-slate-300">
                <span>السبت والأربعاء</span>
                <span className="text-amber-400 font-bold">ملعب التدريب رقم (2)</span>
              </div>
            </div>

            {/* U14 */}
            <div className="rounded-2xl bg-[#0f1b26] border border-[#1f3346] p-6 text-start flex flex-col justify-between hover:border-amber-500/50 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black">
                    فئة U14
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">12 - 15 سنة</span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300">
                  فريق النجوم
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  خطط اللعب المتقدمة (4-3-3)، اختبارات الأندية الرسمية، التأهيل للبطولات، وبناء العقلية القيادية.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1b2b3b] mt-4 flex items-center justify-between text-xs text-slate-300">
                <span>الاثنين والخميس</span>
                <span className="text-amber-400 font-bold">الملعب الرئيسي</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE SMART PLATFORM FEATURES (ADMIN, COACH, PARENT)
         ========================================================================= */}
      <section id="platform" className="py-16 md:py-24 bg-[#070e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              الابتكار الرقمي الأول في المنطقة
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              منظومة إلكترونية متكاملة تربط الميدان بولي الأمر
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              لا مزيد من الأوراق أو التخمين. وفرنا بوابات رقمية مخصصة للإدارة، المدرب، وولي الأمر.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Coach */}
            <div className="rounded-2xl bg-gradient-to-b from-[#121a24] to-[#090e15] border border-amber-500/20 p-6 text-start space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">بوابة المدرب الميدانية المباشرة</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تسجيل حضور لحظي داخل الملعب بالهاتف</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تقييم شهري للمهارات الفنية، البدنية، والتكتيكية</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>ملاحظات تدريبية خاصة بكل لاعب</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                >
                  <span>استكشف بوابة المدرب</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature 2: Parent */}
            <div className="rounded-2xl bg-gradient-to-b from-[#181208] to-[#090e15] border border-amber-500/40 p-6 text-start space-y-4 shadow-xl shadow-amber-950/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">بوابة متابعة ولي الأمر</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>إشعار فوري بحضور اللاعب في كل حصة</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تقرير فني شهري شامل قابل للطباعة (A4)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>سجل الاشتراكات وإيصالات السداد المعتمدة</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                >
                  <span>استكشف بوابة ولي الأمر</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Admin */}
            <div className="rounded-2xl bg-gradient-to-b from-[#121a24] to-[#090e15] border border-amber-500/20 p-6 text-start space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">لوحة تحكم إدارة الأكاديمية</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>إدارة المجموعات، الحصص، وتعيين الكباتن</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تقارير الإيرادات وسجل المدفوعات والاشتراكات</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تصدير البيانات والتحكم في إعدادات النظام</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                >
                  <span>استكشف بوابة الإدارة</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SUBSCRIPTION PRICING PLANS
         ========================================================================= */}
      <section id="pricing" className="py-16 md:py-24 bg-[#0a131b] border-t border-[#142330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              خطط الاشتراك السنوية والشهرية
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              استثمار حقيقي في مستقبل بطلك الصغير
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              باقات مرنة تناسب جميع الأعمار، تشمل التدريبات المتخصصة، المتابعة الطبية والفنية، والمباريات الودية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Plan 1 */}
            <div className="rounded-2xl bg-[#0e1923] border border-[#1d3040] p-6 text-start flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">الاشتراك الشهري الأساسي</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">1,200</span>
                  <span className="text-xs text-slate-400">ج.م / شهرياً</span>
                </div>
                <p className="text-xs text-slate-400">
                  مناسب لتجربة البرنامج والبدء في اكتساب المهارات الأساسية.
                </p>
                <div className="space-y-2.5 pt-4 border-t border-[#192b3b] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>8 حصص تدريبية في الشهر (حصتان أسبوعياً)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>تسجيل حضور ذكي وإشعارات لولي الأمر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>تقرير تقييم مهاري شهري</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/checkout?plan=monthly"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-[#172737] hover:bg-[#1f3449] text-white font-bold text-xs py-3 transition-colors"
                >
                  الاشتراك في الباقة الشهرية
                </Link>
              </div>
            </div>

            {/* Plan 2: Featured */}
            <div className="rounded-2xl bg-gradient-to-b from-[#241a08] to-[#0d1620] border-2 border-amber-500 p-6 text-start flex flex-col justify-between relative shadow-2xl shadow-amber-950/60">
              <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wide">
                الباقة الأكثر طلباً ⭐
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-black text-white">باقة التدريب الفصلي (3 أشهر)</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-400">3,200</span>
                  <span className="text-xs text-slate-300">ج.م / 3 أشهر</span>
                </div>
                <p className="text-xs text-amber-100/80">
                  توفير 400 ج.م مع طقم تدريب رياضي رسمي كامل مجاناً.
                </p>
                <div className="space-y-2.5 pt-4 border-t border-amber-500/30 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>24 حصة تدريبية مكثفة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>زي رياضي تدريبي رسمي مجاناً (قميص وشورت)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>مشاركة في المباريات الودية الرسمية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>تقارير مهارية وبدنية متقدمة شهرياً</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/checkout?plan=quarterly"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3.5 shadow-lg shadow-amber-950 transition-all active:scale-95"
                >
                  الاشتراك في الباقة الفصلية
                </Link>
              </div>
            </div>

            {/* Plan 3 */}
            <div className="rounded-2xl bg-[#0e1923] border border-[#1d3040] p-6 text-start flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">العضوية السنوية الذهبية</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">11,000</span>
                  <span className="text-xs text-slate-400">ج.م / 12 شهراً</span>
                </div>
                <p className="text-xs text-slate-400">
                  برنامج تطويري سنوي متكامل وتأهيل لاختبارات الأندية الكبرى.
                </p>
                <div className="space-y-2.5 pt-4 border-t border-[#192b3b] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>تدريب سنوي كامل بدون توقف (96 حصة)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>طاقمان تدريبيان + حقيبة رياضية متكاملة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>تسويق مهارات وترشيح للاختبارات بالأندية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" />
                    <span>كارت عضوية سنوي وتأمين رياضي</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/checkout?plan=yearly"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-[#172737] hover:bg-[#1f3449] text-white font-bold text-xs py-3 transition-colors"
                >
                  الاشتراك في العضوية السنوية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COACHING STAFF
         ========================================================================= */}
      <section id="coaches" className="py-16 md:py-24 bg-[#070e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              نخبة المدربين المعتمدين
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              كوادر تدريبية ذات خبرات احترافية
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              جميع مدربينا حاصلون على رخص الاتحاد القاري ومؤهلون تربوياً ونفسياً للتعامل مع الفئات السنية الشابة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-[#0c1620] border border-[#1a2b3b] p-6 text-center space-y-3">
              <div className="h-20 w-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-black text-xl">
                م.س
              </div>
              <h3 className="text-base font-bold text-white">كابتن محمود السعدني</h3>
              <p className="text-xs text-amber-400 font-semibold">المدير الفني للأكاديمية</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                رخصة CAF A التدريبية — لاعب دولي سابق، خبرة أكثر من 12 عاماً في تأسيس وتطوير قطاعات الناشئين.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0c1620] border border-[#1a2b3b] p-6 text-center space-y-3">
              <div className="h-20 w-20 mx-auto rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center text-yellow-400 font-black text-xl">
                أ.م
              </div>
              <h3 className="text-base font-bold text-white">كابتن أحمد مدحت</h3>
              <p className="text-xs text-yellow-400 font-semibold">مدرب اللياقة والتأهيل الحركي</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                أخصائي الإعداد البدني والتوافق العضلي للفئات السنية، حاصل على دبلومة اللياقة التخصصية من برشلونة.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0c1620] border border-[#1a2b3b] p-6 text-center space-y-3">
              <div className="h-20 w-20 mx-auto rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-xl">
                ك.ح
              </div>
              <h3 className="text-base font-bold text-white">كابتن كريم حسام</h3>
              <p className="text-xs text-amber-300 font-semibold">مدرب حراس المرمى</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                حارس مرمى دوري ممتاز سابق، متخصص في ردود الأفعال السريعة والتمركز التكتيكي والتصدي لضربات الجزاء.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE TRIAL BOOKING FORM SECTION
         ========================================================================= */}
      <section id="trial" className="py-16 md:py-24 bg-gradient-to-b from-[#0a151f] to-[#060c11] border-t border-[#142330]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#171207] via-[#0f1721] to-[#171207] border border-amber-500/40 p-6 md:p-10 shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>فرصة مميزة لاختبار مهارات بطلك</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white">
              احجز حصة تدريبية واختبار أداء ميداني مجاناً
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              سجل بياناتك الآن وسيقوم كابتن الأكاديمية بالتواصل معك هاتفياً لتحديد موعد الحصة التجريبية وتقييم مستوى اللاعب في الملعب دون أي التزام مالي مسبق.
            </p>

            {trialSuccessMsg ? (
              <div className="p-5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs md:text-sm font-bold text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="h-8 w-8 mx-auto text-amber-400" />
                <p>{trialSuccessMsg}</p>
                <button
                  type="button"
                  onClick={() => setTrialSuccessMsg(null)}
                  className="mt-2 text-xs text-white underline cursor-pointer"
                >
                  حجز موعد لطفل آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookTrial} className="space-y-4 max-w-xl mx-auto text-start">
                {trialErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                    {trialErrorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">اسم ولي الأمر</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="أ. محمد أحمد"
                      disabled={isSubmittingTrial}
                      className="w-full h-11 rounded-xl bg-[#142330] border border-[#23384c] px-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">اسم اللاعب الصغير</label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="عمر محمد"
                      disabled={isSubmittingTrial}
                      className="w-full h-11 rounded-xl bg-[#142330] border border-[#23384c] px-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">رقم الهاتف (واتساب للتواصل)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01012345678"
                      disabled={isSubmittingTrial}
                      className="w-full h-11 rounded-xl bg-[#142330] border border-[#23384c] px-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">الفئة السنية المتوقعة</label>
                    <select
                      value={ageCategory}
                      onChange={(e) => setAgeCategory(e.target.value)}
                      disabled={isSubmittingTrial}
                      className="w-full h-11 rounded-xl bg-[#142330] border border-[#23384c] px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="U8">براعم U8 (6 - 8 سنوات)</option>
                      <option value="U10">أبطال U10 (8 - 10 سنوات)</option>
                      <option value="U12">نسور U12 (10 - 12 سنة)</option>
                      <option value="U14">نجوم U14 (12 - 15 سنة)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTrial}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-amber-950 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isSubmittingTrial ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>جاري إرسال الطلب...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-slate-950" />
                      <span>تأكيد حجز الاختبار المجاني</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER & CONTACT
         ========================================================================= */}
      <footer id="contact" className="bg-[#05090d] border-t border-[#121d27] py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-start">
            {/* Col 1: FIFA FC ACADEMY Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-white">
                <div className="relative h-10 w-10 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="FIFA FC ACADEMY"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-black text-sm tracking-wider text-amber-400 block">FIFA FC ACADEMY</span>
                  <span className="text-[10px] text-amber-300 font-bold block">أكاديمية كرة القدم الاحترافية</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                صناعة النجوم، التأسيس المهاري السليم، وغرس الروح الرياضية والانضباط في بيئة تدريبية احترافية وآمنة.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">روابط سريعة</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#programs" className="hover:text-amber-400">الفئات السنية</a></li>
                <li><a href="#platform" className="hover:text-amber-400">المنظومة الذكية</a></li>
                <li><a href="#pricing" className="hover:text-amber-400">باقات الاشتراك</a></li>
                <li><Link href="/login" className="hover:text-amber-400">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="hover:text-amber-400">تسجيل لاعب جديد</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">بوابات النظام</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/login" className="hover:text-amber-400">بوابة الإدارة المركزية</Link></li>
                <li><Link href="/login" className="hover:text-amber-400">بوابة المدرب والتحضير الميداني</Link></li>
                <li><Link href="/login" className="hover:text-amber-400">بوابة ولي الأمر ومتابعة الأبناء</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">موقع الملاعب والتواصل</h4>
              <div className="space-y-2 text-[11px]">
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>المجمع الرياضي الدولي — الملعب الرئيسي وملعب النخيل</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono">01012345678 / 01198765432</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>التمارين: السبت إلى الخميس (3:30 م إلى 9:00 م)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#121d27] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>جميع الحقوق محفوظة © 2026 FIFA FC ACADEMY — صناع النجوم والاحتراف الكروي</p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-slate-300">تسجيل الدخول</Link>
              <span>•</span>
              <Link href="/register" className="hover:text-slate-300">تسجيل جديد</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

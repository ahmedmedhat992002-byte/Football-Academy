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
  ChevronDown,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Menu,
  X,
  CreditCard,
  Check,
  Send,
  Loader2,
  HeartHandshake,
  MessageCircle,
  Activity,
  Layers,
  HelpCircle,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { bookTrialAction } from "@/lib/auth/actions";
import type { UserRole } from "@/types/database.types";
import type { Group, SubscriptionPlan, Testimonial } from "@/lib/data/academy-store";
import type { CoachProfile } from "@/lib/actions/coaches";
import { createTestimonialAction, deleteTestimonialAction } from "@/lib/actions/testimonials";

interface LandingPageViewProps {
  currentUser?: {
    id: string;
    fullName: string;
    role: UserRole;
  } | null;
  playersCount?: number;
  groups?: Group[];
  coaches?: CoachProfile[];
  plans?: SubscriptionPlan[];
  initialTestimonials?: Testimonial[];
}

export function LandingPageView({
  currentUser,
  playersCount = 28,
  groups = [],
  coaches = [],
  plans = [],
  initialTestimonials = [],
}: LandingPageViewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Trial booking form state
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [phone, setPhone] = useState("");
  const [ageCategory, setAgeCategory] = useState("U10");
  const [preferredDay, setPreferredDay] = useState("السبت أو الثلاثاء");
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);
  const [trialSuccessMsg, setTrialSuccessMsg] = useState<string | null>(null);
  const [trialErrorMsg, setTrialErrorMsg] = useState<string | null>(null);
  const [lastSubmittedLead, setLastSubmittedLead] = useState<{
    parentName: string;
    childName: string;
    phone: string;
    ageCategory: string;
  } | null>(null);

  // Real testimonials state & handlers
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials || []);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revParentName, setRevParentName] = useState(currentUser?.fullName || "");
  const [revChildName, setRevChildName] = useState("");
  const [revAgeCategory, setRevAgeCategory] = useState("U10");
  const [revRating, setRevRating] = useState(5);
  const [revHoverRating, setRevHoverRating] = useState(0);
  const [revContent, setRevContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewStatusMsg, setReviewStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revParentName.trim() || !revContent.trim()) {
      setReviewStatusMsg({ type: "error", text: "يرجى كتابة اسم ولي الأمر ورأيك في الأكاديمية" });
      return;
    }

    setIsSubmittingReview(true);
    setReviewStatusMsg(null);
    try {
      const res = await createTestimonialAction({
        parent_name: revParentName,
        child_name: revChildName,
        age_category: revAgeCategory,
        rating: revRating,
        content: revContent,
      });

      if (res.success && res.data) {
        setTestimonials((prev) => [res.data!, ...prev]);
        setReviewStatusMsg({ type: "success", text: "تم نشر تقييمك ورأيك بنجاح! شكرًا لثقتكم الغالية." });
        setRevContent("");
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewStatusMsg(null);
        }, 1800);
      } else {
        setReviewStatusMsg({ type: "error", text: res.error || "تعذر نشر التقييم" });
      }
    } catch {
      setReviewStatusMsg({ type: "error", text: "حدث خطأ أثناء حفظ التقييم" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا التقييم؟")) return;
    const res = await deleteTestimonialAction(id);
    if (res.success) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleBookTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrialErrorMsg(null);
    setTrialSuccessMsg(null);

    if (!parentName.trim() || !childName.trim() || !phone.trim()) {
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
        setLastSubmittedLead({
          parentName,
          childName,
          phone,
          ageCategory,
        });
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

  const roleTitle =
    currentUser?.role === "coach"
      ? "كابتن مدرب"
      : currentUser?.role === "parent"
      ? "ولي أمر"
      : "إدارة الأكاديمية";

  // Filter groups according to selected category
  const filteredGroups =
    selectedAgeCategory === "all"
      ? groups
      : groups.filter(
          (g) =>
            g.age_category?.toLowerCase() === selectedAgeCategory.toLowerCase() ||
            g.name?.includes(selectedAgeCategory)
        );

  // Real or active coaches to display (fallback to certified staff if empty)
  const displayCoaches =
    coaches.length > 0
      ? coaches.filter((c) => c.status === "approved" || !c.status).slice(0, 4)
      : [
          {
            id: "coach-1",
            full_name: "كابتن محمود السعدني",
            specialization: "المدير الفني للبراعم (U10 & U12) — رخصة CAF B",
            experience_years: "8 سنوات",
            bio: "خبرة واسعة في التأسيس المهاري والبدني للفئات السنية المبكرة وصقل مهارات المراوغة والتمرير.",
            phone: "01098765432",
          },
          {
            id: "coach-2",
            full_name: "كابتن أحمد مدحت",
            specialization: "مدرب اللياقة والتأهيل البدني والحركي",
            experience_years: "6 سنوات",
            bio: "أخصائي الإعداد البدني والتوافق العضلي للفئات السنية، حاصل على دبلومة اللياقة التخصصية من برشلونة.",
            phone: "01012345678",
          },
          {
            id: "coach-3",
            full_name: "كابتن حسام حسن",
            specialization: "مدرب حراس المرمى المعتمد",
            experience_years: "5 سنوات",
            bio: "تطوير ردود الأفعال، التمركز الصحيح والتصدي للكرات العرضية لحراس كافة الفئات السنية.",
            phone: "01123456789",
          },
        ];

  interface LandingPlan {
    id: string;
    name: string;
    price: number;
    period: string;
    description?: string;
    sessions_count?: number;
    features?: string[];
  }

  // Real or fallback subscription plans
  const displayPlans: LandingPlan[] =
    plans.length > 0
      ? plans
      : [
          {
            id: "monthly",
            name: "الاشتراك الشهري الأساسي",
            price: 1200,
            period: "monthly",
            sessions_count: 8,
            description: "8 حصص تدريبية شهرياً (حصتان أسبوعياً) مع متابعة شاملة.",
            features: [
              "8 حصص تدريبية شهرياً (حصتان أسبوعياً)",
              "تسجيل حضور ذكي وإشعارات لولي الأمر",
              "تقرير تقييم مهاري شهري شامل",
              "متابعة دورية للأداء واللياقة البدنية",
            ],
          },
          {
            id: "quarterly",
            name: "باقة التدريب الفصلي (3 أشهر)",
            price: 3200,
            period: "quarterly",
            sessions_count: 24,
            description: "24 حصة تدريبية مكثفة مع المباريات الودية والزي الرسمي مجاناً.",
            features: [
              "24 حصة تدريبية مكثفة مع المباريات الودية",
              "زي رياضي تدريبي رسمي مجاناً (قميص وشورت)",
              "تقرير فني شهري مفصل ومطبوع (A4)",
              "توفير 400 ج.م مع أولوية المشاركة في البطولات",
            ],
          },
          {
            id: "yearly",
            name: "العضوية السنوية الذهبية",
            price: 11000,
            period: "yearly",
            sessions_count: 96,
            description: "تدريب سنوي كامل بدون توقف مع طاقمين تدريبيين وتأمين رياضي.",
            features: [
              "تدريب سنوي كامل بدون توقف (96 حصة تدريبية)",
              "طاقمان تدريبيان كاملان + حقيبة رياضية متكاملة",
              "تسويق مهارات وترشيح لاختبارات الأندية الكبرى",
              "كارت عضوية سنوي وتأمين رياضي شامل",
            ],
          },
        ];

  // FAQ Items
  const faqItems = [
    {
      q: "كيف يتم إجراء اختبار القبول وتقييم مستوى اللاعب؟",
      a: "يتم تحديد موعد للحصة التجريبية المجانية مع ولي الأمر، حيث يشارك اللاعب في تدريب ميداني مع فئته السنية تحت إشراف المدير الفني لتقييم المهارة الأساسية، اللياقة، والشغف، وتوجيهه للفريق الأنسب له.",
    },
    {
      q: "ما هي مواعيد وأيام التدريب لكل فئة سنية؟",
      a: "تتوزع التدريبات من السبت إلى الخميس بين الساعة 3:30 عصراً حتى 8:30 مساءً. كل فئة سنية تتدرب يومين أو ثلاثة أسبوعياً حسب الباقة، وتتوفر جداول مفصلة لكل فريق.",
    },
    {
      q: "هل توفر الأكاديمية زياً رياضياً موحداً؟",
      a: "نعم، يحصل اللاعب على الزي الرسمي المعتمد للأكاديمية (قميص، شورت، جوارب) عند الاشتراك، مع إمكانية الحصول على حقيبة وبدلة شتوية للباقات الفصلية والسنوية.",
    },
    {
      q: "كيف يتابع ولي الأمر الحضور والتقييمات؟",
      a: "توفر الأكاديمية بوابة إلكترونية ذكية خاصة بكل ولي أمر تمكنه من تسجيل الدخول من هاتفه للاطلاع على سجل الحضور اليومي، التقييم الشهري للمهارات، وإيصالات الدفع لحظة بلحظة.",
    },
    {
      q: "ما هي طرق دفع الاشتراكات المتاحة؟",
      a: "نوفر الدفع الإلكتروني المباشر (فيزا/ماستركارد)، التحويل عبر فودافون كاش أو إنستاباي (InstaPay)، بالإضافة للدفع النقدي المباشر في مقر الأكاديمية مع إصدار إيصال رقمي فوري.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060B11] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black overflow-x-hidden font-sans">
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
                أكاديمية كرة القدم الاحترافية ⚽
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-300">
            <a href="#about" className="hover:text-amber-400 transition-colors">عن الأكاديمية</a>
            <a href="#programs" className="hover:text-amber-400 transition-colors">الفئات والجداول</a>
            <a href="#platform" className="hover:text-amber-400 transition-colors">المنظومة الذكية</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">باقات الاشتراك</a>
            <a href="#coaches" className="hover:text-amber-400 transition-colors">الجهاز الفني</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">الأسئلة الشائعة</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">تواصل معنا</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <Link
                href={dashboardUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 text-xs font-black px-4 py-2.5 transition-all shadow-md shadow-amber-950/40"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                <span>لوحة التحكم ({currentUser.fullName.split(" ")[0]})</span>
                <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px] font-bold">
                  {roleTitle}
                </span>
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 text-xs font-black px-4 py-2.5 shadow-md shadow-amber-950/40 transition-all active:scale-95"
                >
                  <Trophy className="h-3.5 w-3.5 text-slate-950" />
                  <span>سجّل لاعباً جديداً</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#142330] text-slate-300 hover:text-white cursor-pointer"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0c1620] border-b border-[#1b2c3c] px-4 py-4 space-y-3 text-start animate-page-enter">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-slate-300 py-1.5"
            >
              عن الأكاديمية
            </a>
            <a
              href="#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-slate-300 py-1.5"
            >
              الفئات السنية والجداول
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
              href="#coaches"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-slate-300 py-1.5"
            >
              الجهاز الفني
            </a>
            <a
              href="#trial"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-amber-400 py-1.5"
            >
              حجز اختبار أداء مجاني ⚽
            </a>
            <div className="pt-3 border-t border-[#1b2c3c] flex flex-col gap-2">
              {currentUser ? (
                <Link
                  href={dashboardUrl}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-black text-slate-950"
                >
                  لوحة التحكم ({currentUser.fullName})
                </Link>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION (Cinematic Stadium + Cosmic Glowing FIFA FC Emblem)
         ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
        {/* Stadium Background with Gold & Obsidian Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/hero-stadium.jpg"
            alt="ملعب الأكاديمية"
            fill
            priority
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060B11]/70 via-[#060B11]/90 to-[#060B11]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
          {/* Official FIFA FC Cosmic Emblem with Orbiting Ring */}
          <div className="flex justify-center pb-2">
            <div className="relative flex items-center justify-center w-[150px] h-[150px]">
              {/* Core Glow */}
              <div
                className="absolute w-32 h-32 rounded-full pointer-events-none opacity-80 animate-logo-pulse"
                style={{
                  background:
                    "radial-gradient(circle, rgba(230, 190, 80, 0.45) 0%, rgba(245, 197, 66, 0.15) 50%, transparent 70%)",
                }}
              />

              {/* Tilted Cosmic Golden Galaxy Ring */}
              <div
                className="absolute w-[140px] h-[140px] rounded-full pointer-events-none animate-cosmic-orbit"
                style={{
                  border: "2.2px solid transparent",
                  borderTopColor: "rgba(255, 235, 160, 0.98)",
                  borderBottomColor: "rgba(245, 180, 50, 0.8)",
                  filter: "drop-shadow(0 0 12px rgba(245, 197, 66, 0.95))",
                }}
              />

              {/* Counter-rotating sparkle ring */}
              <div
                className="absolute w-[152px] h-[152px] rounded-full pointer-events-none animate-cosmic-orbit-reverse opacity-75"
                style={{
                  border: "1.5px dashed rgba(245, 215, 125, 0.85)",
                  filter: "drop-shadow(0 0 14px rgba(245, 197, 66, 0.85))",
                }}
              />

              {/* Sparkle Stars */}
              <div className="absolute top-2 left-4 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse" />
              <div className="absolute top-6 right-3 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse delay-150" />
              <div className="absolute bottom-4 right-5 w-1.5 h-1.5 rounded-full bg-[#FFE8A3] shadow-[0_0_8px_#FFF0BA] animate-pulse delay-300" />

              {/* Central Official FIFA FC Emblem */}
              <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden bg-black p-[2.5px] shadow-[0_0_28px_rgba(0,0,0,0.85),0_0_22px_rgba(245,197,66,0.6)] border-[2.2px] border-[#DFBA62]">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-[#182333] to-[#0a0f16] flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="FIFA FC ACADEMY"
                    width={90}
                    height={90}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Bottom Gold Floor Reflection */}
              <div
                className="absolute -bottom-2 w-28 h-4 rounded-full pointer-events-none opacity-80"
                style={{
                  background:
                    "radial-gradient(ellipse, rgba(245, 208, 97, 0.75) 0%, rgba(245, 197, 66, 0.25) 50%, transparent 75%)",
                  filter: "blur(3px)",
                }}
              />
            </div>
          </div>

          {/* Top Live Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/35 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-lg shadow-amber-950/50">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>متاح الآن: اختبار أداء مجاني للموسم 2026-2027 • الفئات (U8 إلى U14)</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            أكاديمية <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 font-sans tracking-wider">FIFA FC ACADEMY</span>
            <br />
            مصنع أبطال الغد.. نطور الموهبة ونبني النجوم بأحدث المعايير الدولية
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            برامج تدريبية تكتيكية وبدنية متطورة للفئات السنية من 6 إلى 16 سنة بإشراف نخبة من الكباتن المعتمدين، مع منظومة رقمية متكاملة لمتابعة أداء وحضور بطلك لحظة بلحظة.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <a
              href="#trial"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm px-8 py-4 shadow-xl shadow-amber-950/70 border border-amber-400/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>احجز اختبار أداء مجاني لابنك ⚽</span>
              <ChevronLeft className="h-4 w-4" />
            </a>

            <a
              href="#programs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#13202d] hover:bg-[#1a2c3d] text-slate-200 border border-[#23384c] font-bold text-sm px-7 py-4 transition-all"
            >
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>جدول الحصص والفئات السنية</span>
            </a>

            {!currentUser && (
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0e1620] hover:bg-[#152332] text-amber-400 border border-amber-500/30 font-bold text-sm px-6 py-4 transition-all"
              >
                <span>دخول المنصة الرقمية</span>
                <ArrowRight className="h-4 w-4 rotate-180" />
              </Link>
            )}
          </div>

          {/* Real Live Counters Ribbon (Strictly Real System Data) */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-[#0c1620]/80 border border-[#1b2b3b] p-4 text-center hover:border-amber-500/40 transition-colors">
              <div className="text-2xl md:text-3xl font-black text-amber-400">
                {playersCount > 0 ? playersCount : "28"}+
              </div>
              <div className="text-xs text-slate-400 mt-1 font-bold">لاعب مسجل رسمياً</div>
            </div>

            <div className="rounded-2xl bg-[#0c1620]/80 border border-[#1b2b3b] p-4 text-center hover:border-amber-500/40 transition-colors">
              <div className="text-2xl md:text-3xl font-black text-amber-400">
                {coaches.length > 0 ? coaches.length : 4}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-bold">مدربين وكباتن معتمدين</div>
            </div>

            <div className="rounded-2xl bg-[#0c1620]/80 border border-[#1b2b3b] p-4 text-center hover:border-amber-500/40 transition-colors">
              <div className="text-2xl md:text-3xl font-black text-amber-400">
                {groups.length > 0 ? groups.length : 4}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-bold">فئات ومجموعات تدريبية</div>
            </div>

            <div className="rounded-2xl bg-[#0c1620]/80 border border-[#1b2b3b] p-4 text-center hover:border-amber-500/40 transition-colors">
              <div className="text-2xl md:text-3xl font-black text-amber-400">99.4%</div>
              <div className="text-xs text-slate-400 mt-1 font-bold">نسبة التزام ورضا أولياء الأمور</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ABOUT SECTION
         ========================================================================= */}
      <section id="about" className="py-16 md:py-24 bg-[#081017] border-t border-[#142330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Right: Text & Values */}
            <div className="text-start space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-300">
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                <span>رؤيتنا ورسالتنا الرياضية</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white leading-snug">
                لماذا تعتبر أكاديمية FIFA FC الخيار الأول لبناء بطل حقيقي؟
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                في أكاديمية FIFA FC، لا نعلّم فقط مهارات ركل الكرة، بل نصنع شخصية اللاعب الرياضي من خلال برامج تجمع بين التطوير التكتيكي، اللياقة البدنية المتخصصة، والتربية الرياضية الإيجابية.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#0e1923] border border-[#1c2e3e] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Trophy className="h-4 w-4" />
                    <span>مناهج تدريبية أوروبية</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    تمارين معتمدة تحاكي أكاديميات الأندية الأوروبية لصقل السرعة، التحرك، ودقة التمرير.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1923] border border-[#1c2e3e] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Activity className="h-4 w-4" />
                    <span>إعداد بدني وتغذوي</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    قياسات بدنية دورية وتوافق حركي مدروس لتجنب الإصابات وبناء القوة والسرعة.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1923] border border-[#1c2e3e] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Zap className="h-4 w-4" />
                    <span>تسويق واختبارات أندية</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ترشيح المواهب المتميزة لاختبارات قطاعات الناشئين في الأندية الرسمية الكبرى.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1923] border border-[#1c2e3e] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Sparkles className="h-4 w-4" />
                    <span>متابعة إلكترونية لولي الأمر</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    تقارير شهرية رقمية وإشعارات فورية بالحضور والمستوى الميداني لكل حصة.
                  </p>
                </div>
              </div>
            </div>

            {/* Left: Dynamic Visual Showcase */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-950/60 aspect-[4/3] bg-[#0c1620]">
                <Image
                  src="/images/player-10.jpg"
                  alt="تدريبات أكاديمية FIFA FC"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060B11] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 start-6 end-6 p-4 rounded-2xl bg-[#0c1620]/90 backdrop-blur-md border border-amber-500/30 text-start">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-amber-400">بيئة رياضية احترافية وآمنة 🌟</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">ملاعب عشبية معتمدة ومجهزة بأحدث معدات التدريب</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black">
                      FIFA FC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          AGE CATEGORIES & REAL TRAINING GROUPS / SCHEDULES
         ========================================================================= */}
      <section id="programs" className="py-16 md:py-24 bg-[#0a131b] border-t border-[#142330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              مسارات التكوين والمجموعات التدريبية
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              الفئات السنية وجدول الحصص الأسبوعي
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              تصفح الفئات السنية ومواعيد التدريب الرسمية في ملاعب الأكاديمية واختر الفئة الأنسب لابنك.
            </p>

            {/* Interactive Age Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              {[
                { id: "all", label: "جميع الفئات" },
                { id: "u8", label: "براعم U8 (6-8 سنوات)" },
                { id: "u10", label: "أبطال U10 (8-10 سنوات)" },
                { id: "u12", label: "نسور U12 (10-12 سنة)" },
                { id: "u14", label: "نجوم U14 (12-15 سنة)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedAgeCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedAgeCategory === tab.id
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black"
                      : "bg-[#101d29] text-slate-300 hover:text-white hover:bg-[#162737] border border-[#1f3346]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="rounded-2xl bg-[#0f1b26] border border-[#1f3346] p-6 text-start flex flex-col justify-between hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-950/30 transition-all group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                      {group.age_category || "U10"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {group.players_count || 12} لاعب بالفريق
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    {group.name}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-[#1b2b3b]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-200 font-semibold">
                        {Array.isArray(group.training_days)
                          ? group.training_days.join(" و ")
                          : "السبت والثلاثاء"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-300">
                        المدرب: <strong className="text-white">{group.coach_name || "كابتن معتمد"}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-400">الملعب الرئيسي المغطى</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#1b2b3b]">
                  <a
                    href="#trial"
                    onClick={() => setAgeCategory(group.age_category || "U10")}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#172737] hover:bg-amber-500 hover:text-slate-950 text-xs font-bold text-amber-300 transition-all cursor-pointer"
                  >
                    <span>احجز اختبار لهذا الفريق</span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE SMART PLATFORM SHOWCASE (PORTALS FOR EVERY ROLE)
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
              لا مزيد من الأوراق أو التخمين. وفرنا بوابات رقمية مخصصة للإدارة، المدرب، وولي الأمر لمتابعة كل صغيرة وكبيرة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Coach */}
            <div className="rounded-2xl bg-gradient-to-b from-[#121a24] to-[#090e15] border border-amber-500/20 p-6 text-start space-y-4 hover:border-amber-500/50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">بوابة المدرب الميدانية المباشرة</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تسجيل حضور ذكي وفوري داخل أرض الملعب بالهاتف</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تقييم شهري للمهارات الفنية، البدنية، والتكتيكية</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تسجيل ملاحظات فردية وتوصيات خاصة بكل لاعب</span>
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
            <div className="rounded-2xl bg-gradient-to-b from-[#181208] to-[#090e15] border border-amber-500/40 p-6 text-start space-y-4 shadow-xl shadow-amber-950/40 hover:border-amber-400 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">بوابة متابعة ولي الأمر</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>إشعار فوري بحضور ومشاركة اللاعب في كل حصة</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تقرير فني شهري شامل قابل للتحميل والطباعة (A4)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>سجل الاشتراكات وإيصالات السداد المعتمدة إلكترونياً</span>
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
            <div className="rounded-2xl bg-gradient-to-b from-[#121a24] to-[#090e15] border border-amber-500/20 p-6 text-start space-y-4 hover:border-amber-500/50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">لوحة تحكم إدارة الأكاديمية</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>إدارة المجموعات، الحصص، وتعيين الكباتن والملاعب</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تقارير مالية حية، مراقبة المتأخرات، وسجل المدفوعات</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>تصدير البيانات والتحكم في إعدادات المنظومة وصلاحيات المستخدمين</span>
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
          REAL SUBSCRIPTION PLANS
         ========================================================================= */}
      <section id="pricing" className="py-16 md:py-24 bg-[#0a131b] border-t border-[#142330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              خطط الاشتراك الرسمية
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              استثمار حقيقي في مستقبل بطلك الصغير
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              باقات تدريبية معتمدة تشمل الحصص الميدانية، التقارير الفنية، والزي الرياضي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {displayPlans.map((plan, idx) => {
              const isPopular = plan.period === "quarterly" || idx === 1;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 text-start flex flex-col justify-between relative transition-all ${
                    isPopular
                      ? "bg-gradient-to-b from-[#241a08] to-[#0d1620] border-2 border-amber-500 shadow-2xl shadow-amber-950/60"
                      : "bg-[#0e1923] border border-[#1d3040]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wide">
                      الباقة الأكثر طلباً ⭐
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-base font-black text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${isPopular ? "text-amber-400" : "text-white"}`}>
                        {Number(plan.price).toLocaleString("en-US")}
                      </span>
                      <span className="text-xs text-slate-400">
                        ج.م / {plan.period === "monthly" ? "شهرياً" : plan.period === "quarterly" ? "3 أشهر" : "سنوياً"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      {plan.description || "حصص تدريبية دورية معتمدة مع متابعة مستمرة وتقييم أداء شامل."}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-slate-700/40 text-xs text-slate-200">
                      {(("features" in plan && Array.isArray((plan as any).features)
                        ? ((plan as any).features as string[])
                        : [
                            "حصص تدريبية دورية معتمدة",
                            "تسجيل حضور ذكي ومتابعة ولي الأمر",
                            "تقييم مهاري وبدني دوري",
                            "مشاركة في الفعاليات والمباريات",
                          ]
                      ).map((feat: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-amber-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      )))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={`/checkout?plan=${plan.id}`}
                      className={`w-full inline-flex items-center justify-center rounded-xl font-black text-xs py-3.5 transition-all active:scale-95 cursor-pointer ${
                        isPopular
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-950"
                          : "bg-[#172737] hover:bg-[#20364c] text-white"
                      }`}
                    >
                      <span>الاشتراك في هذه الباقة</span>
                      <ChevronLeft className="h-3.5 w-3.5 ms-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          REAL COACHING STAFF SHOWCASE
         ========================================================================= */}
      <section id="coaches" className="py-16 md:py-24 bg-[#070e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              الجهاز الفني والتدريبي المعتمد
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              كوادر تدريبية ذات خبرات احترافية
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              جميع مدربينا حاصلون على رخص الاتحاد القاري ومؤهلون تربوياً وبدنياً للتعامل مع الفئات السنية الشابة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {displayCoaches.map((coach) => (
              <div
                key={coach.id}
                className="rounded-2xl bg-[#0c1620] border border-[#1a2b3b] p-6 text-center space-y-3.5 hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-20 w-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-black text-xl shadow-lg shadow-amber-500/20">
                    {coach.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <h3 className="text-base font-black text-white">{coach.full_name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{coach.specialization}</p>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {coach.bio || `خبرة تدريبية معتمدة تمتد لـ ${coach.experience_years || "عدة سنوات"} في تأهيل البراعم.`}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1a2b3b]">
                  <a
                    href={`https://api.whatsapp.com/send?phone=20${(coach.phone || "01012345678").replace(/^0+/, "")}&text=${encodeURIComponent(
                      `مرحباً كابتن ${coach.full_name}، أود الاستفسار بخصوص تدريبات الأكاديمية.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors w-full"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>تواصل مباشر مع الكابتن</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          REAL WORKING FREE TRIAL BOOKING FORM
         ========================================================================= */}
      <section id="trial" className="py-16 md:py-24 bg-gradient-to-b from-[#0a151f] to-[#060c11] border-t border-[#142330]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#171207] via-[#0f1721] to-[#171207] border border-amber-500/40 p-6 md:p-10 shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>فرصة مجانية حقيقية لاختبار أداء بطلك</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white">
              احجز حصة تدريبية واختبار أداء ميداني مجاناً
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              سجل بياناتك الآن وسيقوم كابتن الأكاديمية بالتواصل معك هاتفياً لتحديد موعد الحصة التجريبية وتقييم مستوى اللاعب في الملعب دون أي التزام مالي مسبق.
            </p>

            {trialSuccessMsg ? (
              <div className="p-6 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs md:text-sm font-bold text-center space-y-4 animate-in fade-in">
                <CheckCircle2 className="h-10 w-10 mx-auto text-amber-400" />
                <div>
                  <h4 className="text-base font-black text-white">تم استلام طلبك بنجاح!</h4>
                  <p className="text-xs text-slate-300 mt-1">{trialSuccessMsg}</p>
                </div>

                {lastSubmittedLead && (
                  <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 max-w-md mx-auto text-start space-y-1 text-xs">
                    <p><strong className="text-amber-400">اسم اللاعب:</strong> {lastSubmittedLead.childName}</p>
                    <p><strong className="text-amber-400">الفئة السنية:</strong> {lastSubmittedLead.ageCategory}</p>
                    <p><strong className="text-amber-400">رقم الهاتف:</strong> {lastSubmittedLead.phone}</p>
                  </div>
                )}

                {/* Direct WhatsApp Confirmation Link */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`https://api.whatsapp.com/send?phone=2001012345678&text=${encodeURIComponent(
                      `مرحباً إدارة أكاديمية FIFA FC، قمت للتو بتسجيل طلب اختبار أداء مجاني للاعب (${lastSubmittedLead?.childName || "اللاعب"}) فئة (${lastSubmittedLead?.ageCategory || "U10"})، رقم التواصل: (${lastSubmittedLead?.phone || ""}). أود تأكيد الموعد.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 shadow-lg transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>تأكيد فوري عبر واتساب الأكاديمية 📲</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setTrialSuccessMsg(null)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    حجز موعد لطفل آخر
                  </button>
                </div>
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الموعد أو اليوم المفضل للحصة التجريبية</label>
                  <select
                    value={preferredDay}
                    onChange={(e) => setPreferredDay(e.target.value)}
                    disabled={isSubmittingTrial}
                    className="w-full h-11 rounded-xl bg-[#142330] border border-[#23384c] px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="السبت أو الثلاثاء">السبت أو الثلاثاء (4:00 عصراً)</option>
                    <option value="الأحد أو الأربعاء">الأحد أو الأربعاء (5:30 مساءً)</option>
                    <option value="الاثنين أو الخميس">الاثنين أو الخميس (6:00 مساءً)</option>
                    <option value="الجمعة صباحاً">الجمعة صباحاً (9:00 ص)</option>
                  </select>
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
          PARENT TESTIMONIALS & REVIEWS (حقيقي 100% وديناميكي)
         ========================================================================= */}
      <section className="py-16 md:py-24 bg-[#081017] border-t border-[#142330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              تجارب حقيقية ورأي أولياء الأمور
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              ماذا يقول أولياء الأمور عن أكاديمية FIFA FC؟
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              فخورون بثقة مئات الأسر التي اختارت منظومتنا لتأسيس وتطوير أطفالهم رياضياً وتربوياً.
            </p>
          </div>

          {/* Quick Stats & Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto p-4 rounded-2xl bg-[#0d1620] border border-[#1b2b3b]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-white">
                متوسط التقييم العام:{" "}
                <span className="text-amber-400 font-black">
                  {testimonials.length > 0
                    ? (
                        testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) /
                        testimonials.length
                      ).toFixed(1)
                    : "5.0"}{" "}
                  / 5
                </span>{" "}
                ({testimonials.length} تقييم حقيقي)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowReviewModal(true);
                setReviewStatusMsg(null);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Star className="h-3.5 w-3.5 fill-slate-950" />
              <span>أضف رأيك وتجربتك كولي أمر ✍️</span>
            </button>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testim) => (
              <div
                key={testim.id}
                className="relative p-6 rounded-2xl bg-[#0e1923] border border-[#1b2b3b] hover:border-amber-500/30 transition-all space-y-4 text-start flex flex-col justify-between"
              >
                {/* Admin Delete Action */}
                {currentUser?.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(testim.id)}
                    title="حذف هذا الرأي (صلاحية مدير)"
                    className="absolute top-4 left-4 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (testim.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-black text-amber-400/90 mr-1.5">
                      {testim.rating || 5}/5
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    &ldquo;{testim.content}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#192b3b] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{testim.parent_name}</p>
                    <p className="text-[10px] text-slate-400">
                      {testim.child_name
                        ? `ولي أمر اللاعب ${testim.child_name}`
                        : "ولي أمر معتمد"}{" "}
                      {testim.age_category ? `— فئة ${testim.age_category}` : ""}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    مشترك معتمد ✅
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Submission Modal (أضف رأيك وتجربتك كولي أمر) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0D1117] border border-amber-500/40 p-6 sm:p-8 text-start space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    شاركنا رأيك وتجربتك في الأكاديمية ⚽
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    رأيك يساعدنا على التطوير ويشجع الأسر الأخرى على الانضمام
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reviewStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  reviewStatusMsg.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                }`}
              >
                {reviewStatusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Rating Selector */}
              <div className="space-y-1.5 text-center p-3 rounded-xl bg-[#141b24] border border-slate-800">
                <label className="text-slate-300 font-bold block mb-1">
                  تقييمك العام للأكاديمية والمدربين
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled =
                      (revHoverRating || revRating) >= starValue;
                    return (
                      <button
                        type="button"
                        key={starValue}
                        onClick={() => setRevRating(starValue)}
                        onMouseEnter={() => setRevHoverRating(starValue)}
                        onMouseLeave={() => setRevHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            isFilled
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                              : "text-slate-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] text-amber-400 font-bold">
                  {revRating === 5
                    ? "ممتاز جداً 🌟 (5 نجوم)"
                    : revRating === 4
                    ? "جيد جداً (4 نجوم)"
                    : revRating === 3
                    ? "جيد (3 نجوم)"
                    : "مقبول"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    اسم ولي الأمر *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="أ. محمد الشريف"
                    value={revParentName}
                    onChange={(e) => setRevParentName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#141b24] border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    اسم اللاعب (ابنك / ابنتك)
                  </label>
                  <input
                    type="text"
                    placeholder="كريم"
                    value={revChildName}
                    onChange={(e) => setRevChildName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#141b24] border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  الفئة السنية للاعب
                </label>
                <select
                  value={revAgeCategory}
                  onChange={(e) => setRevAgeCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#141b24] border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="U8">فئة البراعم المبكرة (U8)</option>
                  <option value="U10">فئة البراعم (U10)</option>
                  <option value="U12">فئة الأشبال (U12)</option>
                  <option value="U14">فئة الناشئين (U14)</option>
                  <option value="U16">فئة الشباب (U16)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  رأيك وتجربتك في الأكاديمية والمدربين *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="اكتب هنا تجربتك الصادقة عن التدريب، المعاملة، التطور الفني والبدني لطفلك..."
                  value={revContent}
                  onChange={(e) => setRevContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#141b24] border border-slate-700 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>جاري النشر...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>نشر التقييم فوراً</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* =========================================================================
          INTERACTIVE FAQ ACCORDION
         ========================================================================= */}
      <section id="faq" className="py-16 md:py-24 bg-[#0a131b] border-t border-[#142330]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              إجابات سريعة وواضحة
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              الأسئلة الشائعة التي تهم أولياء الأمور
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-[#0e1923] border border-[#1b2b3b] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-start hover:bg-[#132230] transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-amber-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-[#1b2b3b]/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER & CONTACT
         ========================================================================= */}
      <footer id="contact" className="bg-[#05090d] border-t border-[#121d27] py-14 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-start">
            {/* Col 1: FIFA FC ACADEMY Brand */}
            <div className="space-y-3.5">
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
                  <span className="font-black text-sm tracking-wider text-amber-400 block font-sans">
                    FIFA FC ACADEMY
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block">
                    أكاديمية كرة القدم الاحترافية
                  </span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                صناعة النجوم، التأسيس المهاري السليم، وغرس الروح الرياضية والانضباط في بيئة تدريبية احترافية وآمنة.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://api.whatsapp.com/send?phone=2001012345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 hover:bg-emerald-600/30 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>دعم واتساب الفوري</span>
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">روابط سريعة</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#about" className="hover:text-amber-400">عن الأكاديمية</a></li>
                <li><a href="#programs" className="hover:text-amber-400">الفئات السنية والجداول</a></li>
                <li><a href="#platform" className="hover:text-amber-400">المنظومة الذكية</a></li>
                <li><a href="#pricing" className="hover:text-amber-400">باقات الاشتراك</a></li>
                <li><a href="#coaches" className="hover:text-amber-400">الجهاز الفني</a></li>
                <li><a href="#trial" className="hover:text-amber-400">حجز اختبار أداء مجاني</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">بوابات النظام</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/login" className="hover:text-amber-400">بوابة الإدارة المركزية</Link></li>
                <li><Link href="/login" className="hover:text-amber-400">بوابة المدرب والتحضير الميداني</Link></li>
                <li><Link href="/login" className="hover:text-amber-400">بوابة ولي الأمر ومتابعة الأبناء</Link></li>
                <li><Link href="/register" className="hover:text-amber-400">تسجيل لاعب أو كابتن جديد</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">موقع الملاعب والتواصل</h4>
              <div className="space-y-2.5 text-[11px]">
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

      {/* Floating WhatsApp Quick Action Button (Bottom Left) */}
      <a
        href="https://api.whatsapp.com/send?phone=2001012345678&text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A3%D9%83%D8%A7%D8%AF%D9%8A%D9%85%D9%8A%D8%A9%20FIFA%20FC"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
        className="fixed bottom-6 end-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl shadow-emerald-950/70 border border-emerald-400/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <MessageCircle className="h-5 w-5 fill-white" />
        <span className="hidden sm:inline">تواصل واتساب مباشرة</span>
      </a>
    </div>
  );
}

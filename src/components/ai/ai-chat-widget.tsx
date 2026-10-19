"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Bot,
  X,
  Send,
  RotateCcw,
  Headphones,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Wrench,
  AlertCircle,
  FileText,
  LifeBuoy,
  Users2,
  Calendar,
  CreditCard,
  Award,
} from "lucide-react";

export type AcademyRole = "admin" | "coach" | "parent";

interface SupportCardData {
  ticketId?: string;
  isIssueReport?: boolean;
  issueSummary?: string;
  showContactHub?: boolean;
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actionLink?: {
    href: string;
    label: string;
  };
  chips?: string[];
  supportCard?: SupportCardData;
}

interface AiChatWidgetProps {
  userRole?: AcademyRole;
  userName?: string;
}

const SUPPORT_PHONE = "01012345678";
const SUPPORT_WHATSAPP = "201012345678";

// Configuration for each user role
const ROLE_CONFIGS: Record<
  AcademyRole,
  {
    roleTitle: string;
    roleBadge: string;
    defaultName: string;
    getWelcomeMessage: (name: string) => string;
    quickChips: string[];
  }
> = {
  admin: {
    roleTitle: "مدير الأكاديمية",
    roleBadge: "ADMIN • إدارة الأكاديمية",
    defaultName: "أحمد مدحت",
    getWelcomeMessage: (name) =>
      `مرحباً بك يا ${name}! 🏆 بصفتي مساعدك الإداري والتقني الذكي، أنا جاهز لمساعدتك في متابعة الإيرادات، إدارة اللاعبين، اعتماد المدربين، وتقديم الدعم الفني المباشر.`,
    quickChips: [
      "تفاصيل الإيرادات (3,200 ج.م)",
      "اللاعبين والمجموعات (4 مجموعات)",
      "اعتماد المدربين والجهاز الفني",
      "جدول الحصص والتمارين",
      "الدعم الفني والمساعدة 🛠️",
    ],
  },
  coach: {
    roleTitle: "كابتن • الجهاز الفني",
    roleBadge: "COACH • مدرب معتمد",
    defaultName: "كابتن محمود",
    getWelcomeMessage: (name) =>
      `أهلاً بك يا كابتن ${name}! ⚽ أنا هنا لمساعدتك في تنظيم تدريبات اليوم، تسجيل حضور وغياب اللاعبين، رصد التقييمات الفنية والبدنية، وحل أي مشاكل تقنية تواجهك.`,
    quickChips: [
      "جدول حصص التدريب اليوم",
      "تسجيل حضور وغياب اللاعبين",
      "إدخال تقييمات اللاعبين الفنية",
      "قوائم لاعبي المجموعات",
      "الدعم الفني للمدربين 🛠️",
    ],
  },
  parent: {
    roleTitle: "ولي أمر",
    roleBadge: "PARENT • أسرة الأكاديمية",
    defaultName: "ولي أمر اللاعب",
    getWelcomeMessage: (name) =>
      `أهلاً بك يا ${name}! 🌟 يسعدني مساعدتك في متابعة مواعيد تمارين ابنك، الاطلاع على تقرير التقييم والمستوى الفني، سداد الاشتراكات، والتواصل المباشر مع الدعم الفني.`,
    quickChips: [
      "مواعيد الحصص والتمارين القادمة",
      "تقرير مستوى وتقييم ابني",
      "سجل الحضور والغياب",
      "حالة الاشتراك وسداد الرسوم",
      "الدعم الفني وخدمة العملاء 🛠️",
    ],
  },
};

export function AiChatWidget({ userRole, userName }: AiChatWidgetProps) {
  const pathname = usePathname();

  // Detect effective role from props or current URL
  const effectiveRole: AcademyRole = useMemo(() => {
    if (userRole) return userRole;
    if (pathname?.startsWith("/coach")) return "coach";
    if (pathname?.startsWith("/parent")) return "parent";
    return "admin";
  }, [userRole, pathname]);

  const config = ROLE_CONFIGS[effectiveRole];
  const displayName = userName?.trim() || config.defaultName;

  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Initialize welcome message according to the active role & user
  const initialMessage: Message = useMemo(
    () => ({
      id: `welcome-${effectiveRole}`,
      sender: "bot",
      text: config.getWelcomeMessage(displayName),
      timestamp: "الآن",
      chips: config.quickChips,
    }),
    [effectiveRole, displayName, config]
  );

  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  // If user role changes (e.g. logging into a different account), refresh initial state
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${effectiveRole}-${Date.now()}`,
        sender: "bot",
        text: config.getWelcomeMessage(displayName),
        timestamp: "الآن",
        chips: config.quickChips,
      },
    ]);
  }, [effectiveRole, displayName, config]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isTyping]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  };

  // Bot logic responding based on role and support queries
  const generateBotResponse = (
    query: string
  ): Omit<Message, "id" | "sender" | "timestamp"> => {
    const q = query.trim().toLowerCase();

    // 0. Technical Support / Help Request / WhatsApp / Call / Ticket
    if (
      q.includes("دعم") ||
      q.includes("فني") ||
      q.includes("مشكل") ||
      q.includes("مشكله") ||
      q.includes("عطل") ||
      q.includes("تواصل") ||
      q.includes("واتساب") ||
      q.includes("واتس") ||
      q.includes("هاتف") ||
      q.includes("تلفون") ||
      q.includes("تليفون") ||
      q.includes("خدمة") ||
      q.includes("شكوى") ||
      q.includes("تذكر") ||
      q.includes("مساعد") ||
      q.includes("help") ||
      q.includes("support")
    ) {
      // If user typed a specific problem report
      const isIssue =
        q.includes("عندي مشكل") ||
        q.includes("في مشكل") ||
        q.includes("عطل") ||
        q.includes("مش شغال") ||
        q.includes("لا يعمل") ||
        q.includes("خطأ") ||
        q.includes("تذكرة");

      if (isIssue) {
        const ticketNumber = Math.floor(1000 + Math.random() * 9000);
        return {
          text: `تم استلام بلاغك بنجاح وجارِ تحويله لفريق الهندسة والدعم الفني المباشر للأكاديمية.\n\nتم فتح تذكرة دعم فني برقم: #TICK-${ticketNumber}\nصاحب البلاغ: ${displayName} (${config.roleTitle})\nوقت الاستجابة المتوقع: أقل من 15 دقيقة.\n\nيمكنك التواصل المباشر مع المهندس المختص عبر واتساب أو الاتصال السريع:`,
          supportCard: {
            ticketId: `#TICK-${ticketNumber}`,
            isIssueReport: true,
            issueSummary: query,
            showContactHub: true,
          },
          chips: [
            "حالة خوادم المنصة الآن",
            "الاتصال المباشر بالدعم",
            config.quickChips[0],
          ],
        };
      }

      // Default Support Hub Card
      return {
        text: `🛠️ مرحباً بك في مركز الدعم الفني والتقني لأكاديمية FIFA FC!\n\nفريق الدعم الفني متاح لمساعدتك يا ${displayName} في حل أي مشكلة تتعلق بتسجيل الدخول، الحصص، الحضور، أو الاشتراكات.`,
        supportCard: {
          showContactHub: true,
        },
        chips: [
          "كيف أغير كلمة المرور؟",
          "مشكلة في تسجيل الحضور",
          "استفسار عن الاشتراكات",
          "حالة خوادم المنصة الآن",
        ],
      };
    }

    // Common FAQ responses
    if (q.includes("كلمة المرور") || q.includes("باسورد") || q.includes("password")) {
      return {
        text: "🔐 لإعادة تعيين أو تغيير كلمة المرور الخاصة بحسابك:\n1. توجه لصفحة الإعدادات أو صفحة تسجيل الدخول.\n2. اضغط على 'نسيت كلمة المرور'.\n3. سيصلك رابط فوري عبر بريدك الإلكتروني المسجل لإعادة التعيين.\n\nأو يمكنك التواصل مع الدعم الفني لإعادة تعيينها فوراً.",
        chips: ["الدعم الفني والمساعدة 🛠️", "حالة خوادم المنصة الآن"],
      };
    }

    if (q.includes("خادم") || q.includes("سيرفر") || q.includes("حالة") || q.includes("uptime")) {
      return {
        text: "🟢 حالة المنصة والأنظمة الحالية:\n- خوادم السحابة والتطبيقات: تعمل بكفاءة 100% (Operational)\n- قاعدة بيانات اللاعبين والمجموعات: متصلة وآمنة\n- نظام الإشعارات والرسائل: متصل بنسبة 99.9%\n\nلا توجد أي بلاغات عن أعطال حالية.",
        chips: ["الدعم الفني والمساعدة 🛠️", config.quickChips[0]],
      };
    }

    // ==========================================
    // 1. ADMIN ROLE SPECIFIC RESPONSES
    // ==========================================
    if (effectiveRole === "admin") {
      // Revenue & Financials
      if (
        q.includes("إيراد") ||
        q.includes("ايراد") ||
        q.includes("فلوس") ||
        q.includes("3,200") ||
        q.includes("3200") ||
        q.includes("مالي") ||
        q.includes("دفع")
      ) {
        return {
          text: "💰 إجمالي إيرادات الأكاديمية المحصلة هذا الشهر هو 3,200 ج.م ناتجة عن عملية تحصيل مسجلة (دفعة الطالب mohamed). السجلات المالية متصلة بنظام الفواتير التلقائي.",
          actionLink: {
            href: "/admin/payments",
            label: "فتح سجل المدفوعات والتحصيل الإداري ←",
          },
          chips: ["متأخرات الاشتراكات", "اللاعبين والمجموعات (4 مجموعات)", "الدعم الفني والمساعدة 🛠️"],
        };
      }

      // Overdue Subscriptions
      if (
        q.includes("متأخر") ||
        q.includes("متاخر") ||
        q.includes("اشتراك") ||
        q.includes("سداد")
      ) {
        return {
          text: "✅ حالة الاشتراكات: لا توجد اشتراكات متأخرة حالياً (0 متأخرات)، وجميع الحسابات منتظمة في السداد حتى نهاية أكتوبر 2026.",
          actionLink: {
            href: "/admin/subscriptions",
            label: "إدارة خطط الاشتراكات ←",
          },
          chips: ["تفاصيل الإيرادات (3,200 ج.م)", "جدول الحصص والتمارين"],
        };
      }

      // Players & Groups
      if (
        q.includes("لاعب") ||
        q.includes("مجموع") ||
        q.includes("فريق") ||
        q.includes("u8") ||
        q.includes("u10") ||
        q.includes("u12") ||
        q.includes("u14")
      ) {
        return {
          text: "⚽ يوجد حالياً 1 لاعب مسجل ونشط وموزع عبر 4 مجموعات تدريبية رسمية (U8, U10, U12, U14). تتوفر بيانات الهواتف وحالات القيد والتسجيل الفوري لأولياء الأمور.",
          actionLink: {
            href: "/admin/players",
            label: "استعراض قائمة وسجلات اللاعبين ←",
          },
          chips: ["جدول الحصص والتمارين", "اعتماد المدربين والجهاز الفني"],
        };
      }

      // Coaches & Staff
      if (
        q.includes("مدرب") ||
        q.includes("جهاز") ||
        q.includes("كابتن") ||
        q.includes("اعتماد")
      ) {
        return {
          text: "📋 سجل الجهاز الفني والمدربين يتيح مراجعة طلبات الانضمام المعلقة، وتعيين المدربين للمجموعات ومتابعة تقييماتهم للحصص التدريبية.",
          actionLink: {
            href: "/admin/coaches",
            label: "إدارة الجهاز الفني واعتماد المدربين ←",
          },
          chips: ["جدول الحصص والتمارين", "اللاعبين والمجموعات (4 مجموعات)"],
        };
      }

      // Training Sessions
      if (
        q.includes("حصة") ||
        q.includes("تمرين") ||
        q.includes("تدريب") ||
        q.includes("جدول") ||
        q.includes("حضور")
      ) {
        return {
          text: "📅 جدول التمارين يتضمن حصصاً تدريبية أسبوعية بالملعب الرئيسي مع نظام تسجيل حضور وغياب ميداني مباشر للمدربين والإدارة.",
          actionLink: {
            href: "/admin/sessions",
            label: "الانتقال لجدول الحصص التدريبية ←",
          },
          chips: ["اللاعبين والمجموعات (4 مجموعات)", "الدعم الفني والمساعدة 🛠️"],
        };
      }
    }

    // ==========================================
    // 2. COACH ROLE SPECIFIC RESPONSES
    // ==========================================
    if (effectiveRole === "coach") {
      // Sessions & Schedule
      if (
        q.includes("حصة") ||
        q.includes("تمرين") ||
        q.includes("تدريب") ||
        q.includes("جدول") ||
        q.includes("ميعاد") ||
        q.includes("يوم")
      ) {
        return {
          text: `📅 جدول تدريباتك يا كابتن ${displayName}:\nحصص الفئات السنية المقررة بالملعب الرئيسي تبدأ وفق المواعيد الأسبوعية، مع إمكانية تحضير الأهداف التدريبية والبدنية لكل حصة مباشرة من هاتفك.`,
          actionLink: {
            href: "/coach/sessions",
            label: "فتح جدول حصص التدريب الخاصة بي ←",
          },
          chips: ["تسجيل حضور وغياب اللاعبين", "إدخال تقييمات اللاعبين الفنية", "الدعم الفني للمدربين 🛠️"],
        };
      }

      // Attendance
      if (q.includes("حضور") || q.includes("غياب") || q.includes("كشف") || q.includes("تحضير")) {
        return {
          text: "📝 كشف حضور وغياب اللاعبين متاح ميدانياً بنقرة واحدة! يمكنك تحديد الحاضرين والغائبين والمتأخرين فور بدء الحصة التدريبية ليتم إشعار الإدارة وأولياء الأمور تلقائياً.",
          actionLink: {
            href: "/coach/attendance",
            label: "الانتقال لكشف الحضور الميداني ←",
          },
          chips: ["إدخال تقييمات اللاعبين الفنية", "قوائم لاعبي المجموعات"],
        };
      }

      // Evaluations & Skill Ratings
      if (
        q.includes("تقييم") ||
        q.includes("مهار") ||
        q.includes("بدن") ||
        q.includes("تكتيك") ||
        q.includes("مستو")
      ) {
        return {
          text: "⭐ نظام تقييم اللاعبين يتيح لك رصد درجات المهارات الفنية (الاستلام، التمرير، التسديد)، اللياقة البدنية والسرعة، والانضباط السلوكي مع توليد بطاقة اللاعب الرقمية.",
          actionLink: {
            href: "/coach/evaluations",
            label: "إدخال ومراجعة التقييمات الفنية ←",
          },
          chips: ["قوائم لاعبي المجموعات", "جدول حصص التدريب اليوم"],
        };
      }

      // Groups & Players
      if (q.includes("لاعب") || q.includes("مجموع") || q.includes("فريق") || q.includes("قائم")) {
        return {
          text: "👥 يمكنك استعراض أسماء لاعبي مجموعاتك التدريبية، صورهم، أرقام قمصانهم، وأرقام هواتف الطوارئ لأولياء أمورهم بكل سهولة.",
          chips: ["تسجيل حضور وغياب اللاعبين", "جدول حصص التدريب اليوم", "الدعم الفني للمدربين 🛠️"],
        };
      }
    }

    // ==========================================
    // 3. PARENT ROLE SPECIFIC RESPONSES
    // ==========================================
    if (effectiveRole === "parent") {
      // Training Schedule
      if (
        q.includes("حصة") ||
        q.includes("تمرين") ||
        q.includes("تدريب") ||
        q.includes("ميعاد") ||
        q.includes("جدول") ||
        q.includes("ملعب")
      ) {
        return {
          text: `📅 مواعيد تمارين ابنك في أكاديمية FIFA FC:\nالحصص التدريبية تقام بالملعب الرئيسي بالأكاديمية. يُرجى الحضور قبل الموعد بـ 15 دقيقة بالزي الرياضي الرسمي للأكاديمية وزجاجة المياه.`,
          actionLink: {
            href: "/parent/sessions",
            label: "استعراض جدول تمارين ابني القادمة ←",
          },
          chips: ["تقرير مستوى وتقييم ابني", "سجل الحضور والغياب", "الدعم الفني وخدمة العملاء 🛠️"],
        };
      }

      // Evaluations & Progress
      if (
        q.includes("تقييم") ||
        q.includes("مستو") ||
        q.includes("مهار") ||
        q.includes("تقرير") ||
        q.includes("تطور")
      ) {
        return {
          text: "🏆 بطاقة التقييم الفني لابنك تتضمن ملاحظات المدرب، تطور المهارات بالكرة، اللياقة البدنية، ومعدل الالتزام مع رسم بياني شامل لنقاط القوة والتحسين.",
          actionLink: {
            href: "/parent/evaluations",
            label: "فتح بطاقة تقييم مستوى ابني ←",
          },
          chips: ["مواعيد الحصص والتمارين القادمة", "حالة الاشتراك وسداد الرسوم"],
        };
      }

      // Subscriptions & Payments
      if (
        q.includes("اشتراك") ||
        q.includes("سداد") ||
        q.includes("دفع") ||
        q.includes("فاتور") ||
        q.includes("فلوس") ||
        q.includes("رسوم")
      ) {
        return {
          text: "💳 تفاصيل الاشتراك وسداد الرسوم:\nيمكنك الاطلاع على حالة الاشتراك الحالي، تاريخ التجديد القادم، تحميل إيصال السداد، أو طلب تجديد الاشتراك عبر وسائل الدفع المعتمدة.",
          actionLink: {
            href: "/parent/subscriptions",
            label: "إدارة الاشتراك وتفاصيل السداد ←",
          },
          chips: ["سجل الحضور والغياب", "الدعم الفني وخدمة العملاء 🛠️"],
        };
      }

      // Attendance Record
      if (q.includes("حضور") || q.includes("غياب") || q.includes("التزام")) {
        return {
          text: "📊 سجل الحضور والغياب يوضح التزام ابنك بنسبة 100% بكافة الحصص السابقة دون أي غياب غير مبرر، مما يعزز فرصه في التكريم الرياضي الشهري.",
          actionLink: {
            href: "/parent/attendance",
            label: "مراجعة كشف حضور وغياب ابني ←",
          },
          chips: ["تقرير مستوى وتقييم ابني", "حالة الاشتراك وسداد الرسوم"],
        };
      }
    }

    // Default Fallback
    return {
      text: `أهلاً بك يا ${displayName}! أنا مساعدك الذكي في أكاديمية FIFA FC بصفتك (${config.roleTitle}). يمكنك اختياري من الأسئلة السريعة أدناه أو السؤال عن أي تفاصيل تدريبية، إدارية، أو طلب الدعم الفني الفوري.`,
      chips: config.quickChips,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // 700ms smart AI typing delay
    setTimeout(() => {
      const responseData = generateBotResponse(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: responseData.text,
        timestamp: getCurrentTime(),
        actionLink: responseData.actionLink,
        chips: responseData.chips,
        supportCard: responseData.supportCard,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: "bot",
        text: config.getWelcomeMessage(displayName),
        timestamp: "الآن",
        chips: config.quickChips,
      },
    ]);
    setInputValue("");
    setIsTyping(false);
  };

  // Prepares direct WhatsApp message link
  const getWhatsAppSupportLink = (customText?: string) => {
    const baseText =
      customText ||
      `مرحباً فريق دعم FIFA FC، أنا ${displayName} (${config.roleTitle}) وأحتاج دعماً فنياً بخصوص المنصة.`;
    return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(baseText)}`;
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom-Left) */}
      <div className="fixed bottom-20 lg:bottom-6 left-4 sm:left-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-[60px] h-[60px] rounded-full bg-[#0D1117] border-2 border-[#F59E0B] text-[#FBBF24] shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
          title={`مساعد FIFA FC الذكي • ${config.roleTitle}`}
          aria-label={`مساعد FIFA FC الذكي • ${config.roleTitle}`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-amber-400 transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 text-[#FBBF24] animate-pulse" />
              {/* Golden Notification Badge */}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F59E0B] text-slate-950 font-black text-[9px] items-center justify-center">
                    1
                  </span>
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Window Container */}
      <div
        dir="rtl"
        className={`fixed bottom-[84px] lg:bottom-24 left-4 sm:left-6 z-50 w-[400px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-120px)] rounded-2xl bg-[#F8FAFC] border border-slate-700/60 shadow-2xl shadow-black/60 flex flex-col overflow-hidden select-none transition-all duration-300 ease-out origin-bottom-left ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header - Matches Dark Obsidian & Gold */}
        <div className="bg-[#0D1117] border-b border-amber-500/30 px-4 py-3 flex items-center justify-between shrink-0">
          {/* Bot Avatar & Role-aware Title */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c2430] to-[#0d131c] border border-amber-500/50 shadow-md shadow-amber-500/20 text-[#FBBF24]">
              {effectiveRole === "coach" ? (
                <Award className="h-5 w-5" />
              ) : effectiveRole === "parent" ? (
                <Users2 className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0D1117]" />
            </div>

            <div className="text-start">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black tracking-wider text-[#FBBF24]">
                  FIFA FC ACADEMY AI
                </h3>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-[8.5px] font-black text-amber-300 border border-amber-500/30">
                  {config.roleBadge}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>المساعد الذكي والدعم الفني • متصل</span>
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-400 hover:bg-[#1a2330] transition-colors cursor-pointer"
              title="إعادة بدء المحادثة"
              aria-label="إعادة بدء المحادثة"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2330] transition-colors cursor-pointer"
              title="إغلاق المحادثة"
              aria-label="إغلاق المحادثة"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F8FAFC]">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed text-start shadow-xs transition-all ${
                    isBot
                      ? "bg-[#FFFFFF] text-slate-900 border border-slate-200/90 rounded-tr-xs"
                      : "bg-[#F59E0B] text-slate-950 font-bold rounded-tl-xs shadow-md shadow-amber-500/20"
                  }`}
                >
                  {isBot && (
                    <div className="flex items-center justify-between gap-1.5 mb-1.5 pb-1 border-b border-slate-100 text-[10px] font-bold text-amber-600">
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>مساعد {config.roleTitle}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-normal">
                        FIFA FC BOT
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Embedded Support Hub Card */}
                  {isBot && msg.supportCard && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                      {/* Ticket Badge if generated */}
                      {msg.supportCard.ticketId && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                            تذكرة الدعم: {msg.supportCard.ticketId}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-950">
                            قيد المعالجة
                          </span>
                        </div>
                      )}

                      {/* Direct Support Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Direct WhatsApp Action */}
                        <a
                          href={getWhatsAppSupportLink(
                            msg.supportCard.issueSummary
                              ? `بخصوص التذكرة ${msg.supportCard.ticketId || ""}: ${msg.supportCard.issueSummary}`
                              : undefined
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] transition-colors shadow-xs"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>واتساب الدعم الفني</span>
                        </a>

                        {/* Direct Phone Call Action */}
                        <a
                          href={`tel:${SUPPORT_PHONE}`}
                          className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[10.5px] transition-colors shadow-xs"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>اتصال فوري {SUPPORT_PHONE}</span>
                        </a>
                      </div>

                      {/* Quick FAQ / Action triggers */}
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] space-y-1">
                        <div className="flex items-center gap-1 text-slate-600 font-bold">
                          <LifeBuoy className="h-3 w-3 text-amber-500" />
                          <span>ساعات عمل فريق الدعم:</span>
                        </div>
                        <p className="text-slate-500">
                          يومياً من 9:00 صباحاً حتى 10:00 مساءً عبر الهاتف وواتساب.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action link if available */}
                  {msg.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <Link
                        href={msg.actionLink.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline"
                      >
                        <span>{msg.actionLink.label}</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Quick Action Chips below bot message */}
                {isBot && msg.chips && msg.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-amber-500/40 hover:bg-[#F59E0B] hover:text-slate-950 hover:border-[#F59E0B] shadow-xs active:scale-95 transition-all duration-150 cursor-pointer text-start"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* 3-Dot Golden Typing Animation */}
          {isTyping && (
            <div className="flex items-start">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 rounded-tr-xs shadow-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-[#F59E0B] animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  effectiveRole === "coach"
                    ? "اسأل عن تمرين، كشف حضور، تقييم، أو مشكلة تقنية..."
                    : effectiveRole === "parent"
                    ? "اسأل عن مواعيد التمارين، الاشتراكات، أو الدعم الفني..."
                    : "ابحث أو اسأل عن لاعب، مجموعة، إيرادات، أو دعم فني..."
                }
                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 ps-3.5 pe-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-start"
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
              title="إرسال"
              aria-label="إرسال"
            >
              <Send className="h-4 w-4 rotate-180" />
            </button>
          </form>

          {/* Quick Technical Support Hotline Bar */}
          <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-2 border-t border-slate-100 mt-2 px-1">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>الخوادم تعمل بكفاءة 100%</span>
            </span>

            <button
              type="button"
              onClick={() => handleSendMessage("الدعم الفني والمساعدة 🛠️")}
              className="font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Wrench className="h-3 w-3" />
              <span>مركز الدعم الفني</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

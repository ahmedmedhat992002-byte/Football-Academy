/**
 * WhatsApp Helper Utilities for FIFA FC ACADEMY
 * Generates direct chat URLs with pre-formatted Arabic messages.
 */

export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return "";
  // Strip all non-digit characters
  let clean = phone.replace(/\D/g, "");

  // If starts with 0 (Egyptian local standard: 010..., 011..., 012..., 015...), prepend 20
  if (clean.startsWith("0")) {
    clean = "2" + clean;
  }
  // If not starting with country code and is 10 digits, prepend 20
  if (clean.length === 10 && !clean.startsWith("2")) {
    clean = "20" + clean;
  }
  return clean;
}

export function createWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export const WhatsAppTemplates = {
  // Subscription Renewal / Overdue
  subscriptionReminder: (params: {
    parentName?: string;
    playerName: string;
    planName: string;
    amount: number;
    dueDate?: string;
  }) => {
    const greeting = params.parentName ? `مرحباً أستاذ/ة ${params.parentName}` : "مرحباً ولي أمر البطل";
    const dateText = params.dueDate ? `بتاريخ: ${params.dueDate}` : "هذا الشهر";
    return `السلام عليكم ورحمة الله وبركاته ⚽
${greeting}،
نود تذكير سيادتكم بقرب انتهاء/تجديد اشتراك بطلنا (*${params.playerName}*) في أكاديمية FIFA FC ACADEMY.
📌 الباقة: ${params.planName}
💰 الرسوم: ${params.amount} ج.م (${dateText})
💳 يمكنكم السداد كاش في مقر الأكاديمية أو تحويل إنستاباي.
نتمنى لبطلنا دوام التوفيق والتألق الرياضي دائماً! 🌟`;
  },

  // Training Session Reminder
  sessionReminder: (params: {
    playerName: string;
    sessionDate: string;
    sessionTime: string;
    location?: string;
  }) => {
    return `السلام عليكم ورحمة الله وبركاته ⚽
تذكير من إدارة أكاديمية FIFA FC ACADEMY بموعد تدريب البطل (*${params.playerName}*):
📅 التاريخ: ${params.sessionDate}
⏰ الموعد: ${params.sessionTime}
📍 الملعب: ${params.location || "الملعب الرئيسي للأكاديمية"}
يرجى الحضور بالزي الرياضي المعتمد وزجاجة المياه قبل الموعد بـ 15 دقيقة. بالتوفيق لبطلنا! 🏃‍♂️⚽`;
  },

  // Match / Tournament Notice
  matchNotice: (params: {
    playerName: string;
    opponent: string;
    matchDate: string;
    matchTime: string;
    location: string;
  }) => {
    return `السلام عليكم ورحمة الله وبركاته 🏆
يسر أكاديمية FIFA FC ACADEMY إبلاغكم باختيار البطل (*${params.playerName}*) لخوض المباراة القادمة:
⚔️ ضد: ${params.opponent}
📅 الموعد: ${params.matchDate} - الساعة ${params.matchTime}
📍 المكان: ${params.location}
نتمنى لأبطالنا الفوز وتقديم أداء مشرف يليق بأكاديميتنا! 🥇⚽`;
  },

  // Evaluation / Progress Report
  evaluationShare: (params: {
    playerName: string;
    overallScore: number;
    notes?: string;
  }) => {
    return `السلام عليكم ورحمة الله وبركاته 🌟
يسر الجهاز الفني بأكاديمية FIFA FC ACADEMY إرسال تقرير المستوى الفني والبدني الدوري للبطل (*${params.playerName}*):
⭐ التقييم العام: ${params.overallScore} / 10
${params.notes ? `📝 ملاحظات الكابتن: ${params.notes}\n` : ""}يمكنكم الإطلاع على التقرير المفصل ورادار المهارات عبر بوابة ولي الأمر.
فخورون بتطور مستوى بطلنا! 👏⚽`;
  },
};

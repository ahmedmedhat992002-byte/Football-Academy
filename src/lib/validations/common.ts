import { z } from "zod";

/**
 * Common regular expressions across the application
 */
export const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

/**
 * Reusable Zod schema primitives
 */
export const emailSchema = z
  .string()
  .min(1, "يرجى إدخال البريد الإلكتروني")
  .email("صيغة البريد الإلكتروني غير صحيحة");

export const gmailSchema = z
  .string()
  .min(1, "يرجى إدخال عنوان بريد Gmail")
  .email("صيغة البريد الإلكتروني غير صحيحة")
  .refine((val) => gmailRegex.test(val.trim()), {
    message: "يجب استخدام حساب Gmail حقيقي ينتهي بـ @gmail.com",
  });

export const passwordSchema = (
  min = 6,
  message = "كلمة المرور يجب أن لا تقل عن 6 أحرف"
) => z.string().min(min, message);

export const fullNameSchema = (
  min = 3,
  message = "يرجى إدخال الاسم بالكامل (ثلاثي على الأقل)"
) => z.string().min(min, message);

export const phoneSchema = (
  min = 10,
  message = "رقم الهاتف غير صحيح (يجب أن يكون 10 أرقام على الأقل)"
) => z.string().min(min, message);

export const ratingScoreSchema = (
  min = 1,
  max = 10,
  message = "التقييم يجب أن يكون بين 1 و 10"
) => z.number().min(min, message).max(max, message);

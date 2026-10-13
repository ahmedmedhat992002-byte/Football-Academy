import { z } from "zod";

export const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "يرجى إدخال البريد الإلكتروني")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "يرجى إدخال الاسم بالكامل (ثلاثي على الأقل)"),
  email: z
    .string()
    .min(1, "يرجى إدخال البريد الإلكتروني")
    .email("صيغة البريد الإلكتروني غير صحيحة")
    .refine((val) => gmailRegex.test(val.trim()), {
      message: "يجب استخدام حساب Gmail حقيقي ينتهي بـ @gmail.com",
    }),
  phone: z
    .string()
    .min(10, "رقم الهاتف غير صحيح (يجب أن يكون 10 أرقام على الأقل)"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  childName: z
    .string()
    .min(3, "يرجى إدخال اسم اللاعب المشترك"),
  childBirthDate: z
    .string()
    .min(1, "يرجى تحديد تاريخ ميلاد اللاعب"),
  ageCategory: z
    .string()
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const trialBookingSchema = z.object({
  parentName: z.string().min(3, "يرجى إدخال اسم ولي الأمر"),
  childName: z.string().min(3, "يرجى إدخال اسم اللاعب"),
  phone: z.string().min(10, "يرجى إدخال رقم هاتف صحيح"),
  ageCategory: z.string().min(1, "يرجى اختيار الفئة السنية"),
  preferredDate: z.string().optional(),
});

export type TrialBookingInput = z.infer<typeof trialBookingSchema>;

export const coachRegisterSchema = z.object({
  fullName: z.string().min(3, "يرجى إدخال اسم الكابتن بالكامل (ثلاثي)"),
  email: z
    .string()
    .min(1, "يرجى إدخال البريد الإلكتروني")
    .email("صيغة البريد الإلكتروني غير صحيحة")
    .refine((val) => gmailRegex.test(val.trim()), {
      message: "يجب استخدام حساب Gmail حقيقي ينتهي بـ @gmail.com",
    }),
  phone: z.string().min(10, "رقم الهاتف غير صحيح (10 أرقام على الأقل)"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  specialization: z.string().min(2, "يرجى تحديد التخصص التدريبي"),
  experienceYears: z.string().optional(),
  bio: z.string().optional(),
});

export type CoachRegisterInput = z.infer<typeof coachRegisterSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "يرجى إدخال عنوان بريد Gmail")
    .email("صيغة البريد الإلكتروني غير صحيحة")
    .refine((val) => gmailRegex.test(val.trim()), {
      message: "يجب إدخال عنوان بريد Gmail حقيقي ينتهي بـ @gmail.com",
    }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف"),
    confirmPassword: z.string().min(6, "يرجى إعادة كتابة كلمة المرور لتأكيدها"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;



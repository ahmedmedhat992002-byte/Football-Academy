import { z } from "zod";
import {
  gmailRegex,
  emailSchema,
  gmailSchema,
  passwordSchema,
  fullNameSchema,
  phoneSchema,
} from "./common";

export { gmailRegex };

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: fullNameSchema(3, "يرجى إدخال الاسم بالكامل (ثلاثي على الأقل)"),
  email: gmailSchema,
  phone: phoneSchema(10, "رقم الهاتف غير صحيح (يجب أن يكون 10 أرقام على الأقل)"),
  password: passwordSchema(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  childName: fullNameSchema(3, "يرجى إدخال اسم اللاعب المشترك"),
  childBirthDate: z.string().min(1, "يرجى تحديد تاريخ ميلاد اللاعب"),
  ageCategory: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const trialBookingSchema = z.object({
  parentName: fullNameSchema(3, "يرجى إدخال اسم ولي الأمر"),
  childName: fullNameSchema(3, "يرجى إدخال اسم اللاعب"),
  phone: phoneSchema(10, "يرجى إدخال رقم هاتف صحيح"),
  ageCategory: z.string().min(1, "يرجى اختيار الفئة السنية"),
  preferredDate: z.string().optional(),
});

export type TrialBookingInput = z.infer<typeof trialBookingSchema>;

export const coachRegisterSchema = z.object({
  fullName: fullNameSchema(3, "يرجى إدخال اسم الكابتن بالكامل (ثلاثي)"),
  email: gmailSchema,
  phone: phoneSchema(10, "رقم الهاتف غير صحيح (10 أرقام على الأقل)"),
  password: passwordSchema(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  specialization: z.string().min(2, "يرجى تحديد التخصص التدريبي"),
  experienceYears: z.string().optional(),
  bio: z.string().optional(),
});

export type CoachRegisterInput = z.infer<typeof coachRegisterSchema>;

export const forgotPasswordSchema = z.object({
  email: gmailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema(6, "كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف"),
    confirmPassword: passwordSchema(6, "يرجى إعادة كتابة كلمة المرور لتأكيدها"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;



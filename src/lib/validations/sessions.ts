import { z } from "zod";

export const sessionSchema = z.object({
  group_id: z.string().min(1, "يرجى اختيار المجموعة"),
  session_date: z.string().min(1, "يرجى تحديد تاريخ الحصة التدريبية"),
  start_time: z.string().min(1, "يرجى تحديد وقت البدء"),
  end_time: z.string().min(1, "يرجى تحديد وقت الانتهاء"),
  location: z.string().min(1, "يرجى تحديد الملعب أو الموقع"),
  notes: z.string().optional().nullable(),
});

export type SessionInput = z.infer<typeof sessionSchema>;

export const generateSessionsSchema = z.object({
  group_id: z.string().min(1, "يرجى اختيار المجموعة"),
  start_date: z.string().min(1, "يرجى تحديد تاريخ بداية التوليد"),
  end_date: z.string().min(1, "يرجى تحديد تاريخ نهاية التوليد"),
  location: z.string().min(1, "يرجى تحديد الملعب"),
  start_time: z.string().min(1, "يرجى تحديد وقت البدء"),
  end_time: z.string().min(1, "يرجى تحديد وقت الانتهاء"),
});

export type GenerateSessionsInput = z.infer<typeof generateSessionsSchema>;

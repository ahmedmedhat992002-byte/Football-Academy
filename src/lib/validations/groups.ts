import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().min(2, "اسم المجموعة يجب أن لا يقل عن حرفين"),
  age_category: z.string().min(1, "يرجى اختيار الفئة العمرية"),
  coach_id: z.string().optional().nullable(),
  training_days: z.array(z.string()).min(1, "يرجى تحديد يوم تدريب واحد على الأقل"),
});

export type GroupInput = z.infer<typeof groupSchema>;

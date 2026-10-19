import { z } from "zod";
import { fullNameSchema, phoneSchema } from "./common";

export const playerSchema = z.object({
  full_name: fullNameSchema(3, "اسم اللاعب يجب أن لا يقل عن 3 أحرف"),
  birth_date: z.string().min(1, "يرجى تحديد تاريخ الميلاد"),
  group_id: z.string().optional().nullable(),
  parent_id: z.string().optional().nullable(),
  status: z.enum(["active", "paused", "left"]),
  emergency_phone: phoneSchema(
    8,
    "رقم هاتف الطوارئ يجب أن لا يقل عن 8 أرقام"
  ),
  notes: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  kit_size: z.string().optional().nullable(),
  kit_received: z.boolean().optional(),
  kit_received_date: z.string().optional().nullable(),
  jersey_number: z.string().optional().nullable(),
});

export type PlayerInput = z.infer<typeof playerSchema>;

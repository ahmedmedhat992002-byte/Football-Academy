import { z } from "zod";

export const evaluationSchema = z.object({
  player_id: z.string().min(1, "يرجى اختيار اللاعب"),
  coach_id: z.string().optional().nullable(),
  eval_date: z.string().min(1, "يرجى تحديد تاريخ التقييم"),
  technical: z
    .number()
    .min(1, "التقييم يجب أن يكون بين 1 و 10")
    .max(10, "التقييم يجب أن يكون بين 1 و 10"),
  physical: z
    .number()
    .min(1, "التقييم يجب أن يكون بين 1 و 10")
    .max(10, "التقييم يجب أن يكون بين 1 و 10"),
  tactical: z
    .number()
    .min(1, "التقييم يجب أن يكون بين 1 و 10")
    .max(10, "التقييم يجب أن يكون بين 1 و 10"),
  discipline: z
    .number()
    .min(1, "التقييم يجب أن يكون بين 1 و 10")
    .max(10, "التقييم يجب أن يكون بين 1 و 10"),
  notes: z.string().optional().nullable(),
});

export type EvaluationInput = z.infer<typeof evaluationSchema>;

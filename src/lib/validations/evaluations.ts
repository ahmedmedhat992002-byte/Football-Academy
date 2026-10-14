import { z } from "zod";
import { ratingScoreSchema } from "./common";

export const evaluationSchema = z.object({
  player_id: z.string().min(1, "يرجى اختيار اللاعب"),
  coach_id: z.string().optional().nullable(),
  eval_date: z.string().min(1, "يرجى تحديد تاريخ التقييم"),
  technical: ratingScoreSchema(1, 10, "التقييم يجب أن يكون بين 1 و 10"),
  physical: ratingScoreSchema(1, 10, "التقييم يجب أن يكون بين 1 و 10"),
  tactical: ratingScoreSchema(1, 10, "التقييم يجب أن يكون بين 1 و 10"),
  discipline: ratingScoreSchema(1, 10, "التقييم يجب أن يكون بين 1 و 10"),
  notes: z.string().optional().nullable(),
});

export type EvaluationInput = z.infer<typeof evaluationSchema>;

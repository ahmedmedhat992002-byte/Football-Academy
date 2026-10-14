"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  evaluationSchema,
  type EvaluationInput,
} from "@/lib/validations/evaluations";
import {
  INITIAL_EVALUATIONS,
  type Evaluation,
} from "@/lib/data/academy-store";
import { getPlayers } from "@/lib/actions/players";

const EVALS_STORAGE_COOKIE = "academy_custom_evaluations";

async function getStoredEvaluations(): Promise<Evaluation[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(EVALS_STORAGE_COOKIE)?.value;
  if (!raw) return [];
  try {
    const list: Evaluation[] = JSON.parse(decodeURIComponent(raw));
    return (Array.isArray(list) ? list : []).filter(
      (e) => !e.id?.startsWith("mock-") && !e.id?.startsWith("demo-") && !e.player_name?.includes("الشناوي")
    );
  } catch {
    try {
      const list: Evaluation[] = JSON.parse(raw);
      return (Array.isArray(list) ? list : []).filter(
        (e) => !e.id?.startsWith("mock-") && !e.id?.startsWith("demo-") && !e.player_name?.includes("الشناوي")
      );
    } catch {
      return [];
    }
  }
}

async function saveStoredEvaluations(evals: Evaluation[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    EVALS_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(evals)),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    }
  );
}

/**
 * Fetch evaluations with optional filters
 */
export async function getEvaluations(filters?: {
  playerId?: string;
  coachId?: string;
}): Promise<Evaluation[]> {
  const players = await getPlayers();
  const playerMap = new Map(players.map((p) => [p.id, p]));

  try {
    const supabase = await createClient();
    let query = (supabase.from("evaluations") as any)
      .select("*, player:players!player_id(full_name, group_id), coach:profiles!coach_id(full_name)")
      .order("eval_date", { ascending: false });

    if (filters?.playerId) {
      query = query.eq("player_id", filters.playerId);
    }
    if (filters?.coachId) {
      query = query.eq("coach_id", filters.coachId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((ev: any) => {
        const overall = (ev.technical + ev.physical + ev.tactical + ev.discipline) / 4;
        return {
          ...ev,
          player_name: ev.player?.full_name || "لاعب",
          coach_name: ev.coach?.full_name || "كابتن محمود",
          overall_score: parseFloat(overall.toFixed(1)),
        };
      });
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredEvaluations();
  const all = [...custom, ...INITIAL_EVALUATIONS];
  const unique = Array.from(new Map(all.map((e) => [e.id, e])).values());

  const enriched = unique.map((ev) => {
    const player = playerMap.get(ev.player_id);
    const overall = (ev.technical + ev.physical + ev.tactical + ev.discipline) / 4;
    return {
      ...ev,
      player_name: player?.full_name || ev.player_name || "لاعب",
      group_name: player?.group_name || ev.group_name || "الفريق",
      coach_name: ev.coach_name || "كابتن محمود",
      overall_score: parseFloat(overall.toFixed(1)),
    };
  });

  return enriched.filter((ev) => {
    if (filters?.playerId && ev.player_id !== filters.playerId) return false;
    if (filters?.coachId && ev.coach_id !== filters.coachId) return false;
    return true;
  });
}

/**
 * Fetch a single evaluation by ID
 */
export async function getEvaluationById(evalId: string): Promise<Evaluation | null> {
  const evals = await getEvaluations();
  return evals.find((e) => e.id === evalId) || null;
}

/**
 * Save / Create / Update an evaluation
 */
export async function saveEvaluation(
  input: EvaluationInput,
  evalId?: string
): Promise<{ success: boolean; error?: string; evaluation?: Evaluation }> {
  const parsed = evaluationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات التقييم غير صحيحة",
    };
  }

  const { player_id, coach_id, eval_date, technical, physical, tactical, discipline, notes } =
    parsed.data;

  const players = await getPlayers();
  const player = players.find((p) => p.id === player_id);
  const overall = (technical + physical + tactical + discipline) / 4;
  const overallScore = parseFloat(overall.toFixed(1));

  try {
    const supabase = await createClient();
    if (evalId) {
      const { data, error } = await supabase
        .from("evaluations")
        .update({
          player_id,
          coach_id: coach_id || null,
          eval_date,
          technical,
          physical,
          tactical,
          discipline,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", evalId)
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/evaluations");
        revalidatePath("/coach/evaluations");
        revalidatePath("/parent/report");
        revalidatePath("/parent");
        return { success: true, evaluation: data };
      }
    } else {
      const { data, error } = await supabase
        .from("evaluations")
        .insert({
          player_id,
          coach_id: coach_id || null,
          eval_date,
          technical,
          physical,
          tactical,
          discipline,
          notes: notes || null,
        })
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/evaluations");
        revalidatePath("/coach/evaluations");
        revalidatePath("/parent/report");
        revalidatePath("/parent");
        return { success: true, evaluation: data };
      }
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredEvaluations();
  let updatedEval: Evaluation;

  if (evalId) {
    const idx = custom.findIndex((e) => e.id === evalId);
    updatedEval = {
      id: evalId,
      player_id,
      player_name: player?.full_name || "لاعب",
      group_name: player?.group_name || "الفريق",
      coach_id: coach_id || null,
      coach_name: "كابتن محمود",
      eval_date,
      technical,
      physical,
      tactical,
      discipline,
      overall_score: overallScore,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (idx >= 0) custom[idx] = updatedEval;
    else custom.unshift(updatedEval);
  } else {
    updatedEval = {
      id: `eval-${Date.now()}`,
      player_id,
      player_name: player?.full_name || "لاعب",
      group_name: player?.group_name || "الفريق",
      coach_id: coach_id || null,
      coach_name: "كابتن محمود",
      eval_date,
      technical,
      physical,
      tactical,
      discipline,
      overall_score: overallScore,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    custom.unshift(updatedEval);
  }

  await saveStoredEvaluations(custom);
  revalidatePath("/admin/evaluations");
  revalidatePath("/coach/evaluations");
  revalidatePath("/parent/report");
  revalidatePath("/parent");

  return { success: true, evaluation: updatedEval };
}

/**
 * Delete an evaluation
 */
export async function deleteEvaluation(
  evalId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("evaluations")
      .delete()
      .eq("id", evalId);
    if (!error) {
      revalidatePath("/admin/evaluations");
      revalidatePath("/coach/evaluations");
      revalidatePath("/parent/report");
      return { success: true };
    }
  } catch {
    // Fallback
  }

  const custom = await getStoredEvaluations();
  await saveStoredEvaluations(custom.filter((e) => e.id !== evalId));
  revalidatePath("/admin/evaluations");
  revalidatePath("/coach/evaluations");
  revalidatePath("/parent/report");
  return { success: true };
}

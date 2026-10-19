"use server";

import { revalidatePath } from "next/cache";
import { type PlayerInjury } from "@/lib/data/academy-store";
import {
  getSharedInjuries,
  saveSharedInjury,
  deleteSharedInjury,
} from "@/lib/data/shared-store";
import { getPlayers } from "@/lib/actions/players";
import { invalidateCache } from "@/lib/data/cache-manager";

export async function getInjuries(options?: {
  playerId?: string;
  activeOnly?: boolean;
}): Promise<PlayerInjury[]> {
  try {
    const all = getSharedInjuries();
    const players = await getPlayers();
    const playerMap = new Map(players.map((p) => [p.id, p.full_name]));

    let list = all.map((i) => ({
      ...i,
      player_name: playerMap.get(i.player_id) || i.player_name || "اللاعب",
    }));

    if (options?.playerId) {
      list = list.filter((i) => i.player_id === options.playerId);
    }
    if (options?.activeOnly) {
      list = list.filter((i) => i.status !== "recovered");
    }

    list.sort(
      (a, b) => new Date(b.injury_date).getTime() - new Date(a.injury_date).getTime()
    );

    return list;
  } catch (err) {
    console.error("Failed to get injuries:", err);
    return [];
  }
}

export async function recordInjury(
  data: Omit<PlayerInjury, "id" | "created_at">
): Promise<{ success: boolean; data?: PlayerInjury; error?: string }> {
  try {
    const id = `injury-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newInjury: PlayerInjury = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };

    saveSharedInjury(newInjury);
    invalidateCache();

    revalidatePath("/admin/players");
    revalidatePath("/coach/pitch");
    revalidatePath("/coach/sessions");
    revalidatePath("/parent/children");
    return { success: true, data: newInjury };
  } catch (err) {
    console.error("Failed to record injury:", err);
    return { success: false, error: "تعذر تسجيل الإصابة" };
  }
}

export async function updateInjuryStatus(
  id: string,
  status: PlayerInjury["status"],
  notes?: string,
  details?: Partial<Omit<PlayerInjury, "id" | "created_at">>
): Promise<{ success: boolean }> {
  try {
    const list = getSharedInjuries();
    const existing = list.find((i) => i.id === id);
    if (!existing) return { success: false };

    const updated: PlayerInjury = {
      ...existing,
      ...(details || {}),
      status,
      doctor_notes: notes !== undefined ? notes : (details?.doctor_notes ?? existing.doctor_notes),
    };

    saveSharedInjury(updated);
    invalidateCache();

    revalidatePath("/admin/players");
    revalidatePath("/coach/pitch");
    revalidatePath("/parent/children");
    return { success: true };
  } catch (err) {
    console.error("Failed to update injury status:", err);
    return { success: false };
  }
}

export async function deleteInjury(id: string): Promise<{ success: boolean }> {
  try {
    deleteSharedInjury(id);
    invalidateCache();
    revalidatePath("/admin/players");
    revalidatePath("/coach/pitch");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete injury:", err);
    return { success: false };
  }
}

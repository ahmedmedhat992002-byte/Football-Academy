"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { playerSchema, type PlayerInput } from "@/lib/validations/players";
import { INITIAL_PLAYERS, INITIAL_GROUPS, type Player } from "@/lib/data/academy-store";

const PLAYERS_STORAGE_COOKIE = "academy_custom_players";

async function getStoredCustomPlayers(): Promise<Player[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PLAYERS_STORAGE_COOKIE)?.value;
  if (!raw) return [];
  try {
    const list: Player[] = JSON.parse(decodeURIComponent(raw));
    return (Array.isArray(list) ? list : []).filter(
      (p) => !p.id?.startsWith("mock-") && !p.id?.startsWith("demo-") && !p.full_name?.includes("الشناوي")
    );
  } catch {
    try {
      const list: Player[] = JSON.parse(raw);
      return (Array.isArray(list) ? list : []).filter(
        (p) => !p.id?.startsWith("mock-") && !p.id?.startsWith("demo-") && !p.full_name?.includes("الشناوي")
      );
    } catch {
      return [];
    }
  }
}

async function saveCustomPlayers(players: Player[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PLAYERS_STORAGE_COOKIE, encodeURIComponent(JSON.stringify(players)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Fetch players with optional filtering
 */
export async function getPlayers(options?: {
  groupId?: string;
  status?: string;
  search?: string;
}): Promise<Player[]> {
  const { groupId, status, search } = options || {};

  try {
    const supabase = await createClient();
    let query = (supabase.from("players") as any)
      .select("*, group:groups!group_id(name, age_category), parent:profiles!parent_id(full_name)")
      .order("created_at", { ascending: false });

    if (groupId && groupId !== "all") {
      query = query.eq("group_id", groupId);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,emergency_phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        ...p,
        group_name: p.group?.name ? `${p.group.name} (${p.group.age_category})` : "غير محدد",
        parent_name: p.parent?.full_name || "غير محدد",
      }));
    }
  } catch {
    // Fallback
  }

  const customPlayers = await getStoredCustomPlayers();
  const allPlayers = [...customPlayers, ...INITIAL_PLAYERS];

  // Unique players by id
  let result = Array.from(new Map(allPlayers.map((p) => [p.id, p])).values());

  if (groupId && groupId !== "all") {
    result = result.filter((p) => p.group_id === groupId);
  }

  if (status && status !== "all") {
    result = result.filter((p) => p.status === status);
  }

  if (search && search.trim() !== "") {
    const term = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.full_name.toLowerCase().includes(term) ||
        p.emergency_phone.includes(term) ||
        (p.notes && p.notes.toLowerCase().includes(term))
    );
  }

  return result;
}

/**
 * Save / Create / Update Player
 */
export async function savePlayer(
  input: PlayerInput,
  playerId?: string
): Promise<{ success: boolean; error?: string; player?: Player }> {
  const parsed = playerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات اللاعب غير صحيحة",
    };
  }

  const {
    full_name,
    birth_date,
    group_id,
    parent_id,
    status,
    emergency_phone,
    notes,
    photo_url,
  } = parsed.data;

  // Find group name for display
  const matchedGroup = INITIAL_GROUPS.find((g) => g.id === group_id);
  const group_name = matchedGroup
    ? `${matchedGroup.name} (${matchedGroup.age_category})`
    : "غير محدد";

  try {
    const supabase = await createClient();
    if (playerId) {
      const { data, error } = await (supabase.from("players") as any)
        .update({
          full_name,
          birth_date,
          group_id: group_id || null,
          parent_id: parent_id || null,
          status,
          emergency_phone,
          notes: notes || null,
          photo_url: photo_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", playerId)
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/players");
        revalidatePath("/coach/groups");
        return { success: true, player: data };
      }
    } else {
      const { data, error } = await (supabase.from("players") as any)
        .insert({
          full_name,
          birth_date,
          group_id: group_id || null,
          parent_id: parent_id || null,
          status,
          emergency_phone,
          notes: notes || null,
          photo_url: photo_url || null,
        })
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/players");
        revalidatePath("/coach/groups");
        return { success: true, player: data };
      }
    }
  } catch {
    // Fallback
  }

  const currentCustom = await getStoredCustomPlayers();
  let updatedPlayer: Player;

  if (playerId) {
    const existingIndex = currentCustom.findIndex((p) => p.id === playerId);
    updatedPlayer = {
      id: playerId,
      full_name,
      birth_date,
      group_id: group_id || null,
      group_name,
      parent_id: parent_id || null,
      parent_name: "ولي الأمر",
      status,
      emergency_phone,
      notes: notes || null,
      photo_url: photo_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      currentCustom[existingIndex] = updatedPlayer;
    } else {
      currentCustom.unshift(updatedPlayer);
    }
  } else {
    updatedPlayer = {
      id: `player-${Date.now()}`,
      full_name,
      birth_date,
      group_id: group_id || null,
      group_name,
      parent_id: parent_id || null,
      parent_name: "ولي الأمر",
      status,
      emergency_phone,
      notes: notes || null,
      photo_url: photo_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    currentCustom.unshift(updatedPlayer);
  }

  await saveCustomPlayers(currentCustom);

  revalidatePath("/admin/players");
  revalidatePath("/coach/groups");

  return { success: true, player: updatedPlayer };
}

/**
 * Delete a Player by ID
 */
export async function deletePlayer(playerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase.from("players") as any).delete().eq("id", playerId);
    if (!error) {
      revalidatePath("/admin/players");
      return { success: true };
    }
  } catch {
    // Fallback
  }

  const currentCustom = await getStoredCustomPlayers();
  const filtered = currentCustom.filter((p) => p.id !== playerId);
  await saveCustomPlayers(filtered);

  revalidatePath("/admin/players");

  return { success: true };
}

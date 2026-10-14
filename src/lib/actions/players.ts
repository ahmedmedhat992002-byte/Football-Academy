"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { playerSchema, type PlayerInput } from "@/lib/validations/players";
import { INITIAL_PLAYERS, INITIAL_GROUPS, type Player } from "@/lib/data/academy-store";
import {
  getSharedPlayers,
  saveSharedPlayer,
  getSharedRegisteredUsers,
} from "@/lib/data/shared-store";

const PLAYERS_STORAGE_COOKIE = "academy_custom_players";

const isUUID = (str?: string | null): boolean =>
  !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

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
  const sharedPlayers = getSharedPlayers();
  const allPlayers = [...sharedPlayers, ...customPlayers, ...INITIAL_PLAYERS];

  // Automatically include newly registered children from parent registrations (both shared and cookies)
  try {
    const { getRegisteredUsers } = await import("@/lib/auth/actions");
    const cookieRegistered = await getRegisteredUsers();
    const sharedRegistered = getSharedRegisteredUsers();
    const allRegistered = [...sharedRegistered, ...cookieRegistered];

    for (const reg of allRegistered) {
      if (!reg.childName) continue;
      const alreadyExists = allPlayers.some(
        (p) =>
          p.full_name?.trim().toLowerCase() === reg.childName?.trim().toLowerCase() ||
          p.id === `player-${reg.id}`
      );
      if (!alreadyExists) {
        allPlayers.unshift({
          id: `player-${reg.id}`,
          full_name: reg.childName,
          birth_date: reg.childBirthDate || "2015-05-10",
          group_id:
            reg.ageCategory === "U8"
              ? "group-u8-004"
              : reg.ageCategory === "U10"
              ? "group-u10-001"
              : reg.ageCategory === "U12"
              ? "group-u12-002"
              : "group-u14-003",
          group_name: reg.ageCategory ? `فريق (${reg.ageCategory})` : "فريق الأبطال (U10)",
          parent_id: reg.id,
          parent_name: reg.fullName,
          status: "active",
          photo_url: null,
          emergency_phone: reg.phone || "",
          notes: `مسجل جديد عبر المنظومة — ولي الأمر: ${reg.fullName}`,
          created_at: reg.createdAt || new Date().toISOString(),
          updated_at: reg.createdAt || new Date().toISOString(),
        });
      }
    }
  } catch {
    // Ignore import failure
  }

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

  const validGroupId = isUUID(group_id) ? group_id : null;
  const validParentId = isUUID(parent_id) ? parent_id : null;

  try {
    const supabase = await createClient();
    if (playerId) {
      const { data, error } = await (supabase.from("players") as any)
        .update({
          full_name,
          birth_date,
          group_id: validGroupId,
          parent_id: validParentId,
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
        saveSharedPlayer({ ...data, group_name, parent_name: "ولي الأمر" });
        revalidatePath("/admin/players");
        revalidatePath("/coach/groups");
        return { success: true, player: data };
      }
    } else {
      const { data, error } = await (supabase.from("players") as any)
        .insert({
          full_name,
          birth_date,
          group_id: validGroupId,
          parent_id: validParentId,
          status,
          emergency_phone,
          notes: notes || null,
          photo_url: photo_url || null,
        })
        .select()
        .single();

      if (!error && data) {
        saveSharedPlayer({ ...data, group_name, parent_name: "ولي الأمر" });
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

  // Save to shared store across all sessions & browsers
  saveSharedPlayer(updatedPlayer);
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

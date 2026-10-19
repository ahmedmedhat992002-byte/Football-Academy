"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { playerSchema, type PlayerInput } from "@/lib/validations/players";
import { INITIAL_PLAYERS, INITIAL_GROUPS, type Player } from "@/lib/data/academy-store";
import {
  getSharedPlayers,
  saveSharedPlayer,
  deleteSharedPlayer,
  getSharedDeletedPlayerIds,
  getSharedRegisteredUsers,
  updateSharedRegisteredUser,
  getSharedInjuries,
  getSharedBadges,
} from "@/lib/data/shared-store";
import { cachedFetch, invalidateCache } from "@/lib/data/cache-manager";

const PLAYERS_STORAGE_COOKIE = "academy_custom_players";
const PLAYERS_DELETED_COOKIE = "academy_players_deleted";

const isUUID = (str?: string | null): boolean =>
  !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function getDeletedPlayerIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PLAYERS_DELETED_COOKIE)?.value;
  if (!raw) return [];
  try {
    const list = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(list) ? list : [];
  } catch {
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }
}

export async function saveDeletedPlayerIds(ids: string[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PLAYERS_DELETED_COOKIE, encodeURIComponent(JSON.stringify(ids)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
  });
}

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
 * Fetch players with optional filtering - always returns fresh real data instantly
 */
export async function getPlayers(options?: {
  groupId?: string;
  status?: string;
  search?: string;
}): Promise<Player[]> {
  const { groupId, status, search } = options || {};

  const cookieDeleted = await getDeletedPlayerIds();
  const sharedDeleted = getSharedDeletedPlayerIds();
  const allDeletedIds = Array.from(new Set([...cookieDeleted, ...sharedDeleted]));

  const isAllowed = (p: Player) => {
    if (!p?.id) return false;
    if (allDeletedIds.includes(p.id)) return false;
    const cleanId = p.id.replace("player-", "");
    if (allDeletedIds.includes(cleanId)) return false;
    return true;
  };

  const allPlayers: Player[] = [];
  const seenIds = new Set<string>();

  // 1. Try Supabase
  try {
    const supabase = await createClient();
    let query = (supabase.from("players") as any)
      .select("*, group:groups!group_id(name, age_category), parent:profiles!parent_id(full_name)")
      .order("created_at", { ascending: false });

    if (groupId && groupId !== "all") query = query.eq("group_id", groupId);
    if (status && status !== "all") query = query.eq("status", status);
    if (search) query = query.or(`full_name.ilike.%${search}%,emergency_phone.ilike.%${search}%`);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      data.forEach((p: any) => {
        const mapped: Player = {
          ...p,
          group_name: p.group?.name ? `${p.group.name} (${p.group.age_category})` : "غير محدد",
          parent_name: p.parent?.full_name || "غير محدد",
        };
        if (isAllowed(mapped) && !seenIds.has(mapped.id)) {
          seenIds.add(mapped.id);
          allPlayers.push(mapped);
        }
      });
    }
  } catch {
    // Fallback
  }

  // 2. Custom & Shared Players (edits take precedence)
  const customPlayers = await getStoredCustomPlayers();
  const sharedPlayers = getSharedPlayers();

  for (const p of [...sharedPlayers, ...customPlayers]) {
    if (p?.id && isAllowed(p) && !seenIds.has(p.id)) {
      seenIds.add(p.id);
      allPlayers.push(p);
    }
  }

  // 3. Registered parents children (only if not explicitly deleted)
  try {
    const { getRegisteredUsers } = await import("@/lib/auth/actions");
    const cookieRegistered = await getRegisteredUsers();
    const sharedRegistered = getSharedRegisteredUsers();
    const allRegistered = [...sharedRegistered, ...cookieRegistered];

    for (const reg of allRegistered) {
      if (!reg.childName) continue;
      const pId = `player-${reg.id}`;
      if (!isAllowed({ id: pId } as Player) || allDeletedIds.includes(reg.id)) {
        continue;
      }
      if (!seenIds.has(pId)) {
        seenIds.add(pId);
        allPlayers.push({
          id: pId,
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

  // 4. Initial default players
  for (const p of INITIAL_PLAYERS) {
    if (p?.id && isAllowed(p) && !seenIds.has(p.id)) {
      seenIds.add(p.id);
      allPlayers.push(p);
    }
  }

  let result = allPlayers;

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

  // Enrich with active injury and badges directly from live shared-store
  const injuries = getSharedInjuries();
  const badges = getSharedBadges();

  result = result.map((p) => {
    const activeInjury = injuries.find(
      (i) => i.player_id === p.id && i.status !== "recovered"
    );
    const badgesCount = badges.filter((b) => b.player_id === p.id).length;
    return {
      ...p,
      active_injury: activeInjury,
      badges_count: badgesCount,
    };
  });

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
    kit_size,
    kit_received,
    kit_received_date,
    jersey_number,
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
    if (playerId && isUUID(playerId)) {
      await (supabase.from("players") as any)
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
        .eq("id", playerId);
    } else if (!playerId) {
      const { data } = await (supabase.from("players") as any)
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
      if (data?.id) {
        playerId = data.id;
      }
    }
  } catch {
    // Fallback
  }

  // 2. Unblock from deletedPlayerIds if re-saving
  const targetId = playerId || `player-${Date.now()}`;
  const deleted = await getDeletedPlayerIds();
  if (deleted.includes(targetId) || deleted.includes(targetId.replace("player-", ""))) {
    const filteredDeleted = deleted.filter(
      (id) => id !== targetId && id !== targetId.replace("player-", "")
    );
    await saveDeletedPlayerIds(filteredDeleted);
  }

  // 3. Keep registered parent child in sync if applicable
  const rawParentId = (parent_id || targetId.replace("player-", "")).trim();
  if (rawParentId) {
    updateSharedRegisteredUser(rawParentId, {
      childName: full_name,
      childBirthDate: birth_date,
    });
  }

  // 4. Update in custom players & shared store
  const currentCustom = await getStoredCustomPlayers();
  const existingIndex = currentCustom.findIndex((p) => p.id === targetId);

  const updatedPlayer: Player = {
    id: targetId,
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
    kit_size: kit_size || (existingIndex >= 0 ? (currentCustom[existingIndex] as any)?.kit_size : undefined) || "M",
    kit_received: kit_received !== undefined ? kit_received : (existingIndex >= 0 ? (currentCustom[existingIndex] as any)?.kit_received : false),
    kit_received_date: kit_received_date || (existingIndex >= 0 ? (currentCustom[existingIndex] as any)?.kit_received_date : undefined),
    jersey_number: jersey_number || (existingIndex >= 0 ? (currentCustom[existingIndex] as any)?.jersey_number : undefined),
    created_at: existingIndex >= 0 ? currentCustom[existingIndex].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    currentCustom[existingIndex] = updatedPlayer;
  } else {
    currentCustom.unshift(updatedPlayer);
  }

  saveSharedPlayer(updatedPlayer);
  await saveCustomPlayers(currentCustom);

  invalidateCache();
  revalidatePath("/admin/players");
  revalidatePath("/coach/groups");
  revalidatePath("/coach/pitch");
  revalidatePath("/parent/children");
  revalidatePath("/");

  return { success: true, player: updatedPlayer };
}

/**
 * Delete a Player by ID permanently across all stores
 */
export async function deletePlayer(playerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Supabase deletion
    try {
      const supabase = await createClient();
      await (supabase.from("players") as any).delete().eq("id", playerId);
    } catch {
      // Fallback
    }

    // 2. Shared Store deletion
    deleteSharedPlayer(playerId);

    // 3. Custom players cookie deletion
    const currentCustom = await getStoredCustomPlayers();
    const filtered = currentCustom.filter((p) => p.id !== playerId);
    await saveCustomPlayers(filtered);

    // 4. Save to deleted list
    const deleted = await getDeletedPlayerIds();
    const toAdd = [playerId];
    if (playerId.startsWith("player-")) {
      toAdd.push(playerId.replace("player-", ""));
    }
    const updatedDeleted = Array.from(new Set([...deleted, ...toAdd]));
    await saveDeletedPlayerIds(updatedDeleted);

    // 5. Invalidate all cache
    invalidateCache();
    revalidatePath("/admin/players");
    revalidatePath("/coach/groups");
    revalidatePath("/coach/pitch");
    revalidatePath("/parent/children");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Failed to delete player:", err);
    return { success: false, error: "تعذر حذف اللاعب" };
  }
}

/**
 * Toggle or update player kit receipt status
 */
export async function togglePlayerKit(
  playerId: string,
  received: boolean,
  size?: string
): Promise<{ success: boolean }> {
  try {
    const players = await getPlayers();
    const target = players.find((p) => p.id === playerId);
    if (!target) return { success: false };

    const updated: Player = {
      ...target,
      kit_received: received,
      kit_received_date: received ? new Date().toISOString() : undefined,
      kit_size: size || (target as any).kit_size || "M",
    };

    saveSharedPlayer(updated);
    invalidateCache("players");
    revalidatePath("/admin/players");
    revalidatePath("/parent/children");
    return { success: true };
  } catch (err) {
    console.error("Failed to toggle player kit:", err);
    return { success: false };
  }
}

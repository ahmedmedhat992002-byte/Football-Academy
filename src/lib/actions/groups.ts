"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { groupSchema, type GroupInput } from "@/lib/validations/groups";
import { INITIAL_GROUPS, type Group } from "@/lib/data/academy-store";

const GROUPS_STORAGE_COOKIE = "academy_custom_groups";

async function getStoredCustomGroups(): Promise<Group[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(GROUPS_STORAGE_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}

async function saveCustomGroups(groups: Group[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(GROUPS_STORAGE_COOKIE, encodeURIComponent(JSON.stringify(groups)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Fetch groups (optionally filtered by coach)
 */
export async function getGroups(coachId?: string): Promise<Group[]> {
  try {
    const supabase = await createClient();
    let query = (supabase.from("groups") as any)
      .select("*, coach:profiles!coach_id(full_name)")
      .order("created_at", { ascending: false });

    if (coachId) {
      query = query.eq("coach_id", coachId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((g: any) => ({
        ...g,
        coach_name: g.coach?.full_name || "غير محدد",
        players_count: g.players_count || 0,
      }));
    }
  } catch {
    // Fallback to local store
  }

  // Combine initial groups and custom cookie groups
  const customGroups = await getStoredCustomGroups();
  const allGroups = [...customGroups, ...INITIAL_GROUPS];

  // Remove duplicates by ID
  const uniqueGroups = Array.from(new Map(allGroups.map((g) => [g.id, g])).values());

  if (coachId) {
    return uniqueGroups.filter((g) => g.coach_id === coachId);
  }

  return uniqueGroups;
}

/**
 * Save / Create / Update group
 */
export async function saveGroup(
  input: GroupInput,
  groupId?: string
): Promise<{ success: boolean; error?: string; group?: Group }> {
  const parsed = groupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات المجموعة غير صحيحة",
    };
  }

  const { name, age_category, coach_id, training_days } = parsed.data;

  try {
    const supabase = await createClient();
    if (groupId) {
      const { data, error } = await (supabase.from("groups") as any)
        .update({
          name,
          age_category,
          coach_id: coach_id || null,
          training_days,
          updated_at: new Date().toISOString(),
        })
        .eq("id", groupId)
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/groups");
        revalidatePath("/coach/groups");
        return { success: true, group: data };
      }
    } else {
      const { data, error } = await (supabase.from("groups") as any)
        .insert({
          name,
          age_category,
          coach_id: coach_id || null,
          training_days,
        })
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/groups");
        revalidatePath("/coach/groups");
        return { success: true, group: data };
      }
    }
  } catch {
    // Fallback to cookie storage
  }

  // Update in local cookie storage
  const currentCustom = await getStoredCustomGroups();
  let updatedGroup: Group;

  if (groupId) {
    const existingIndex = currentCustom.findIndex((g) => g.id === groupId);
    updatedGroup = {
      id: groupId,
      name,
      age_category,
      coach_id: coach_id || null,
      coach_name: coach_id === "00000000-0000-0000-0000-000000000002" ? "كابتن محمود" : "كابتن أحمد",
      training_days,
      players_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      currentCustom[existingIndex] = updatedGroup;
    } else {
      currentCustom.unshift(updatedGroup);
    }
  } else {
    updatedGroup = {
      id: `group-${Date.now()}`,
      name,
      age_category,
      coach_id: coach_id || null,
      coach_name: coach_id === "00000000-0000-0000-0000-000000000002" ? "كابتن محمود" : "كابتن أحمد",
      training_days,
      players_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    currentCustom.unshift(updatedGroup);
  }

  await saveCustomGroups(currentCustom);

  revalidatePath("/admin/groups");
  revalidatePath("/coach/groups");

  return { success: true, group: updatedGroup };
}

/**
 * Delete a group by ID
 */
export async function deleteGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase.from("groups") as any).delete().eq("id", groupId);
    if (!error) {
      revalidatePath("/admin/groups");
      revalidatePath("/coach/groups");
      return { success: true };
    }
  } catch {
    // Fallback
  }

  const currentCustom = await getStoredCustomGroups();
  const filtered = currentCustom.filter((g) => g.id !== groupId);
  await saveCustomGroups(filtered);

  revalidatePath("/admin/groups");
  revalidatePath("/coach/groups");

  return { success: true };
}

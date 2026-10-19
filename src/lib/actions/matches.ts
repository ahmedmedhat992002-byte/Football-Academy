"use server";

import { revalidatePath } from "next/cache";
import { type AcademyMatch } from "@/lib/data/academy-store";
import {
  getSharedMatches,
  saveSharedMatch,
  deleteSharedMatch,
} from "@/lib/data/shared-store";
import { getGroups } from "@/lib/actions/groups";
import { addNotification } from "@/lib/actions/notifications";

export async function getMatches(options?: {
  groupId?: string;
  status?: string;
}): Promise<AcademyMatch[]> {
  try {
    const allMatches = getSharedMatches();
    const groups = await getGroups();
    const groupMap = new Map(groups.map((g) => [g.id, g.name]));

    let filtered = allMatches.map((m) => ({
      ...m,
      group_name: groupMap.get(m.group_id) || m.group_name || "الفريق الأساسي",
    }));

    if (options?.groupId && options.groupId !== "all") {
      filtered = filtered.filter((m) => m.group_id === options.groupId);
    }
    if (options?.status && options.status !== "all") {
      filtered = filtered.filter((m) => m.status === options.status);
    }

    // Sort by match_date desc
    filtered.sort(
      (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
    );

    return filtered;
  } catch (err) {
    console.error("Failed to get matches:", err);
    return [];
  }
}

export async function createMatch(
  data: Omit<AcademyMatch, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; data?: AcademyMatch; error?: string }> {
  try {
    const id = `match-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newMatch: AcademyMatch = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveSharedMatch(newMatch);

    // Add system notification
    try {
      await addNotification({
        title: "مباراة جديدة مجدولة 🏆",
        description: `تمت جدولة مباراة ضد (${newMatch.opponent}) بتاريخ ${newMatch.match_date}`,
        type: "session",
        href: "/admin/matches",
        targetRole: "all",
      });
    } catch {
      // Ignore notification error
    }

    revalidatePath("/admin/matches");
    revalidatePath("/coach/matches");
    revalidatePath("/parent");
    return { success: true, data: newMatch };
  } catch (err) {
    console.error("Failed to create match:", err);
    return { success: false, error: "تعذر إنشاء المباراة" };
  }
}

export async function updateMatch(
  id: string,
  data: Partial<AcademyMatch>
): Promise<{ success: boolean; data?: AcademyMatch; error?: string }> {
  try {
    const matches = getSharedMatches();
    const existing = matches.find((m) => m.id === id);
    if (!existing) {
      return { success: false, error: "المباراة غير موجودة" };
    }

    const updated: AcademyMatch = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };

    saveSharedMatch(updated);

    revalidatePath("/admin/matches");
    revalidatePath("/coach/matches");
    revalidatePath("/parent");
    return { success: true, data: updated };
  } catch (err) {
    console.error("Failed to update match:", err);
    return { success: false, error: "تعذر تعديل بيانات المباراة" };
  }
}

export async function deleteMatch(id: string): Promise<{ success: boolean }> {
  try {
    deleteSharedMatch(id);
    revalidatePath("/admin/matches");
    revalidatePath("/coach/matches");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete match:", err);
    return { success: false };
  }
}

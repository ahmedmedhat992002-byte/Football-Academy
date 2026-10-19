"use server";

import { revalidatePath } from "next/cache";
import { type PlayerBadge, type BadgeType } from "@/lib/data/academy-store";
import {
  getSharedBadges,
  saveSharedBadge,
  deleteSharedBadge,
} from "@/lib/data/shared-store";
import { getPlayers } from "@/lib/actions/players";
import { addNotification } from "@/lib/actions/notifications";

export const BADGE_DEFINITIONS: Record<
  BadgeType,
  { title: string; icon: string; description: string; color: string }
> = {
  star_of_week: {
    title: "نجم الأسبوع 🌟",
    icon: "🌟",
    description: "تألق استثنائي وأداء بطولي في تمارين ومباريات الأسبوع",
    color: "from-amber-400 to-yellow-500",
  },
  top_scorer: {
    title: "هداف التمرين ⚽",
    icon: "⚽",
    description: "أعلى دقة تسجيل وتأثير حاسم أمام المرمى",
    color: "from-blue-500 to-indigo-600",
  },
  wall_defense: {
    title: "حائط الصد 🛡️",
    icon: "🛡️",
    description: "استبسال دفاعي وقطع هجمات المنافس بذكاء وقوة",
    color: "from-emerald-500 to-teal-600",
  },
  iron_discipline: {
    title: "الأكثر التزاماً ⏱️",
    icon: "⏱️",
    description: "انضباط تام في المواعيد وحضور كافة الحصص والتركيز الكامل",
    color: "from-purple-500 to-pink-600",
  },
  fair_play: {
    title: "الروح الرياضية 🤝",
    icon: "🤝",
    description: "احترام الزملاء والمنافس والتعاون الإيجابي مع الكابتن",
    color: "from-cyan-500 to-blue-600",
  },
};

export async function getPlayerBadges(playerId?: string): Promise<PlayerBadge[]> {
  try {
    const all = getSharedBadges();
    const players = await getPlayers();
    const playerMap = new Map(players.map((p) => [p.id, p.full_name]));

    let list = all.map((b) => ({
      ...b,
      player_name: playerMap.get(b.player_id) || b.player_name || "اللاعب",
    }));

    if (playerId) {
      list = list.filter((b) => b.player_id === playerId);
    }

    list.sort(
      (a, b) => new Date(b.awarded_date).getTime() - new Date(a.awarded_date).getTime()
    );

    return list;
  } catch (err) {
    console.error("Failed to get badges:", err);
    return [];
  }
}

export async function awardBadge(
  data: Omit<PlayerBadge, "id" | "created_at">
): Promise<{ success: boolean; data?: PlayerBadge; error?: string }> {
  try {
    const id = `badge-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newBadge: PlayerBadge = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };

    saveSharedBadge(newBadge);

    try {
      await addNotification({
        title: `وسام شرف جديد: ${newBadge.badge_title}`,
        description: `تم تكريم البطل (${newBadge.player_name || "اللاعب"}) بوسام (${newBadge.badge_title}) تقديراً لجهوده!`,
        type: "evaluation",
        href: "/admin/evaluations",
        targetRole: "all",
      });
    } catch {
      // Ignore notification error
    }

    revalidatePath("/admin/players");
    revalidatePath("/admin/evaluations");
    revalidatePath("/coach/evaluations");
    revalidatePath("/parent/children");
    revalidatePath("/parent/report");
    return { success: true, data: newBadge };
  } catch (err) {
    console.error("Failed to award badge:", err);
    return { success: false, error: "تعذر منح الوسام" };
  }
}

export async function deleteBadge(id: string): Promise<{ success: boolean }> {
  try {
    deleteSharedBadge(id);
    revalidatePath("/admin/evaluations");
    revalidatePath("/coach/evaluations");
    revalidatePath("/parent/children");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete badge:", err);
    return { success: false };
  }
}

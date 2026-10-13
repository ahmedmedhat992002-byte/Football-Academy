"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  sessionSchema,
  generateSessionsSchema,
  type SessionInput,
  type GenerateSessionsInput,
} from "@/lib/validations/sessions";
import {
  INITIAL_SESSIONS,
  type Session,
} from "@/lib/data/academy-store";
import { getGroups } from "@/lib/actions/groups";

const SESSIONS_STORAGE_COOKIE = "academy_custom_sessions";

async function getStoredCustomSessions(): Promise<Session[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSIONS_STORAGE_COOKIE)?.value;
  if (!raw) return [];
  try {
    const list: Session[] = JSON.parse(decodeURIComponent(raw));
    return (Array.isArray(list) ? list : []).filter(
      (s) => !s.id?.startsWith("mock-") && !s.id?.startsWith("demo-")
    );
  } catch {
    try {
      const list: Session[] = JSON.parse(raw);
      return (Array.isArray(list) ? list : []).filter(
        (s) => !s.id?.startsWith("mock-") && !s.id?.startsWith("demo-")
      );
    } catch {
      return [];
    }
  }
}

async function saveCustomSessions(sessions: Session[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSIONS_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(sessions)),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    }
  );
}

/**
 * Fetch training sessions
 */
export async function getSessions(filters?: {
  groupId?: string;
  coachId?: string;
}): Promise<Session[]> {
  const groups = await getGroups();
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  try {
    const supabase = await createClient();
    let query = (supabase.from("sessions") as any)
      .select("*, group:groups!group_id(name, age_category, coach_id)")
      .order("session_date", { ascending: false });

    if (filters?.groupId) {
      query = query.eq("group_id", filters.groupId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((s: any) => ({
        ...s,
        group_name: s.group?.name || "مجموعة غير محددة",
        age_category: s.group?.age_category || "U10",
        coach_id: s.group?.coach_id || null,
        coach_name:
          s.group?.coach_id === "00000000-0000-0000-0000-000000000002"
            ? "كابتن محمود"
            : "كابتن أحمد",
      }));
    }
  } catch {
    // Fallback to local store
  }

  const customSessions = await getStoredCustomSessions();
  const allSessions = [...customSessions, ...INITIAL_SESSIONS];
  const uniqueSessions = Array.from(
    new Map(allSessions.map((s) => [s.id, s])).values()
  );

  // Enrich with group details
  const enriched = uniqueSessions.map((s) => {
    const g = groupMap.get(s.group_id);
    return {
      ...s,
      group_name: g?.name || s.group_name || "مجموعة تدريبية",
      age_category: g?.age_category || s.age_category || "U10",
      coach_id: g?.coach_id || s.coach_id || null,
      coach_name: g?.coach_name || s.coach_name || "المدرب المسؤول",
    };
  });

  return enriched.filter((s) => {
    if (filters?.groupId && s.group_id !== filters.groupId) return false;
    if (filters?.coachId && s.coach_id !== filters.coachId) return false;
    return true;
  });
}

/**
 * Fetch a single session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  const sessions = await getSessions();
  return sessions.find((s) => s.id === sessionId) || null;
}

/**
 * Save / Create / Update a single session
 */
export async function saveSession(
  input: SessionInput,
  sessionId?: string
): Promise<{ success: boolean; error?: string; session?: Session }> {
  const parsed = sessionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات الحصة غير صحيحة",
    };
  }

  const { group_id, session_date, start_time, end_time, location, notes } =
    parsed.data;

  const groups = await getGroups();
  const group = groups.find((g) => g.id === group_id);

  try {
    const supabase = await createClient();
    if (sessionId) {
      const { data, error } = await (supabase.from("sessions") as any)
        .update({
          group_id,
          session_date,
          start_time,
          end_time,
          location,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/sessions");
        revalidatePath("/coach/sessions");
        return { success: true, session: data };
      }
    } else {
      const { data, error } = await (supabase.from("sessions") as any)
        .insert({
          group_id,
          session_date,
          start_time,
          end_time,
          location,
          notes: notes || null,
        })
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/sessions");
        revalidatePath("/coach/sessions");
        return { success: true, session: data };
      }
    }
  } catch {
    // Fallback to local cookie storage
  }

  const customSessions = await getStoredCustomSessions();
  let updatedSession: Session;

  if (sessionId) {
    const existingIndex = customSessions.findIndex((s) => s.id === sessionId);
    updatedSession = {
      id: sessionId,
      group_id,
      group_name: group?.name || "مجموعة التدريب",
      age_category: group?.age_category || "U10",
      coach_id: group?.coach_id || null,
      coach_name: group?.coach_name || "كابتن محمود",
      session_date,
      start_time,
      end_time,
      location,
      notes: notes || null,
      total_players: group?.players_count || 0,
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      excused_count: 0,
      attendance_taken: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      customSessions[existingIndex] = updatedSession;
    } else {
      customSessions.unshift(updatedSession);
    }
  } else {
    updatedSession = {
      id: `session-${Date.now()}`,
      group_id,
      group_name: group?.name || "مجموعة التدريب",
      age_category: group?.age_category || "U10",
      coach_id: group?.coach_id || null,
      coach_name: group?.coach_name || "كابتن محمود",
      session_date,
      start_time,
      end_time,
      location,
      notes: notes || null,
      total_players: group?.players_count || 0,
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      excused_count: 0,
      attendance_taken: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customSessions.unshift(updatedSession);
  }

  await saveCustomSessions(customSessions);

  revalidatePath("/admin/sessions");
  revalidatePath("/coach/sessions");

  return { success: true, session: updatedSession };
}

/**
 * Day name mapper for recurring generation
 */
const DAY_INDEX_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Generate recurring training sessions for a group based on its weekly days
 */
export async function generateRecurringSessionsAction(
  input: GenerateSessionsInput
): Promise<{ success: boolean; count?: number; error?: string }> {
  const parsed = generateSessionsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات توليد الحصص غير مكتملة",
    };
  }

  const { group_id, start_date, end_date, location, start_time, end_time } =
    parsed.data;

  const groups = await getGroups();
  const group = groups.find((g) => g.id === group_id);
  if (!group) {
    return { success: false, error: "المجموعة المحددة غير موجودة" };
  }

  const trainingDays = group.training_days || ["Sunday", "Tuesday"];
  const targetDays = new Set(trainingDays.map((d) => DAY_INDEX_MAP[d]));

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (startDate > endDate) {
    return {
      success: false,
      error: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
    };
  }

  const generatedList: Session[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (targetDays.has(dayOfWeek)) {
      const dateStr = currentDate.toISOString().split("T")[0];
      generatedList.push({
        id: `gen-session-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        group_id,
        group_name: group.name,
        age_category: group.age_category,
        coach_id: group.coach_id,
        coach_name: group.coach_name || "كابتن محمود",
        session_date: dateStr,
        start_time,
        end_time,
        location,
        notes: `حصة تدريبية دورية (${group.name})`,
        total_players: group.players_count || 14,
        present_count: 0,
        absent_count: 0,
        late_count: 0,
        excused_count: 0,
        attendance_taken: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (generatedList.length === 0) {
    return {
      success: false,
      error: "لم يتم العثور على أي أيام تدريب مطابقة في الفترة الزمنية المختارة",
    };
  }

  const customSessions = await getStoredCustomSessions();
  const combined = [...generatedList, ...customSessions];
  await saveCustomSessions(combined);

  revalidatePath("/admin/sessions");
  revalidatePath("/coach/sessions");

  return { success: true, count: generatedList.length };
}

/**
 * Delete a session
 */
export async function deleteSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase.from("sessions") as any)
      .delete()
      .eq("id", sessionId);
    if (!error) {
      revalidatePath("/admin/sessions");
      revalidatePath("/coach/sessions");
      return { success: true };
    }
  } catch {
    // Fallback
  }

  const customSessions = await getStoredCustomSessions();
  const filtered = customSessions.filter((s) => s.id !== sessionId);
  await saveCustomSessions(filtered);

  revalidatePath("/admin/sessions");
  revalidatePath("/coach/sessions");

  return { success: true };
}

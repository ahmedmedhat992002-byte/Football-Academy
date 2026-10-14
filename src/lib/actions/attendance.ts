"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  attendanceBatchSchema,
  type AttendanceBatchInput,
  type AttendanceStatus,
} from "@/lib/validations/attendance";
import {
  INITIAL_ATTENDANCE,
  type AttendanceRecord,
  type Session,
} from "@/lib/data/academy-store";
import { getPlayers } from "@/lib/actions/players";
import { getSessionById } from "@/lib/actions/sessions";

const ATTENDANCE_STORAGE_COOKIE = "academy_custom_attendance";

async function getStoredCustomAttendance(): Promise<AttendanceRecord[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ATTENDANCE_STORAGE_COOKIE)?.value;
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

async function saveCustomAttendance(records: AttendanceRecord[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    ATTENDANCE_STORAGE_COOKIE,
    encodeURIComponent(JSON.stringify(records)),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    }
  );
}

export interface PlayerAttendanceRow {
  playerId: string;
  playerName: string;
  status: AttendanceStatus;
  note: string;
  emergencyPhone: string;
}

/**
 * Fetch attendance roster for a specific session
 */
export async function getAttendanceRosterForSession(
  sessionId: string
): Promise<{
  session: Session | null;
  roster: PlayerAttendanceRow[];
}> {
  const session = await getSessionById(sessionId);
  if (!session) {
    return { session: null, roster: [] };
  }

  // Get all active players in this group
  const allPlayers = await getPlayers({ groupId: session.group_id });
  const activePlayers = allPlayers.filter((p) => p.status === "active");

  // Get any existing attendance records
  let existingRecords: AttendanceRecord[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("session_id", sessionId);
    if (!error && data && data.length > 0) {
      existingRecords = data;
    }
  } catch {
    // Fallback
  }

  if (existingRecords.length === 0) {
    const customAttendance = await getStoredCustomAttendance();
    const allAttendance = [...customAttendance, ...INITIAL_ATTENDANCE];
    existingRecords = allAttendance.filter((a) => a.session_id === sessionId);
  }

  const recordMap = new Map(existingRecords.map((r) => [r.player_id, r]));

  const roster: PlayerAttendanceRow[] = activePlayers.map((player) => {
    const existing = recordMap.get(player.id);
    return {
      playerId: player.id,
      playerName: player.full_name,
      status: (existing?.status as AttendanceStatus) || "present",
      note: existing?.note || "",
      emergencyPhone: player.emergency_phone || "",
    };
  });

  return { session, roster };
}

/**
 * Save batch attendance for a session
 */
export async function saveAttendanceBatchAction(
  input: AttendanceBatchInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = attendanceBatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات الحضور غير مكتملة",
    };
  }

  const { session_id, records } = parsed.data;

  // Try saving to Supabase
  try {
    const supabase = await createClient();
    const upsertRows = records.map((r) => ({
      session_id,
      player_id: r.player_id,
      status: r.status,
      note: r.note || null,
    }));

    const { error } = await supabase.from("attendance").upsert(
      upsertRows,
      { onConflict: "session_id,player_id" }
    );

    if (!error) {
      revalidatePath(`/coach/attendance/${session_id}`);
      revalidatePath(`/admin/attendance/${session_id}`);
      revalidatePath("/admin/sessions");
      revalidatePath("/coach/sessions");
      return { success: true };
    }
  } catch {
    // Fallback to cookie storage
  }

  // Update in local custom storage
  const currentCustom = await getStoredCustomAttendance();
  const filtered = currentCustom.filter((r) => r.session_id !== session_id);

  const newRecords: AttendanceRecord[] = records.map((r) => ({
    id: `att-${session_id}-${r.player_id}`,
    session_id,
    player_id: r.player_id,
    status: r.status,
    note: r.note || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const updatedRecords = [...newRecords, ...filtered];
  await saveCustomAttendance(updatedRecords);

  revalidatePath(`/coach/attendance/${session_id}`);
  revalidatePath(`/admin/attendance/${session_id}`);
  revalidatePath("/admin/sessions");
  revalidatePath("/coach/sessions");

  return { success: true };
}

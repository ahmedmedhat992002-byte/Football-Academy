"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { coachRegisterSchema, type CoachRegisterInput } from "@/lib/validations/auth";
import { addNotification } from "@/lib/actions/notifications";
import { createFirebaseUser } from "@/lib/firebase/auth-service";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  getFirebaseCoaches,
  saveFirebaseCoach,
  updateFirebaseCoachStatus,
} from "@/lib/firebase/firestore-service";
import {
  deleteSharedRegisteredUser,
  updateSharedRegisteredUser,
  getSharedCoaches,
  saveAllSharedCoaches,
} from "@/lib/data/shared-store";
import {
  unassignCoachFromAllGroups,
  updateCoachNameInAllGroups,
} from "@/lib/actions/groups";
import {
  unassignCoachFromAllSessions,
  updateCoachNameInAllSessions,
} from "@/lib/actions/sessions";
import {
  unassignCoachFromAllEvaluations,
} from "@/lib/actions/evaluations";
import type { CoachStatus, CoachProfile } from "@/lib/data/academy-store";

export type { CoachStatus, CoachProfile };

const COACHES_STORAGE_COOKIE = "academy_coaches_storage";

const INITIAL_COACHES: CoachProfile[] = [
  {
    id: "00000000-0000-0000-0000-000000000002",
    full_name: "كابتن محمود السعدني",
    email: "coach@academy.com",
    phone: "01098765432",
    password: "coach123",
    specialization: "المدير الفني للبراعم (U10 & U12) — رخصة CAF B",
    status: "approved",
    experience_years: "7 سنوات",
    bio: "خبرة واسعة في التأسيس المهاري والبدني للفئات السنية المبكرة وصقل مهارات المراوغة والتمرير.",
    assigned_groups: ["فريق النجوم (U10)", "فريق الأبطال (U12)"],
    created_at: "2026-01-01T00:00:00Z",
    show_on_landing: true,
  },
  {
    id: "coach-ahmed-003",
    full_name: "كابتن أحمد مدحت",
    email: "ahmed.medhat@academy.com",
    phone: "01000419832",
    password: "coach123",
    specialization: "مدرب اللياقة والتأهيل البدني والحركي",
    status: "approved",
    experience_years: "6 سنوات",
    bio: "أخصائي الإعداد البدني والتوافق العضلي للفئات السنية، حاصل على دبلومة اللياقة التخصصية من برشلونة.",
    assigned_groups: ["لياقة وإعداد بدني عام"],
    created_at: "2026-01-15T00:00:00Z",
    show_on_landing: true,
  },
  {
    id: "coach-gk-002",
    full_name: "كابتن حسام حسن",
    email: "hossam.gk@academy.com",
    phone: "01123456789",
    password: "coach123",
    specialization: "مدرب حراس المرمى المعتمد",
    status: "approved",
    experience_years: "5 سنوات",
    bio: "تطوير ردود الأفعال، التمركز الصحيح والتصدي للكرات العرضية لحراس كافة الفئات السنية.",
    assigned_groups: ["تدريبات الحراس التخصصية"],
    created_at: "2026-02-15T00:00:00Z",
    show_on_landing: true,
  },
];

export async function getStoredCoaches(): Promise<CoachProfile[]> {
  const shared = getSharedCoaches();
  const cookieStore = await cookies();
  const raw = cookieStore.get(COACHES_STORAGE_COOKIE)?.value;
  let fromCookies: CoachProfile[] = [];
  if (raw) {
    try {
      fromCookies = JSON.parse(decodeURIComponent(raw));
    } catch {
      try {
        fromCookies = JSON.parse(raw);
      } catch {
        fromCookies = [];
      }
    }
  }

  const map = new Map<string, CoachProfile>();
  [...(Array.isArray(shared) ? shared : []), ...(Array.isArray(fromCookies) ? fromCookies : [])].forEach((c) => {
    if (c?.id) map.set(c.id, c);
  });
  return Array.from(map.values());
}

export async function saveStoredCoaches(coaches: CoachProfile[]): Promise<void> {
  saveAllSharedCoaches(coaches);
  const cookieStore = await cookies();
  cookieStore.set(COACHES_STORAGE_COOKIE, encodeURIComponent(JSON.stringify(coaches)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
  });
}

const COACHES_DELETED_COOKIE = "academy_coaches_deleted";
const COACHES_DELETED_EMAILS_COOKIE = "academy_coaches_deleted_emails";
const REGISTERED_USERS_COOKIE = "academy_registered_users";

export async function getDeletedCoachIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COACHES_DELETED_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

export async function saveDeletedCoachIds(ids: string[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COACHES_DELETED_COOKIE, encodeURIComponent(JSON.stringify(ids)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
  });
}

export async function getDeletedCoachEmails(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COACHES_DELETED_EMAILS_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed.map((e: string) => String(e).toLowerCase().trim()) : [];
  } catch {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((e: string) => String(e).toLowerCase().trim()) : [];
    } catch {
      return [];
    }
  }
}

export async function saveDeletedCoachEmails(emails: string[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COACHES_DELETED_EMAILS_COOKIE, encodeURIComponent(JSON.stringify(emails)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
  });
}

async function purgeCoachAuthAndSession(coachId: string, email?: string): Promise<void> {
  const normId = coachId ? coachId.trim() : "";
  const normEmail = (email || coachId).trim().toLowerCase();

  // 1. Purge from shared store (memory and disk file)
  if (normId) deleteSharedRegisteredUser(normId);
  if (normEmail && normEmail !== normId) deleteSharedRegisteredUser(normEmail);

  // 2. Purge from registered users cookie
  const cookieStore = await cookies();
  const raw = cookieStore.get(REGISTERED_USERS_COOKIE)?.value;
  if (raw) {
    try {
      let fromCookies: any[] = [];
      try {
        fromCookies = JSON.parse(decodeURIComponent(raw));
      } catch {
        fromCookies = JSON.parse(raw);
      }
      if (Array.isArray(fromCookies)) {
        const filtered = fromCookies.filter((u) => {
          if (normId && u.id === normId) return false;
          if (normEmail && u.email?.toLowerCase() === normEmail) return false;
          return true;
        });
        cookieStore.set(REGISTERED_USERS_COOKIE, encodeURIComponent(JSON.stringify(filtered)), {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 60,
        });
      }
    } catch {
      // Ignore
    }
  }

  // 3. Clear active demo session if this coach is currently logged in
  const demoCookie = cookieStore.get("academy_demo_user");
  if (demoCookie?.value) {
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(decodeURIComponent(demoCookie.value));
      } catch {
        parsed = JSON.parse(demoCookie.value);
      }
      if (
        (normId && parsed?.id === normId) ||
        (normEmail && parsed?.email?.toLowerCase() === normEmail)
      ) {
        cookieStore.delete("academy_demo_user");
      }
    } catch {
      // Ignore
    }
  }
}

async function updateCoachAuthAndSession(
  coachId: string,
  oldEmail: string,
  updated: { email: string; fullName: string; phone?: string; password?: string }
): Promise<void> {
  const normId = coachId.trim();
  const normOldEmail = oldEmail.trim().toLowerCase();
  const normNewEmail = updated.email.trim().toLowerCase();

  // 1. Update in shared store
  updateSharedRegisteredUser(normId, {
    email: normNewEmail,
    fullName: updated.fullName,
    phone: updated.phone,
    passwordHash: updated.password,
  });
  if (normOldEmail && normOldEmail !== normId) {
    updateSharedRegisteredUser(normOldEmail, {
      email: normNewEmail,
      fullName: updated.fullName,
      phone: updated.phone,
      passwordHash: updated.password,
    });
  }

  // 2. Update registered users cookie
  const cookieStore = await cookies();
  const raw = cookieStore.get(REGISTERED_USERS_COOKIE)?.value;
  if (raw) {
    try {
      let fromCookies: any[] = [];
      try {
        fromCookies = JSON.parse(decodeURIComponent(raw));
      } catch {
        fromCookies = JSON.parse(raw);
      }
      if (Array.isArray(fromCookies)) {
        let matched = false;
        const modified = fromCookies.map((u) => {
          if (
            (normId && u.id === normId) ||
            (normOldEmail && u.email?.toLowerCase() === normOldEmail) ||
            (normNewEmail && u.email?.toLowerCase() === normNewEmail)
          ) {
            matched = true;
            return {
              ...u,
              email: normNewEmail,
              fullName: updated.fullName,
              phone: updated.phone ?? u.phone,
              passwordHash: updated.password ?? u.passwordHash,
            };
          }
          return u;
        });
        if (matched) {
          cookieStore.set(REGISTERED_USERS_COOKIE, encodeURIComponent(JSON.stringify(modified)), {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 60,
          });
        }
      }
    } catch {
      // Ignore
    }
  }

  // 3. Update active session if this coach is logged in
  const demoCookie = cookieStore.get("academy_demo_user");
  if (demoCookie?.value) {
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(decodeURIComponent(demoCookie.value));
      } catch {
        parsed = JSON.parse(demoCookie.value);
      }
      if (
        (normId && parsed?.id === normId) ||
        (normOldEmail && parsed?.email?.toLowerCase() === normOldEmail)
      ) {
        const newSession = {
          ...parsed,
          email: normNewEmail,
          fullName: updated.fullName,
          phone: updated.phone ?? parsed.phone,
        };
        cookieStore.set("academy_demo_user", JSON.stringify(newSession), {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
    } catch {
      // Ignore
    }
  }
}

/**
 * Get all coaches combined (initial + custom stored)
 */
export async function getCoaches(): Promise<CoachProfile[]> {
  const deletedIds = await getDeletedCoachIds();
  const deletedEmails = await getDeletedCoachEmails();
  const isAllowed = (c: CoachProfile) =>
    !deletedIds.includes(c.id) &&
    !deletedEmails.includes((c.email || "").toLowerCase().trim());

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "coach");
    if (!error && data && data.length > 0) {
      // Map supabase profiles
      const dbCoaches: CoachProfile[] = data.map((p) => {
        const extra = p as unknown as Record<string, unknown>;
        return {
          id: p.id,
          full_name: p.full_name,
          email: String(extra.email || `${p.id}@academy.com`),
          phone: p.phone || "غير محدد",
          specialization: String(extra.specialization || "مدرب فني"),
          status: (extra.status as CoachStatus) || "approved",
          created_at: p.created_at || new Date().toISOString(),
        };
      });

      const stored = await getStoredCoaches();
      const map = new Map<string, CoachProfile>();
      [...INITIAL_COACHES, ...dbCoaches, ...stored].forEach((c) => {
        if (isAllowed(c)) {
          map.set(c.id, c);
        }
      });
      return Array.from(map.values());
    }
  } catch {
    // Fallback to local
  }

  // 2. Try Supabase Auth Admin listUsers (works across all devices)
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
      if (!listError && usersData?.users) {
        const cloudCoaches: CoachProfile[] = usersData.users
          .filter((u) => u.user_metadata?.role === "coach")
          .map((u) => ({
            id: u.id,
            full_name: u.user_metadata?.full_name || u.email || "كابتن",
            email: u.email || "",
            phone: u.user_metadata?.phone || "غير محدد",
            specialization: u.user_metadata?.specialization || "مدرب فني",
            status: (u.user_metadata?.status as CoachStatus) || "pending_approval",
            experience_years: u.user_metadata?.experience_years || "غير محدد",
            bio: u.user_metadata?.bio || "مدرب معتمد بالأكاديمية",
            created_at: u.created_at,
          }));

        const stored = await getStoredCoaches();
        const map = new Map<string, CoachProfile>();
        [...INITIAL_COACHES, ...cloudCoaches, ...stored].forEach((c) => {
          if (isAllowed(c)) {
            map.set(c.id, c);
          }
        });
        return Array.from(map.values());
      }
    }
  } catch {
    // Fallback
  }

  const fbCoachesRaw = await getFirebaseCoaches();
  const fbCoaches: CoachProfile[] = fbCoachesRaw.map((c) => ({
    id: c.id,
    full_name: c.full_name || "كابتن",
    email: c.email || `${c.id}@academy.com`,
    phone: c.phone || "غير محدد",
    specialization: c.specialization || "مدرب فني",
    status: (c.status as CoachStatus) || "approved",
    experience_years:
      typeof c.experience_years === "number"
        ? `${c.experience_years} سنوات`
        : c.experience_years || undefined,
    bio: c.bio || undefined,
    created_at: c.created_at || new Date().toISOString(),
  }));
  const stored = await getStoredCoaches();
  const map = new Map<string, CoachProfile>();
  [...INITIAL_COACHES, ...fbCoaches, ...stored].forEach((c) => {
    if (isAllowed(c)) {
      map.set(c.id, c);
    }
  });
  return Array.from(map.values());
}

/**
 * Register a new coach request (Status: pending_approval)
 */
export async function registerCoachAction(
  data: CoachRegisterInput
): Promise<{ success: boolean; error?: string; message?: string; coach?: CoachProfile }> {
  const parsed = coachRegisterSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "يرجى استكمال جميع البيانات المطلوبة",
    };
  }

  const { fullName, email, phone, password, specialization, experienceYears, bio } = parsed.data;

  // Check if email already registered
  const existing = await getCoaches();
  if (existing.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
    return {
      success: false,
      error: "هذا البريد الإلكتروني مسجل بالفعل لمدرب آخر",
    };
  }

  // Register in Supabase Auth Cloud
  let supabaseUid: string | undefined;
  try {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://football-academy-rho.vercel.app";
    const { data: sbAuth, error: sbError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/login?verified=true`,
        data: {
          full_name: fullName,
          phone,
          specialization,
          experience_years: experienceYears,
          role: "coach",
          status: "pending_approval",
        },
      },
    });
    if (sbError) {
      const errMsg = sbError.message.toLowerCase();
      if (errMsg.includes("already registered") || errMsg.includes("already exists")) {
        return { success: false, error: "عنوان بريد Gmail هذا مسجل بالفعل مسبقاً لمدرب آخر" };
      }
    }
    if (sbAuth?.user) {
      supabaseUid = sbAuth.user.id;
    }
  } catch (sbErr) {
    console.warn("Supabase coach signup fallback:", sbErr);
  }

  let firebaseUid: string | undefined;
  if (isFirebaseConfigured) {
    try {
      const fbResult = await createFirebaseUser({
        email,
        password,
        fullName,
        phone,
        role: "coach",
        specialization,
        experienceYears,
      });
      if (fbResult.success) {
        firebaseUid = fbResult.uid;
      } else if (fbResult.error?.includes("مسجل بالفعل")) {
        return { success: false, error: fbResult.error };
      }
    } catch (fbErr) {
      console.warn("Firebase coach registration fallback:", fbErr);
    }
  }

  const newCoach: CoachProfile = {
    id: supabaseUid || firebaseUid || `coach-${Date.now()}`,
    full_name: fullName,
    email: email.toLowerCase(),
    phone,
    password,
    specialization,
    experience_years: experienceYears || "غير محدد",
    bio: bio || `طلب انضمام جديد كمدرب — تخصص: ${specialization}`,
    status: "pending_approval",
    created_at: new Date().toISOString(),
  };

  const stored = await getStoredCoaches();
  await saveStoredCoaches([newCoach, ...stored]);

  // Persist to Cloud Firestore for cross-device sync
  if (isFirebaseConfigured) {
    await saveFirebaseCoach(newCoach);
  }

  // Dispatch live high-priority notification to Admin
  await addNotification({
    title: "طلب انضمام كابتن جديد للجهاز الفني! ⚽",
    description: `سجّل الكابتن (${fullName}) للانضمام كمدرب (${specialization}) — الهاتف: ${phone}. يتطلب موافقتك واعتمادك لفتح الحساب.`,
    type: "registration",
    href: "/admin/coaches",
    targetRole: "admin",
  });

  revalidatePath("/admin/coaches");
  revalidatePath("/admin");

  return {
    success: true,
    message: "تم إرسال طلب انضمامك كمدرب بنجاح وهو بانتظار مراجعة واعتماد مدير الأكاديمية.",
    coach: newCoach,
  };
}

/**
 * Approve a pending coach (Admin action)
 */
export async function approveCoachAction(
  coachId: string
): Promise<{ success: boolean; error?: string }> {
  const coaches = await getCoaches();
  const coach = coaches.find((c) => c.id === coachId);

  if (!coach) {
    return { success: false, error: "المدرب غير موجود" };
  }

  const stored = await getStoredCoaches();
  const index = stored.findIndex((c) => c.id === coachId);

  if (index >= 0) {
    stored[index].status = "approved";
    await saveStoredCoaches(stored);
  } else {
    // If it was in initial coaches or external
    const updated = { ...coach, status: "approved" as const };
    await saveStoredCoaches([updated, ...stored]);
  }

  // Update in Cloud Firestore
  if (isFirebaseConfigured) {
    await updateFirebaseCoachStatus(coachId, "approved");
  }

  // Update in Supabase Auth
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      await adminClient.auth.admin.updateUserById(coachId, {
        user_metadata: { status: "approved" },
      });
    }
  } catch (err) {
    console.warn("Supabase approve user fallback:", err);
  }

  // Live notification to the coach
  await addNotification({
    title: "تم اعتماد حسابك التدريبي بنجاح! ⚽🎉",
    description: `قام مدير الأكاديمية باعتماد انضمامك للجهاز الفني. يمكنك الآن تسجيل الدخول واستلام كشوفات المجموعات والحصص.`,
    type: "registration",
    href: "/coach",
    targetRole: "coach",
  });

  revalidatePath("/admin/coaches");
  revalidatePath("/admin");
  revalidatePath("/coach");

  return { success: true };
}

/**
 * Reject a coach request (Admin action)
 */
export async function rejectCoachAction(
  coachId: string,
  _reason?: string
): Promise<{ success: boolean; error?: string }> {
  const stored = await getStoredCoaches();
  const index = stored.findIndex((c) => c.id === coachId);

  if (index >= 0) {
    stored[index].status = "rejected";
    await saveStoredCoaches(stored);
  } else {
    const coaches = await getCoaches();
    const coach = coaches.find((c) => c.id === coachId);
    if (coach) {
      const updated = { ...coach, status: "rejected" as const };
      await saveStoredCoaches([updated, ...stored]);
    }
  }

  if (isFirebaseConfigured) {
    await updateFirebaseCoachStatus(coachId, "rejected");
  }

  // Update in Supabase Auth
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      await adminClient.auth.admin.updateUserById(coachId, {
        user_metadata: { status: "rejected" },
      });
    }
  } catch (err) {
    console.warn("Supabase reject user fallback:", err);
  }

  revalidatePath("/admin/coaches");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Add or edit coach directly by Admin (Pre-approved) with complete cascade across the website
 */
export async function saveCoachAction(
  coachData: Partial<CoachProfile> & { full_name: string; email: string; phone: string; specialization: string }
): Promise<{ success: boolean; error?: string; coach?: CoachProfile }> {
  try {
    const stored = await getStoredCoaches();
    const newEmail = coachData.email.toLowerCase().trim();
    const newName = coachData.full_name.trim();

    if (coachData.id) {
      const all = await getCoaches();
      const existing = all.find((c) => c.id === coachData.id);
      const oldEmail = existing?.email?.toLowerCase().trim() || "";
      const oldName = existing?.full_name?.trim() || "";

      let updatedCoach: CoachProfile;
      const index = stored.findIndex(
        (c) => c.id === coachData.id || (oldEmail && c.email?.toLowerCase().trim() === oldEmail)
      );

      if (index >= 0) {
        stored[index] = {
          ...stored[index],
          ...coachData,
          email: newEmail,
          full_name: newName,
        };
        updatedCoach = stored[index];
        await saveStoredCoaches(stored);
      } else {
        updatedCoach = {
          ...(existing || {}),
          id: coachData.id,
          full_name: newName,
          email: newEmail,
          phone: coachData.phone || existing?.phone || "غير محدد",
          password: coachData.password || existing?.password || "coach123",
          specialization: coachData.specialization || existing?.specialization || "مدرب فني",
          experience_years: coachData.experience_years || existing?.experience_years || "3 سنوات",
          bio: coachData.bio || existing?.bio || "مدرب معتمد بالجهاز الفني للأكاديمية",
          status: coachData.status || existing?.status || "approved",
          show_on_landing:
            coachData.show_on_landing !== undefined
              ? coachData.show_on_landing
              : (existing?.show_on_landing ?? true),
          created_at: existing?.created_at || new Date().toISOString(),
        };
        await saveStoredCoaches([updatedCoach, ...stored]);
      }

      // 1. Unblock new email if it was previously in deleted emails blacklist
      const deletedEmails = await getDeletedCoachEmails();
      if (deletedEmails.includes(newEmail)) {
        await saveDeletedCoachEmails(deletedEmails.filter((e) => e !== newEmail));
      }

      // 2. Cascade: Update Auth & Registered Users & active session
      await updateCoachAuthAndSession(coachData.id, oldEmail, {
        email: newEmail,
        fullName: newName,
        phone: coachData.phone,
        password: coachData.password,
      });

      // 3. Cascade: Propagate name changes across all Groups and Sessions
      if (oldName && oldName !== newName) {
        await updateCoachNameInAllGroups(coachData.id, newName, oldName);
        await updateCoachNameInAllSessions(coachData.id, newName, oldName);
      }

      // 4. Update in Supabase Auth & profiles table
      try {
        const adminClient = createAdminClient();
        if (adminClient) {
          await adminClient.auth.admin.updateUserById(coachData.id, {
            email: newEmail,
            password: coachData.password || undefined,
            user_metadata: {
              full_name: newName,
              phone: coachData.phone,
              specialization: coachData.specialization,
              experience_years: coachData.experience_years,
              bio: coachData.bio,
            },
          });
        }
        const supabase = await createClient();
        await (supabase.from("profiles") as any)
          .update({
            full_name: newName,
            phone: coachData.phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", coachData.id);
      } catch (err) {
        console.warn("Supabase coach update fallback:", err);
      }

      revalidatePath("/admin/coaches");
      revalidatePath("/admin/groups");
      revalidatePath("/admin/sessions");
      revalidatePath("/admin");
      revalidatePath("/coach");
      revalidatePath("/coach/groups");
      revalidatePath("/coach/sessions");
      revalidatePath("/");

      return { success: true, coach: updatedCoach };
    }

    // New Coach Creation directly by Admin
    const newCoach: CoachProfile = {
      id: coachData.id || `coach-${Date.now()}`,
      full_name: newName,
      email: newEmail,
      phone: coachData.phone,
      password: coachData.password || "coach123",
      specialization: coachData.specialization,
      experience_years: coachData.experience_years || "3 سنوات",
      bio: coachData.bio || "مدرب معتمد بالجهاز الفني للأكاديمية",
      status: coachData.status || "approved",
      show_on_landing:
        coachData.show_on_landing !== undefined ? coachData.show_on_landing : true,
      created_at: new Date().toISOString(),
    };

    // Remove email from deleted emails if re-adding
    const deletedEmails = await getDeletedCoachEmails();
    if (deletedEmails.includes(newEmail)) {
      await saveDeletedCoachEmails(deletedEmails.filter((e) => e !== newEmail));
    }

    await saveStoredCoaches([newCoach, ...stored]);

    // Also register in shared registered users so coach can log in immediately
    await updateCoachAuthAndSession(newCoach.id, "", {
      email: newEmail,
      fullName: newName,
      phone: newCoach.phone,
      password: newCoach.password,
    });

    revalidatePath("/admin/coaches");
    revalidatePath("/admin/groups");
    revalidatePath("/admin/sessions");
    revalidatePath("/admin");
    revalidatePath("/coach");
    revalidatePath("/");

    return { success: true, coach: newCoach };
  } catch (err) {
    console.error("Failed to save coach:", err);
    return { success: false, error: "حدث خطأ أثناء حفظ بيانات المدرب" };
  }
}

/**
 * Delete a coach completely (Admin action) with total cascade across the website
 */
export async function deleteCoachAction(
  coachId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Identify coach details before deletion
    const all = await getCoaches();
    const target = all.find((c) => c.id === coachId);
    const coachEmail = target?.email?.toLowerCase().trim() || "";
    const coachName = target?.full_name?.trim() || "";

    // 2. Remove from stored coaches
    const stored = await getStoredCoaches();
    const filteredStored = stored.filter(
      (c) => c.id !== coachId && (!coachEmail || c.email?.toLowerCase().trim() !== coachEmail)
    );
    await saveStoredCoaches(filteredStored);

    // 3. Add to deleted IDs and deleted Emails blacklist
    const deletedIds = await getDeletedCoachIds();
    if (!deletedIds.includes(coachId)) {
      await saveDeletedCoachIds([...deletedIds, coachId]);
    }
    if (coachEmail) {
      const deletedEmails = await getDeletedCoachEmails();
      if (!deletedEmails.includes(coachEmail)) {
        await saveDeletedCoachEmails([...deletedEmails, coachEmail]);
      }
    }

    // 4. Purge from Authentication (registered users and active session)
    await purgeCoachAuthAndSession(coachId, coachEmail);

    // 5. Cascade disassociate from all Groups
    await unassignCoachFromAllGroups(coachId, coachName);

    // 6. Cascade disassociate from all Sessions
    await unassignCoachFromAllSessions(coachId, coachName);

    // 7. Cascade disassociate from all Evaluations
    await unassignCoachFromAllEvaluations(coachId);

    // 8. Delete in Supabase Auth & profiles table
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        await adminClient.auth.admin.deleteUser(coachId);
      }
      const supabase = await createClient();
      await supabase.from("profiles").delete().eq("id", coachId);
    } catch (err) {
      console.warn("Supabase coach deletion fallback:", err);
    }

    // 9. Notification to Admin
    await addNotification({
      title: "تم حذف مدرب وتطهير بريده بالكامل 🗑️",
      description: `قام مدير الأكاديمية بحذف حساب الكابتن (${coachName || coachEmail}) وتطهير بريده وفك ارتباطه بكافة المجموعات والحصص والتقييمات بنجاح.`,
      type: "registration",
      href: "/admin/coaches",
      targetRole: "admin",
    });

    revalidatePath("/admin/coaches");
    revalidatePath("/admin/groups");
    revalidatePath("/admin/sessions");
    revalidatePath("/admin/evaluations");
    revalidatePath("/admin");
    revalidatePath("/coach");
    revalidatePath("/coach/groups");
    revalidatePath("/coach/sessions");
    revalidatePath("/coach/evaluations");
    revalidatePath("/parent");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Failed to delete coach:", err);
    return { success: false, error: "حدث خطأ أثناء حذف المدرب" };
  }
}

/**
 * Toggle whether a coach is featured on the public landing page (#coaches section)
 */
export async function toggleCoachShowOnLandingAction(
  coachId: string,
  showOnLanding: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const coaches = await getStoredCoaches();
    const targetIndex = coaches.findIndex((c) => c.id === coachId);

    if (targetIndex >= 0) {
      coaches[targetIndex] = {
        ...coaches[targetIndex],
        show_on_landing: showOnLanding,
      };
      await saveStoredCoaches(coaches);
    } else {
      const allCoaches = await getCoaches();
      const existing = allCoaches.find((c) => c.id === coachId);
      if (existing) {
        const updated: CoachProfile = {
          ...existing,
          show_on_landing: showOnLanding,
        };
        await saveStoredCoaches([updated, ...coaches]);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/coaches");
    return { success: true };
  } catch (err) {
    console.error("Failed to toggle coach show on landing:", err);
    return { success: false, error: "تعذر تحديث حالة الظهور في الواجهة" };
  }
}

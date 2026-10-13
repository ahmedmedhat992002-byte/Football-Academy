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

export interface CoachProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  specialization: string;
  status: "approved" | "pending_approval" | "rejected";
  experience_years?: string;
  bio?: string;
  assigned_groups?: string[];
  created_at: string;
}

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
  },
];

export async function getStoredCoaches(): Promise<CoachProfile[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COACHES_STORAGE_COOKIE)?.value;
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

export async function saveStoredCoaches(coaches: CoachProfile[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COACHES_STORAGE_COOKIE, encodeURIComponent(JSON.stringify(coaches)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
  });
}

/**
 * Get all coaches combined (initial + custom stored)
 */
export async function getCoaches(): Promise<CoachProfile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("profiles") as any)
      .select("*")
      .eq("role", "coach");
    if (!error && data && data.length > 0) {
      // Map supabase profiles
      const dbCoaches: CoachProfile[] = data.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email || `${p.id}@academy.com`,
        phone: p.phone || "غير محدد",
        specialization: p.specialization || "مدرب فني",
        status: (p.status as any) || "approved",
        created_at: p.created_at || new Date().toISOString(),
      }));

      const stored = await getStoredCoaches();
      const map = new Map<string, CoachProfile>();
      [...INITIAL_COACHES, ...dbCoaches, ...stored].forEach((c) => map.set(c.id, c));
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
            status: (u.user_metadata?.status as any) || "pending_approval",
            experience_years: u.user_metadata?.experience_years || "غير محدد",
            bio: u.user_metadata?.bio || "مدرب معتمد بالأكاديمية",
            created_at: u.created_at,
          }));

        const stored = await getStoredCoaches();
        const map = new Map<string, CoachProfile>();
        [...INITIAL_COACHES, ...cloudCoaches, ...stored].forEach((c) => map.set(c.id, c));
        return Array.from(map.values());
      }
    }
  } catch {
    // Fallback
  }

  const fbCoaches = await getFirebaseCoaches();
  const stored = await getStoredCoaches();
  const map = new Map<string, CoachProfile>();
  [...INITIAL_COACHES, ...fbCoaches, ...stored].forEach((c) => map.set(c.id, c));
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
  reason?: string
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
 * Add or edit coach directly by Admin (Pre-approved)
 */
export async function saveCoachAction(
  coachData: Partial<CoachProfile> & { full_name: string; email: string; phone: string; specialization: string }
): Promise<{ success: boolean; error?: string; coach?: CoachProfile }> {
  const stored = await getStoredCoaches();

  if (coachData.id) {
    const index = stored.findIndex((c) => c.id === coachData.id);
    if (index >= 0) {
      stored[index] = {
        ...stored[index],
        ...coachData,
      };
      await saveStoredCoaches(stored);
      revalidatePath("/admin/coaches");
      return { success: true, coach: stored[index] };
    }
  }

  const newCoach: CoachProfile = {
    id: coachData.id || `coach-${Date.now()}`,
    full_name: coachData.full_name,
    email: coachData.email.toLowerCase(),
    phone: coachData.phone,
    password: coachData.password || "coach123",
    specialization: coachData.specialization,
    experience_years: coachData.experience_years || "3 سنوات",
    bio: coachData.bio || "مدرب معتمد بالجهاز الفني للأكاديمية",
    status: coachData.status || "approved",
    created_at: new Date().toISOString(),
  };

  await saveStoredCoaches([newCoach, ...stored]);
  revalidatePath("/admin/coaches");
  revalidatePath("/admin");

  return { success: true, coach: newCoach };
}

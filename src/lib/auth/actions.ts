"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loginSchema,
  registerSchema,
  trialBookingSchema,
  type LoginInput,
  type RegisterInput,
  type TrialBookingInput,
} from "@/lib/validations/auth";
import { DEMO_USERS, type CurrentUser } from "@/lib/auth/session";
import { getRoleDashboard } from "@/lib/auth/roles";
import { savePlayer } from "@/lib/actions/players";
import { addNotification } from "@/lib/actions/notifications";
import { getCoaches } from "@/lib/actions/coaches";
import { createFirebaseUser, saveTrialBookingToFirestore } from "@/lib/firebase/auth-service";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { UserRole } from "@/types/database.types";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

const REGISTERED_USERS_COOKIE = "academy_registered_users";

export interface RegisteredUserRecord extends CurrentUser {
  passwordHash?: string;
  childName?: string;
  childBirthDate?: string;
  ageCategory?: string;
  createdAt: string;
}

export async function getRegisteredUsers(): Promise<RegisteredUserRecord[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(REGISTERED_USERS_COOKIE)?.value;
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

async function saveRegisteredUsers(users: RegisteredUserRecord[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REGISTERED_USERS_COOKIE, encodeURIComponent(JSON.stringify(users)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60, // 60 days
  });
}

/**
 * Standard login supporting Admin, coaches, and multiple registered parents
 */
export async function loginAction(data: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات الدخول غير صحيحة",
    };
  }

  const { email, password } = parsed.data;

  // 1. Check if email matches registered parents
  const registeredUsers = await getRegisteredUsers();
  const matchedRegistered = registeredUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (matchedRegistered) {
    if (matchedRegistered.passwordHash === password) {
      const cookieStore = await cookies();
      cookieStore.set("academy_demo_user", JSON.stringify(matchedRegistered), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return {
        success: true,
        redirectTo: getRoleDashboard(matchedRegistered.role),
      };
    } else {
      return {
        success: false,
        error: "كلمة المرور غير صحيحة",
      };
    }
  }

  // 2. Check Admin account (unique real administrator)
  if (
    email.toLowerCase() === "admin@academy.com" &&
    (password === "admin123" || password === "admin@2026")
  ) {
    const adminUser = {
      id: "admin-master-001",
      email: "admin@academy.com",
      fullName: "كابتن أحمد (مدير الأكاديمية)",
      role: "admin" as const,
      phone: "01012345678",
    };
    const cookieStore = await cookies();
    cookieStore.set("academy_demo_user", JSON.stringify(adminUser), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return {
      success: true,
      redirectTo: "/admin",
    };
  }

  // 3. Check Coach accounts (including approved & pending coaches)
  const allCoaches = await getCoaches();
  const matchedCoach = allCoaches.find(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );

  if (matchedCoach) {
    const isPasswordValid =
      matchedCoach.password === password ||
      (matchedCoach.email === "coach@academy.com" && (password === "coach123" || password === "coach@2026"));

    if (!isPasswordValid) {
      return {
        success: false,
        error: "كلمة المرور غير صحيحة",
      };
    }

    // Verify Admin approval status
    if (matchedCoach.status === "pending_approval") {
      return {
        success: false,
        error: "حساب المدرب قيد المراجعة والاعتماد من قبل مدير الأكاديمية ⏳. لن تتمكن من الدخول إلا بعد اعتماد وتأكيد المدير.",
      };
    }

    if (matchedCoach.status === "rejected") {
      return {
        success: false,
        error: "عذراً، تم رفض طلب انضمامك كمدرب من قِبل إدارة الأكاديمية.",
      };
    }

    const coachUser = {
      id: matchedCoach.id,
      email: matchedCoach.email,
      fullName: matchedCoach.full_name,
      role: "coach" as const,
      phone: matchedCoach.phone,
      status: matchedCoach.status,
      specialization: matchedCoach.specialization,
    };

    const cookieStore = await cookies();
    cookieStore.set("academy_demo_user", JSON.stringify(coachUser), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      redirectTo: "/coach",
    };
  }

  // 3. Try Supabase Auth
  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !authData.user) {
      return {
        success: false,
        error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      };
    }

    let role: UserRole = (authData.user.user_metadata?.role as UserRole) || "parent";
    let fullName = authData.user.user_metadata?.full_name || authData.user.email;
    const coachStatus = authData.user.user_metadata?.status;

    try {
      const { data: profile } = await (supabase.from("profiles") as any)
        .select("role, full_name")
        .eq("id", authData.user.id)
        .single();
      if (profile?.role) role = profile.role as UserRole;
      if (profile?.full_name) fullName = profile.full_name;
    } catch {
      // Profile table optional
    }

    if (role === "coach" && coachStatus === "pending_approval") {
      return {
        success: false,
        error: "حساب الكابتن بانتظار اعتماد وموافقة مدير الأكاديمية.",
      };
    }

    // Set session cookie for consistency
    const cookieStore = await cookies();
    cookieStore.set(
      "academy_demo_user",
      JSON.stringify({
        id: authData.user.id,
        email,
        fullName,
        role,
      }),
      {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return {
      success: true,
      redirectTo: getRoleDashboard(role),
    };
  } catch {
    return {
      success: false,
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    };
  }
}

/**
 * Register a new parent user and their child player with live admin notification
 */
export async function registerAction(data: RegisterInput): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "يرجى استكمال جميع البيانات المطلوبة",
    };
  }

  const { fullName, email, phone, password, childName, childBirthDate, ageCategory } = parsed.data;

  // Generate unique Parent ID
  const parentId = `parent-${Date.now()}`;

  // 1. If Supabase is configured, create real authenticated user
  let supabaseUid: string | undefined;
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      const { data: sbUser, error: sbError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone,
          role: "parent",
          child_name: childName,
          child_birth_date: childBirthDate,
          age_category: ageCategory,
        },
      });
      if (sbUser?.user) {
        supabaseUid = sbUser.user.id;
      } else if (sbError && sbError.message.toLowerCase().includes("already")) {
        return { success: false, error: "البريد الإلكتروني مسجل بالفعل مسبقاً" };
      }
    } else {
      const supabase = await createClient();
      const { data: sbAuth, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: "parent",
            child_name: childName,
            child_birth_date: childBirthDate,
            age_category: ageCategory,
          },
        },
      });
      if (sbAuth?.user) {
        supabaseUid = sbAuth.user.id;
      } else if (sbError && sbError.message.toLowerCase().includes("already")) {
        return { success: false, error: "البريد الإلكتروني مسجل بالفعل مسبقاً" };
      }
    }
  } catch (err) {
    console.warn("Supabase signup fallback:", err);
  }

  // 2. If Firebase is configured, register user in Firebase Auth & Firestore
  let firebaseUid: string | undefined;
  if (isFirebaseConfigured) {
    try {
      const fbResult = await createFirebaseUser({
        email,
        password,
        fullName,
        phone,
        role: "parent",
        childName,
        childBirthDate,
        ageCategory,
      });
      if (fbResult.success) {
        firebaseUid = fbResult.uid;
      } else if (fbResult.error?.includes("مسجل بالفعل")) {
        return { success: false, error: fbResult.error };
      }
    } catch (fbErr) {
      console.warn("Firebase registration fallback:", fbErr);
    }
  }

  // 2. Save Child Player to Academy Roster
  const effectiveParentId = firebaseUid || parentId;
  const groupTargetId =
    ageCategory === "U8"
      ? "group-u8-004"
      : ageCategory === "U10"
      ? "group-u10-001"
      : ageCategory === "U12"
      ? "group-u12-002"
      : "group-u14-003";

  await savePlayer({
    full_name: childName,
    birth_date: childBirthDate,
    group_id: groupTargetId,
    parent_id: effectiveParentId,
    status: "active",
    emergency_phone: phone,
    notes: `مسجل جديد عبر المنظمة — ولي الأمر: ${fullName}`,
  });

  // 2. Persist Registered Parent Account
  const registeredUsers = await getRegisteredUsers();
  const newParentUser: RegisteredUserRecord = {
    id: parentId,
    email,
    fullName,
    phone,
    role: "parent",
    passwordHash: password,
    childName,
    childBirthDate,
    ageCategory: ageCategory || "U10",
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [
    newParentUser,
    ...registeredUsers.filter((u) => u.email.toLowerCase() !== email.toLowerCase()),
  ];
  await saveRegisteredUsers(updatedUsers);

  // 3. Set Session Cookie for instant login
  const cookieStore = await cookies();
  cookieStore.set(
    "academy_demo_user",
    JSON.stringify({
      id: parentId,
      email,
      fullName,
      phone,
      role: "parent",
      childName,
      ageCategory: ageCategory || "U10",
    }),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  // 4. Send Instant Live Notification to Admin
  await addNotification({
    title: "تسجيل لاعب جديد في الأكاديمية ⚽",
    description: `سجّل ولي الأمر ${fullName} ابنه ${childName} (${ageCategory || "U10"}) — هاتف: ${phone}`,
    type: "registration",
    href: "/admin/players",
    targetRole: "admin",
  });

  return {
    success: true,
    redirectTo: "/parent",
  };
}

/**
 * 1-Click Demo Login for testing roles
 */
export async function demoLoginAction(role: UserRole): Promise<AuthActionResult> {
  const cookieStore = await cookies();
  const demoUser = DEMO_USERS[role];

  if (!demoUser) {
    return { success: false, error: "الدور المحدد غير متاح" };
  }

  cookieStore.set("academy_demo_user", JSON.stringify(demoUser), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    redirectTo: getRoleDashboard(role),
  };
}

/**
 * Book a free trial training session with live admin notification
 */
export async function bookTrialAction(data: TrialBookingInput): Promise<{ success: boolean; message: string }> {
  const parsed = trialBookingSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "يرجى التأكد من صحة البيانات المدخلة",
    };
  }

  const { parentName, childName, phone, ageCategory } = parsed.data;

  // If Firebase is configured, save trial booking to Firestore
  if (isFirebaseConfigured) {
    try {
      await saveTrialBookingToFirestore({
        parentName,
        childName,
        phone,
        ageCategory,
      });
    } catch (fbErr) {
      console.warn("Firebase trial booking fallback:", fbErr);
    }
  }

  // Notify Admin
  await addNotification({
    title: "طلب حجز اختبار أداء مجاني 📋",
    description: `طلب أ. ${parentName} حجز اختبار للاعب ${childName} (${ageCategory}) — هاتف: ${phone}`,
    type: "session",
    href: "/admin/sessions",
    targetRole: "admin",
  });

  return {
    success: true,
    message: `تم حجز موعد اختبار الأداء للاعب ${childName} بنجاح! سيتواصل معك كابتن الأكاديمية على الرقم ${phone} لتأكيد الحصة التدريبية.`,
  };
}

/**
 * Sign out of session
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("academy_demo_user");

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore error
  }

  redirect("/login");
}

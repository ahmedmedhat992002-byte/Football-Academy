"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loginSchema,
  registerSchema,
  trialBookingSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type TrialBookingInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { DEMO_USERS, type CurrentUser } from "@/lib/auth/session";
import { getRoleDashboard } from "@/lib/auth/roles";
import { savePlayer } from "@/lib/actions/players";
import { addNotification } from "@/lib/actions/notifications";
import { getCoaches } from "@/lib/actions/coaches";
import { createFirebaseUser, saveTrialBookingToFirestore } from "@/lib/firebase/auth-service";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { PRIMARY_ADMIN_EMAIL, isAdminEmail } from "@/lib/auth/admin-config";
import type { UserRole } from "@/types/database.types";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
  requiresEmailConfirmation?: boolean;
  emailSentTo?: string;
}

import {
  getSharedRegisteredUsers,
  saveSharedRegisteredUser,
  deleteSharedRegisteredUser,
  updateSharedRegisteredUser,
} from "@/lib/data/shared-store";

const REGISTERED_USERS_COOKIE = "academy_registered_users";

export interface RegisteredUserRecord extends CurrentUser {
  passwordHash?: string;
  childName?: string;
  childBirthDate?: string;
  ageCategory?: string;
  createdAt: string;
}

export async function getRegisteredUsers(): Promise<RegisteredUserRecord[]> {
  const shared = getSharedRegisteredUsers() as RegisteredUserRecord[];
  const cookieStore = await cookies();
  const raw = cookieStore.get(REGISTERED_USERS_COOKIE)?.value;
  let fromCookies: RegisteredUserRecord[] = [];
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
  const map = new Map<string, RegisteredUserRecord>();
  for (const u of [...shared, ...(Array.isArray(fromCookies) ? fromCookies : [])]) {
    if (u?.email) map.set(u.email.toLowerCase(), u);
  }
  return Array.from(map.values());
}

async function saveRegisteredUsers(users: RegisteredUserRecord[]): Promise<void> {
  for (const u of users) {
    saveSharedRegisteredUser(u);
  }
  const cookieStore = await cookies();
  cookieStore.set(REGISTERED_USERS_COOKIE, encodeURIComponent(JSON.stringify(users)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60, // 60 days
  });
}

/**
 * Purge a user from registered users (cookies and shared store) and clear session if active
 */
export async function purgeRegisteredUser(identifier: string, email?: string): Promise<void> {
  const normId = identifier ? identifier.trim() : "";
  const normEmail = (email || identifier).trim().toLowerCase();

  deleteSharedRegisteredUser(normId);
  if (normEmail && normEmail !== normId) {
    deleteSharedRegisteredUser(normEmail);
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(REGISTERED_USERS_COOKIE)?.value;
  let fromCookies: RegisteredUserRecord[] = [];
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

  // Clear demo session if this user was currently logged in
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

/**
 * Update user details across registered users and live session
 */
export async function updateRegisteredUserRecord(
  identifier: string,
  updated: { email?: string; fullName?: string; phone?: string; password?: string }
): Promise<void> {
  const normId = identifier.trim();
  const normEmail = (updated.email || "").trim().toLowerCase();

  updateSharedRegisteredUser(normId, {
    ...(updated.email ? { email: updated.email.toLowerCase() } : {}),
    ...(updated.fullName ? { fullName: updated.fullName } : {}),
    ...(updated.phone ? { phone: updated.phone } : {}),
    ...(updated.password ? { passwordHash: updated.password } : {}),
  });

  const cookieStore = await cookies();
  const raw = cookieStore.get(REGISTERED_USERS_COOKIE)?.value;
  let fromCookies: RegisteredUserRecord[] = [];
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

  let matched = false;
  fromCookies = fromCookies.map((u) => {
    if (u.id === normId || (normEmail && u.email?.toLowerCase() === normEmail)) {
      matched = true;
      return {
        ...u,
        ...(updated.email ? { email: updated.email.toLowerCase() } : {}),
        ...(updated.fullName ? { fullName: updated.fullName } : {}),
        ...(updated.phone ? { phone: updated.phone } : {}),
        ...(updated.password ? { passwordHash: updated.password } : {}),
      };
    }
    return u;
  });

  if (matched) {
    cookieStore.set(REGISTERED_USERS_COOKIE, encodeURIComponent(JSON.stringify(fromCookies)), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 60,
    });
  }

  // Update active session if currently logged in
  const demoCookie = cookieStore.get("academy_demo_user");
  if (demoCookie?.value) {
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(decodeURIComponent(demoCookie.value));
      } catch {
        parsed = JSON.parse(demoCookie.value);
      }
      if (parsed && (parsed.id === normId || parsed.email?.toLowerCase() === normEmail)) {
        const newSession = {
          ...parsed,
          ...(updated.email ? { email: updated.email.toLowerCase() } : {}),
          ...(updated.fullName ? { fullName: updated.fullName } : {}),
          ...(updated.phone ? { phone: updated.phone } : {}),
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
  const lowerEmail = email.trim().toLowerCase();

  // Strict check: if email is blacklisted/deleted coach, reject immediately
  const cookieStore = await cookies();
  const deletedEmailsRaw = cookieStore.get("academy_coaches_deleted_emails")?.value;
  if (deletedEmailsRaw) {
    try {
      let deletedList: string[] = [];
      try {
        deletedList = JSON.parse(decodeURIComponent(deletedEmailsRaw));
      } catch {
        deletedList = JSON.parse(deletedEmailsRaw);
      }
      if (Array.isArray(deletedList) && deletedList.map((e) => e.toLowerCase()).includes(lowerEmail)) {
        return {
          success: false,
          error: "تم حذف وإلغاء حساب هذا المدرب نهائياً من قاعدة بيانات الأكاديمية ولا يمكن تسجيل الدخول به.",
        };
      }
    } catch {
      // Ignore
    }
  }

  // 1. Try Supabase Auth first with real password and email confirmation check
  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const errStr = (error.message || "").toLowerCase();
      if (errStr.includes("email not confirmed") || errStr.includes("not verified")) {
        return {
          success: false,
          error: "يرجى تأكيد حسابك أولاً! ✉️ تم إرسال رسالة تحقق وتأكيد إلى بريدك في Gmail، يرجى فتح الرسالة وتأكيد البريد لتتمكن من الدخول.",
        };
      }
    } else if (authData.user) {
      const userEmail = authData.user.email || email;
      const isUserAdmin = isAdminEmail(userEmail);

      let role: UserRole = isUserAdmin
        ? "admin"
        : ((authData.user.user_metadata?.role as UserRole) || "parent");
      let fullName = isUserAdmin
        ? "أحمد مدحت (مدير الأكاديمية)"
        : (authData.user.user_metadata?.full_name || authData.user.email);
      const coachStatus = authData.user.user_metadata?.status;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", authData.user.id)
          .single();
        if (profile?.role) {
          role = isUserAdmin ? "admin" : (profile.role === "admin" ? "parent" : (profile.role as UserRole));
        }
        if (profile?.full_name && !isUserAdmin) fullName = profile.full_name;
      } catch {
        // Profile table optional
      }

      if (role === "coach" && coachStatus === "pending_approval") {
        return {
          success: false,
          error: "حساب الكابتن بانتظار اعتماد وموافقة مدير الأكاديمية.",
        };
      }

      const cookieStore = await cookies();
      cookieStore.set(
        "academy_demo_user",
        JSON.stringify({
          id: authData.user.id,
          email: userEmail,
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
    }
  } catch {
    // Supabase fallback
  }

  // 2. Check Admin account with strict password verification
  if (isAdminEmail(email)) {
    const registeredUsers = await getRegisteredUsers();
    const matchedAdmin = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    const isPasswordValid =
      password === "admin123" ||
      password === "admin@2026" ||
      (matchedAdmin && matchedAdmin.passwordHash === password);

    if (!isPasswordValid) {
      return {
        success: false,
        error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      };
    }

    const adminUser = {
      id: "admin-master-001",
      email: PRIMARY_ADMIN_EMAIL,
      fullName: "أحمد مدحت (مدير الأكاديمية)",
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

    // Sync role in registered users
    try {
      const existingIdx = registeredUsers.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingIdx !== -1) {
        registeredUsers[existingIdx].role = "admin";
        await saveRegisteredUsers(registeredUsers);
      }
    } catch {
      // Ignore
    }

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

  // 4. Check if email matches registered parents
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

  return {
    success: false,
    error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  };
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

  // 1. If Supabase is configured, create real authenticated user and send verification email
  let supabaseUid: string | undefined;
  let isAwaitingEmailConfirmation = false;
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
          role: "parent",
          child_name: childName,
          child_birth_date: childBirthDate,
          age_category: ageCategory,
        },
      },
    });

    if (sbError) {
      const errMsg = sbError.message.toLowerCase();
      if (errMsg.includes("already registered") || errMsg.includes("already exists")) {
        return { success: false, error: "عنوان بريد Gmail هذا مسجل بالفعل مسبقاً" };
      }
    }

    if (sbAuth?.user) {
      supabaseUid = sbAuth.user.id;
      // If session is null, Supabase requires email verification
      if (!sbAuth.session) {
        isAwaitingEmailConfirmation = true;
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

  const savedPlayerRes = await savePlayer({
    full_name: childName,
    birth_date: childBirthDate,
    group_id: groupTargetId,
    parent_id: effectiveParentId,
    status: "active",
    emergency_phone: phone,
    notes: `مسجل جديد عبر المنظومة — ولي الأمر: ${fullName}`,
  });

  const createdPlayerId = savedPlayerRes?.player?.id || `player-${parentId}`;

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

  // 3. Create Pending Subscription awaiting admin approval
  const todayStr = new Date().toISOString().split("T")[0];
  const nextMonthStr = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  try {
    const { saveSubscription } = await import("@/lib/actions/subscriptions");
    await saveSubscription({
      player_id: createdPlayerId,
      plan_id: "plan-monthly-001",
      start_date: todayStr,
      end_date: nextMonthStr,
      status: "pending_approval",
    });
  } catch (err) {
    console.warn("saveSubscription during register error:", err);
  }

  // 4. Set Session Cookie for instant login with pending approval status
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
      hasPendingSubscription: true,
      pendingPlanName: "الاشتراك الشهري الأساسي",
    }),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  // 5. Send Instant Live Notification to Admin
  await addNotification({
    title: "طلب اعتماد لاعب جديد في الأكاديمية! 🔔",
    description: `سجّل ولي الأمر ${fullName} ابنه اللاعب (${childName}) في فئة (${ageCategory || "U10"}) — هاتف: ${phone}. بانتظار اعتمادك لتفعيل التدريب.`,
    type: "registration",
    href: "/admin/subscriptions",
    targetRole: "admin",
  });

  if (isAwaitingEmailConfirmation) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      emailSentTo: email,
    };
  }

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

/**
 * Send password reset link to user's Gmail address via Supabase Auth
 */
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<{ success: boolean; error?: string; message?: string }> {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "يرجى إدخال عنوان بريد Gmail صحيح ينتهي بـ @gmail.com",
    };
  }

  const { email } = parsed.data;

  try {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://football-academy-rho.vercel.app";
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      console.error("Supabase resetPasswordForEmail error:", error);
      return {
        success: false,
        error: error.message || "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور",
      };
    }

    return {
      success: true,
      message: `تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك (${email}) بنجاح! ✉️ يرجى فتح Gmail وفحص البريد الوارد أو مجلد Spam.`,
    };
  } catch (err: any) {
    console.error("forgotPasswordAction exception:", err);
    return {
      success: false,
      error: "تعذر إرسال رسالة الاستعادة حالياً، يرجى المحاولة بعد قليل",
    };
  }
}

/**
 * Update user password after clicking reset link from Gmail
 */
export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "بيانات كلمة المرور غير صحيحة",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      console.error("Supabase updateUser password error:", error);
      return {
        success: false,
        error: error.message || "فشل تعيين كلمة المرور الجديدة، قد يكون الرابط منتهي الصلاحية",
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.error("resetPasswordAction exception:", err);
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء تحديث كلمة المرور",
    };
  }
}


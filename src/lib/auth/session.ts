import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database.types";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string | null;
  status?: "active" | "pending_approval" | "rejected" | "approved";
  specialization?: string | null;
}

export const DEMO_USERS: Record<UserRole, CurrentUser> = {
  admin: {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@academy.com",
    fullName: "كابتن أحمد (مالك الأكاديمية)",
    role: "admin",
    phone: "01012345678",
  },
  coach: {
    id: "00000000-0000-0000-0000-000000000002",
    email: "coach@academy.com",
    fullName: "كابتن محمود (مدرب U10 & U12)",
    role: "coach",
    phone: "01098765432",
  },
  parent: {
    id: "00000000-0000-0000-0000-000000000003",
    email: "parent@academy.com",
    fullName: "أ. طارق عبد الرحمن (ولي أمر)",
    role: "parent",
    phone: "01155554444",
  },
};

/**
 * Returns current authenticated user either from real Supabase Auth
 * or from active demo cookie session during initial setup.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();

  // 1. Check if a demo session cookie is set
  const demoCookie = cookieStore.get("academy_demo_user");
  if (demoCookie?.value) {
    try {
      const raw = decodeURIComponent(demoCookie.value);
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role && parsed.id) {
        return parsed as CurrentUser;
      }
    } catch {
      try {
        const parsed = JSON.parse(demoCookie.value);
        if (parsed && parsed.role && parsed.id) {
          return parsed as CurrentUser;
        }
      } catch {
        // Ignore parse failure
      }
    }
  }

  // 2. Query Supabase Auth
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch user profile from public.profiles
    const { data } = await (supabase.from("profiles") as any)
      .select("id, full_name, phone, role")
      .eq("id", user.id)
      .single();

    const profile = data as { id: string; full_name: string; phone: string | null; role: UserRole } | null;

    if (profile) {
      return {
        id: profile.id,
        email: user.email || "",
        fullName: profile.full_name,
        role: profile.role,
        phone: profile.phone,
      };
    }

    // Default fallback if profile record is pending
    return {
      id: user.id,
      email: user.email || "",
      fullName: user.user_metadata?.full_name || "مستخدم الأكاديمية",
      role: (user.user_metadata?.role as UserRole) || "parent",
    };
  } catch {
    return null;
  }
}

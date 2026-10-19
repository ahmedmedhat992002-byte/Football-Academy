import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRoleDashboard } from "@/lib/auth/roles";
import { isAdminEmail } from "@/lib/auth/admin-config";
import type { UserRole } from "@/types/database.types";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        const user = data.user;
        const userEmail = user.email || "";
        const isUserAdmin = isAdminEmail(userEmail);

        let role: UserRole = isUserAdmin
          ? "admin"
          : ((user.user_metadata?.role as UserRole) || "parent");

        let fullName = isUserAdmin
          ? (user.user_metadata?.full_name || "كابتن حسام الدين خالد (مدير الأكاديمية)")
          : (user.user_metadata?.full_name ||
             user.user_metadata?.name ||
             user.email?.split("@")[0] ||
             "مستخدم الأكاديمية");

        // Check if user already exists in profiles
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .single();

          if (profile?.role) {
            role = isUserAdmin ? "admin" : (profile.role === "admin" ? "parent" : (profile.role as UserRole));
          }
          if (profile?.full_name) fullName = profile.full_name;
        } catch {
          // profiles lookup optional
        }

        // Set session cookie for consistency across app
        const cookieStore = await cookies();
        cookieStore.set(
          "academy_demo_user",
          JSON.stringify({
            id: user.id,
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

        const targetDashboard = next || getRoleDashboard(role);
        return NextResponse.redirect(new URL(targetDashboard, requestUrl.origin));
      }
    } catch (err) {
      console.error("Auth callback error:", err);
    }
  }

  // Return to login with error if OAuth failed
  return NextResponse.redirect(new URL("/login?error=oauth_failed", requestUrl.origin));
}

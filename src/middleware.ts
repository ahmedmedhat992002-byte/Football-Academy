import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { UserRole } from "@/types/database.types";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal Next.js paths bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. Refresh Supabase session
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // 2. Check for demo session cookie or Supabase user
  let activeRole: UserRole | null = null;

  const demoCookie = request.cookies.get("academy_demo_user");
  if (demoCookie?.value) {
    try {
      const raw = decodeURIComponent(demoCookie.value);
      const parsed = JSON.parse(raw);
      if (parsed?.role) {
        activeRole = parsed.role as UserRole;
      }
    } catch {
      try {
        const parsed = JSON.parse(demoCookie.value);
        if (parsed?.role) {
          activeRole = parsed.role as UserRole;
        }
      } catch {
        // Ignore parse failure
      }
    }
  }

  if (!activeRole && user) {
    try {
      const { data: profile } = await (supabase.from("profiles") as any)
        .select("role")
        .eq("id", user.id)
        .single();
      activeRole = (profile?.role as UserRole) || "parent";
    } catch {
      activeRole = "parent";
    }
  }

  const isAuthenticated = Boolean(activeRole);

  // Public auth paths
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Protected paths
  const isAdminPath = pathname.startsWith("/admin");
  const isCoachPath = pathname.startsWith("/coach");
  const isParentPath = pathname.startsWith("/parent");
  const isProtectedPath = isAdminPath || isCoachPath || isParentPath;

  // A. Redirect unauthenticated users trying to access protected paths
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // B. Redirect authenticated users away from /login
  if (isAuthPage && isAuthenticated && activeRole) {
    const destination = getRoleDashboard(activeRole);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // C. Role-based access enforcement
  if (isAuthenticated && activeRole) {
    if (isAdminPath && activeRole !== "admin") {
      // Non-admins cannot access admin routes
      return NextResponse.redirect(new URL(getRoleDashboard(activeRole), request.url));
    }

    if (isCoachPath && activeRole !== "coach" && activeRole !== "admin") {
      // Parents cannot access coach routes
      return NextResponse.redirect(new URL(getRoleDashboard(activeRole), request.url));
    }

    if (isParentPath && activeRole !== "parent" && activeRole !== "admin") {
      // Coaches cannot access parent routes
      return NextResponse.redirect(new URL(getRoleDashboard(activeRole), request.url));
    }
  }

  return supabaseResponse;
}

function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "coach":
      return "/coach";
    case "parent":
      return "/parent";
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import type { UserRole } from "@/types/database.types";

export function getRoleDashboard(role: UserRole): string {
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

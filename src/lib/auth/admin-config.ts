/**
 * Central configuration for Admin privilege authority.
 * Only the specified primary admin email is granted administrator privileges.
 */
export const PRIMARY_ADMIN_EMAIL = "ahmedmedhat992002@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const configuredEnv = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return (
    normalized === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
    (Boolean(configuredEnv) && normalized === configuredEnv)
  );
}

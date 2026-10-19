/**
 * Central configuration for Admin privilege authority.
 * Only the specified primary admin email is granted administrator privileges.
 */
export const PRIMARY_ADMIN_EMAIL = "hossameldinkhaled244@gmail.com";

export const ADMIN_EMAILS = [
  "hossameldinkhaled244@gmail.com",
  "ahmedmedhat992002@gmail.com",
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const configuredEnv = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return (
    ADMIN_EMAILS.includes(normalized) ||
    normalized === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
    (Boolean(configuredEnv) && normalized === configuredEnv)
  );
}


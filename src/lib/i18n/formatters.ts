export type SupportedCurrency = 'EGP' | 'SAR';

/**
 * Format date in Arabic locale (ar-EG)
 * e.g., "١٣ أكتوبر ٢٠٢٦" or "13 أكتوبر 2026"
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format short date (e.g., "13/10/2026")
 */
export function formatShortDate(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format time in Arabic locale
 * e.g., "05:30 م"
 */
export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '-';
  const [hours, minutes] = timeStr.split(':');
  if (hours === undefined || minutes === undefined) return timeStr;

  // Use fixed date to ensure pure and deterministic prerender evaluation
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const d = new Date(2020, 0, 1, h, m, 0);

  return new Intl.DateTimeFormat('ar-EG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Format currency with EGP or SAR
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: SupportedCurrency = 'EGP'
): string {
  if (amount === null || amount === undefined) return `0 ${currency === 'EGP' ? 'ج.م' : 'ر.س'}`;

  const formattedNum = new Intl.NumberFormat('ar-EG', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  const symbol = currency === 'EGP' ? 'ج.م' : 'ر.س';
  return `${formattedNum} ${symbol}`;
}

/**
 * Format plain number with Arabic localization
 */
export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return '0';
  return new Intl.NumberFormat('ar-EG').format(val);
}

export const ARABIC_DAYS: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

export function getDayName(day: string): string {
  return ARABIC_DAYS[day] || day;
}

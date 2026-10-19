/**
 * Excel / CSV Exporter for FIFA FC ACADEMY
 * Emits CSV with UTF-8 BOM (\uFEFF) so Arabic letters open flawlessly in Microsoft Excel.
 */

import { type Player, type Group, type PaymentRecord, type AttendanceRecord } from "@/lib/data/academy-store";

function downloadCsv(content: string, filename: string) {
  // \uFEFF is the UTF-8 Byte Order Mark (BOM) needed by Excel to display Arabic characters properly
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Players list to Excel CSV
 */
export function exportPlayersToExcel(players: Player[], groups?: Group[]) {
  const headers = [
    "اسم اللاعب",
    "المجموعة التدريبية",
    "تاريخ الميلاد",
    "الحالة",
    "رقم طوارئ / ولي الأمر",
    "مقاس الزي",
    "استلام الزي",
    "ملاحظات",
    "تاريخ التسجيل",
  ];

  const rows = players.map((p) => {
    const groupName =
      p.group_name || groups?.find((g) => g.id === p.group_id)?.name || "غير محدد";
    const statusMap: Record<string, string> = {
      active: "نشط ومستمر",
      paused: "موقوف مؤقتاً",
      left: "منسحب",
    };
    return [
      escapeCsvCell(p.full_name),
      escapeCsvCell(groupName),
      escapeCsvCell(p.birth_date),
      escapeCsvCell(statusMap[p.status] || p.status),
      escapeCsvCell(p.emergency_phone),
      escapeCsvCell((p as any).kit_size || "غير محدد"),
      escapeCsvCell((p as any).kit_received ? "تم الاستلام" : "لم يستلم"),
      escapeCsvCell(p.notes || ""),
      escapeCsvCell(p.created_at ? p.created_at.split("T")[0] : ""),
    ].join(",");
  });

  const csv = [headers.map(escapeCsvCell).join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  downloadCsv(csv, `كشف_لاعبي_الأكاديمية_${dateStr}.csv`);
}

/**
 * Export Payments / Financial Records to Excel CSV
 */
export function exportPaymentsToExcel(payments: PaymentRecord[]) {
  const headers = [
    "رقم الإيصال",
    "اسم اللاعب",
    "الباقة / الاشتراك",
    "المبلغ (ج.م)",
    "طريقة الدفع",
    "تاريخ السداد",
    "ملاحظات",
  ];

  const methodMap: Record<string, string> = {
    cash: "نقدي (كاش)",
    instapay: "إنستاباي (InstaPay)",
    bank_transfer: "تحويل بنكي",
    other: "أخرى",
  };

  const rows = payments.map((p) => [
    escapeCsvCell(p.receipt_no),
    escapeCsvCell(p.player_name || "غير محدد"),
    escapeCsvCell(p.plan_name || "اشتراك تدريبي"),
    escapeCsvCell(p.amount),
    escapeCsvCell(methodMap[p.method] || p.method),
    escapeCsvCell(p.paid_at ? p.paid_at.split("T")[0] : ""),
    escapeCsvCell(p.note || ""),
  ].join(","));

  const csv = [headers.map(escapeCsvCell).join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  downloadCsv(csv, `كشف_المدفوعات_المالية_${dateStr}.csv`);
}

/**
 * Export Attendance Records to Excel CSV
 */
export function exportAttendanceToExcel(
  records: Array<{
    playerName: string;
    groupName: string;
    date: string;
    status: string;
    note?: string;
  }>
) {
  const headers = ["اسم اللاعب", "المجموعة", "تاريخ الحصة", "حالة الحضور", "ملاحظات"];

  const statusMap: Record<string, string> = {
    present: "حاضر",
    absent: "غائب",
    late: "متأخر",
    excused: "معذور",
  };

  const rows = records.map((r) => [
    escapeCsvCell(r.playerName),
    escapeCsvCell(r.groupName),
    escapeCsvCell(r.date),
    escapeCsvCell(statusMap[r.status] || r.status),
    escapeCsvCell(r.note || ""),
  ].join(","));

  const csv = [headers.map(escapeCsvCell).join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  downloadCsv(csv, `سجل_حضور_التمارين_${dateStr}.csv`);
}

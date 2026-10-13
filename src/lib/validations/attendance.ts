import { z } from "zod";

export const attendanceStatusEnum = z.enum(["present", "absent", "late", "excused"]);
export type AttendanceStatus = z.infer<typeof attendanceStatusEnum>;

export const playerAttendanceRecordSchema = z.object({
  player_id: z.string().min(1),
  status: attendanceStatusEnum,
  note: z.string().optional().nullable(),
});

export const attendanceBatchSchema = z.object({
  session_id: z.string().min(1, "معرف الحصة التدريبية مطلوب"),
  records: z.array(playerAttendanceRecordSchema),
});

export type PlayerAttendanceRecordInput = z.infer<typeof playerAttendanceRecordSchema>;
export type AttendanceBatchInput = z.infer<typeof attendanceBatchSchema>;

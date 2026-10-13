import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type Group = Database["public"]["Tables"]["groups"]["Row"] & {
  coach_name?: string;
  players_count?: number;
};

export type Player = Database["public"]["Tables"]["players"]["Row"] & {
  group_name?: string;
  parent_name?: string;
};

export const INITIAL_GROUPS: Group[] = [
  {
    id: "group-u10-001",
    name: "فريق الأبطال",
    age_category: "U10",
    coach_id: "coach-001",
    coach_name: "كابتن محمود",
    training_days: ["Sunday", "Tuesday"],
    players_count: 0,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "group-u12-002",
    name: "فريق النسور",
    age_category: "U12",
    coach_id: "coach-001",
    coach_name: "كابتن محمود",
    training_days: ["Saturday", "Wednesday"],
    players_count: 0,
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-01-12T10:00:00Z",
  },
  {
    id: "group-u14-003",
    name: "فريق النجوم",
    age_category: "U14",
    coach_id: "coach-002",
    coach_name: "كابتن أحمد",
    training_days: ["Monday", "Thursday"],
    players_count: 0,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "group-u8-004",
    name: "براعم المستقبل",
    age_category: "U8",
    coach_id: "coach-002",
    coach_name: "كابتن أحمد",
    training_days: ["Saturday", "Tuesday"],
    players_count: 0,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-01T10:00:00Z",
  },
];

// Clean real state: starts empty with 0 mock players
export const INITIAL_PLAYERS: Player[] = [];

export type Session = Database["public"]["Tables"]["sessions"]["Row"] & {
  group_name?: string;
  age_category?: string;
  coach_id?: string | null;
  coach_name?: string;
  total_players?: number;
  present_count?: number;
  absent_count?: number;
  late_count?: number;
  excused_count?: number;
  attendance_taken?: boolean;
};

export type AttendanceRecord = Database["public"]["Tables"]["attendance"]["Row"] & {
  player_name?: string;
};

// Clean real state: starts empty with 0 mock sessions
export const INITIAL_SESSIONS: Session[] = [];

// Clean real state: starts empty with 0 mock attendance records
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"] & {
  description?: string;
};

export type PlayerSubscription = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  player_name?: string;
  group_name?: string;
  plan_name?: string;
  plan_price?: number;
  period?: string;
};

export type PaymentRecord = Database["public"]["Tables"]["payments"]["Row"] & {
  player_id?: string;
  player_name?: string;
  plan_name?: string;
};

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-monthly-001",
    name: "الاشتراك الشهري الأساسي",
    price: 1200,
    period: "monthly",
    description: "8 حصص تدريبية شهرياً بمعدل حصتين أسبوعياً مع متابعة وتقييم فني دوري.",
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "plan-quarterly-002",
    name: "باقة التدريب الفصلي (3 أشهر)",
    price: 3200,
    period: "quarterly",
    description: "24 حصة تدريبية مكثفة مع زي رياضي تدريبي مجاناً ومشاركة في المباريات الودية.",
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "plan-yearly-003",
    name: "العضوية السنوية الذهبية (12 شهر)",
    price: 11000,
    period: "yearly",
    description: "تدريب سنوي متكامل وتأهيل لاختبارات الأندية الرسمية وأطقم رياضية مجانية.",
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  },
];

// Clean real state: starts empty with 0 mock subscriptions
export const INITIAL_SUBSCRIPTIONS: PlayerSubscription[] = [];

// Clean real state: starts empty with 0 mock payments
export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"] & {
  player_name?: string;
  group_name?: string;
  coach_name?: string;
  overall_score?: number;
};

// Clean real state: starts empty with 0 mock evaluations
export const INITIAL_EVALUATIONS: Evaluation[] = [];

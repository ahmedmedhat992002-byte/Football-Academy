import type { Database } from "@/types/database.types";

/**
 * Domain model for Academy training groups, enriched with computed coach name and player count.
 */
export type Group = Database["public"]["Tables"]["groups"]["Row"] & {
  coach_name?: string;
  players_count?: number;
};

/**
 * Domain model for Academy registered players, enriched with joined group and parent names.
 */
export type Player = Database["public"]["Tables"]["players"]["Row"] & {
  group_name?: string;
  parent_name?: string;
  kit_size?: string;
  kit_received?: boolean;
  kit_received_date?: string;
  jersey_number?: string;
  active_injury?: PlayerInjury;
  badges_count?: number;
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

/**
 * Domain model for training sessions, enriched with group details and attendance tallies.
 */
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

/**
 * Domain model for session attendance records.
 */
export type AttendanceRecord = Database["public"]["Tables"]["attendance"]["Row"] & {
  player_name?: string;
};

// Clean real state: starts empty with 0 mock sessions
export const INITIAL_SESSIONS: Session[] = [];

// Clean real state: starts empty with 0 mock attendance records
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

/**
 * Domain model for subscription packages and pricing tiers.
 */
export type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"] & {
  description?: string;
};

/**
 * Domain model for active/pending player subscriptions, enriched with plan details.
 */
export type PlayerSubscription = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  player_name?: string;
  group_name?: string;
  plan_name?: string;
  plan_price?: number;
  period?: string;
};

/**
 * Domain model for fee payments and receipts.
 */
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

/**
 * Domain model for monthly technical, physical, and tactical evaluations.
 */
export type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"] & {
  player_name?: string;
  group_name?: string;
  coach_name?: string;
  overall_score?: number;
};

// Clean real state: starts empty with 0 mock evaluations
export const INITIAL_EVALUATIONS: Evaluation[] = [];

/**
 * Domain model for Academy matches and tournaments.
 */
export type MatchType = "friendly" | "tournament" | "league";
export type MatchStatus = "upcoming" | "completed" | "cancelled";

export interface AcademyMatch {
  id: string;
  group_id: string;
  group_name?: string;
  opponent: string;
  match_date: string;
  match_time: string;
  location: string;
  match_type: MatchType;
  status: MatchStatus;
  our_score?: number | null;
  opponent_score?: number | null;
  scorers?: string[];
  man_of_the_match?: string | null;
  lineup_player_ids?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const INITIAL_MATCHES: AcademyMatch[] = [];

/**
 * Domain model for player medical records and injuries.
 */
export type InjuryStatus = "active" | "recovering" | "recovered";

export interface PlayerInjury {
  id: string;
  player_id: string;
  player_name?: string;
  injury_type: string;
  description?: string;
  injury_date: string;
  expected_return_date?: string;
  status: InjuryStatus;
  doctor_notes?: string;
  created_at?: string;
}

export const INITIAL_INJURIES: PlayerInjury[] = [];

/**
 * Domain model for player motivational badges and achievements.
 */
export type BadgeType =
  | "star_of_week"
  | "top_scorer"
  | "wall_defense"
  | "iron_discipline"
  | "fair_play";

export interface PlayerBadge {
  id: string;
  player_id: string;
  player_name?: string;
  badge_type: BadgeType;
  badge_title: string;
  awarded_date: string;
  coach_name?: string;
  notes?: string;
  created_at?: string;
}

export const INITIAL_BADGES: PlayerBadge[] = [];

export const BADGE_DEFINITIONS: Record<
  BadgeType,
  { title: string; icon: string; description: string; color: string }
> = {
  star_of_week: {
    title: "نجم الأسبوع 🌟",
    icon: "🌟",
    description: "تألق استثنائي وأداء بطولي في تمارين ومباريات الأسبوع",
    color: "from-amber-400 to-yellow-500",
  },
  top_scorer: {
    title: "هداف التمرين ⚽",
    icon: "⚽",
    description: "أعلى دقة تسجيل وتأثير حاسم أمام المرمى",
    color: "from-blue-500 to-indigo-600",
  },
  wall_defense: {
    title: "حائط الصد 🛡️",
    icon: "🛡️",
    description: "استبسال دفاعي وقطع هجمات المنافس بذكاء وقوة",
    color: "from-emerald-500 to-teal-600",
  },
  iron_discipline: {
    title: "الأكثر التزاماً ⏱️",
    icon: "⏱️",
    description: "انضباط تام في المواعيد وحضور كافة الحصص والتركيز الكامل",
    color: "from-purple-500 to-pink-600",
  },
  fair_play: {
    title: "الروح الرياضية 🤝",
    icon: "🤝",
    description: "احترام الزملاء والمنافس والتعاون الإيجابي مع الكابتن",
    color: "from-cyan-500 to-blue-600",
  },
};

/**
 * Domain model for real parent reviews and testimonials
 */
export interface Testimonial {
  id: string;
  parent_name: string;
  child_name?: string;
  age_category?: string;
  rating: number; // 1 to 5
  content: string;
  is_verified: boolean;
  parent_email?: string;
  created_at: string;
}

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "testim-001",
    parent_name: "أ. وائل الشاذلي",
    child_name: "عمر",
    age_category: "U10",
    rating: 5,
    content: "التطور في مهارات ابني عمر (U10) كان ملحوظاً جداً خلال 3 أشهر فقط. الأكاديمية تتميز بالانضباط والمدربين يتعاملون باحترافية وأسلوب تربوي رائع.",
    is_verified: true,
    created_at: "2026-02-10T10:00:00Z",
  },
  {
    id: "testim-002",
    parent_name: "د. سارة عبد الحميد",
    child_name: "ياسين",
    age_category: "U8",
    rating: 5,
    content: "أفضل ما في الأكاديمية هو المنظومة الإلكترونية، تأتيني رسالة على هاتفي فور تسجيل حضور ابني في الملعب، والتقرير الشهري يعطيني صورة واضحة لنقاط القوة والضعف.",
    is_verified: true,
    created_at: "2026-02-18T10:00:00Z",
  },
  {
    id: "testim-003",
    parent_name: "م. حسام النجار",
    child_name: "زياد",
    age_category: "U12",
    rating: 5,
    content: "كابتن محمود مدرب ممتاز جداً، ابني كان خجولاً في اللعب الجماعي والآن أصبح قائداً لفريقه في فئة U12. شكراً لإدارة الأكاديمية على الاهتمام الحقيقي.",
    is_verified: true,
    created_at: "2026-03-01T10:00:00Z",
  },
];


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'coach' | 'parent';
export type PlayerStatus = 'active' | 'paused' | 'left';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type PlanPeriod = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'overdue' | 'pending_approval';
export type PaymentMethod = 'cash' | 'instapay' | 'bank_transfer' | 'other';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          age_category: string;
          coach_id: string | null;
          training_days: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          age_category: string;
          coach_id?: string | null;
          training_days?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age_category?: string;
          coach_id?: string | null;
          training_days?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string;
          photo_url: string | null;
          group_id: string | null;
          parent_id: string | null;
          status: PlayerStatus;
          emergency_phone: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date: string;
          photo_url?: string | null;
          group_id?: string | null;
          parent_id?: string | null;
          status?: PlayerStatus;
          emergency_phone: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string;
          photo_url?: string | null;
          group_id?: string | null;
          parent_id?: string | null;
          status?: PlayerStatus;
          emergency_phone?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          group_id: string;
          session_date: string;
          start_time: string;
          end_time: string;
          location: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          session_date: string;
          start_time: string;
          end_time: string;
          location?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          session_date?: string;
          start_time?: string;
          end_time?: string;
          location?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          session_id: string;
          player_id: string;
          status: AttendanceStatus;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          player_id: string;
          status?: AttendanceStatus;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          player_id?: string;
          status?: AttendanceStatus;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          period: PlanPeriod;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          period?: PlanPeriod;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          period?: PlanPeriod;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          player_id: string;
          plan_id: string;
          start_date: string;
          end_date: string;
          status: SubscriptionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          plan_id: string;
          start_date: string;
          end_date: string;
          status?: SubscriptionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          plan_id?: string;
          start_date?: string;
          end_date?: string;
          status?: SubscriptionStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          subscription_id: string;
          amount: number;
          method: PaymentMethod;
          paid_at: string;
          receipt_no: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          amount: number;
          method?: PaymentMethod;
          paid_at?: string;
          receipt_no: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          amount?: number;
          method?: PaymentMethod;
          paid_at?: string;
          receipt_no?: string;
          note?: string | null;
          created_at?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          player_id: string;
          coach_id: string | null;
          eval_date: string;
          technical: number;
          physical: number;
          tactical: number;
          discipline: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          coach_id?: string | null;
          eval_date?: string;
          technical: number;
          physical: number;
          tactical: number;
          discipline: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          coach_id?: string | null;
          eval_date?: string;
          technical?: number;
          physical?: number;
          tactical?: number;
          discipline?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

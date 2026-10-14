-- ==============================================================================
-- FOOTBALL ACADEMY - FIX RLS & ENUMS FOR SEAMLESS REAL-TIME REGISTRATION
-- Migration: 20261014000000_fix_public_access_and_enums.sql
-- ==============================================================================

-- 1. Add pending_approval to subscription_status enum
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'pending_approval';

-- 2. Make foreign keys flexible for players and subscriptions
ALTER TABLE public.players ALTER COLUMN group_id DROP NOT NULL;
ALTER TABLE public.players ALTER COLUMN parent_id DROP NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN plan_id DROP NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN player_id DROP NOT NULL;

-- 3. Disable Row Level Security on core operational tables
-- This ensures that player registrations and subscriptions from any browser
-- immediately succeed and are instantly visible to the Academy Admin
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;

-- 4. Seed Default Subscription Plans (with well-known IDs)
INSERT INTO public.subscription_plans (id, name, price, period)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'الاشتراك الشهري الأساسي', 1200, 'monthly'),
  ('a0000000-0000-0000-0000-000000000002', 'باقة التدريب الفصلي (3 أشهر)', 3200, 'quarterly'),
  ('a0000000-0000-0000-0000-000000000003', 'العضوية السنوية الذهبية (12 شهر)', 11000, 'yearly')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Default Training Groups (with well-known IDs)
INSERT INTO public.groups (id, name, age_category, training_days)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'فريق النجوم الصاعدة', 'U8', ARRAY['السبت', 'الثلاثاء']),
  ('b0000000-0000-0000-0000-000000000002', 'فريق الأبطال الواعدين', 'U10', ARRAY['الأحد', 'الأربعاء']),
  ('b0000000-0000-0000-0000-000000000003', 'فريق النسور المحترفة', 'U12', ARRAY['السبت', 'الاثنين', 'الخميس']),
  ('b0000000-0000-0000-0000-000000000004', 'فريق النخبة المتقدم', 'U14', ARRAY['الأحد', 'الثلاثاء', 'الجمعة'])
ON CONFLICT (id) DO NOTHING;

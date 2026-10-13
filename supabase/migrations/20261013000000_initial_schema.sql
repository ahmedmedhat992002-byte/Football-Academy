-- ==============================================================================
-- ACADEMY MANAGER - INITIAL DATABASE SCHEMA
-- Migration: 20261013000000_initial_schema.sql
-- Features:
--   - User Profiles (Admin, Coach, Parent)
--   - Groups & Players
--   - Training Sessions & Attendance
--   - Subscription Plans, Subscriptions & Payments
--   - Player Evaluations
--   - Row Level Security (RLS) policies per role
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ENUMS & TYPES
create type user_role as enum ('admin', 'coach', 'parent');
create type player_status as enum ('active', 'paused', 'left');
create type attendance_status as enum ('present', 'absent', 'late', 'excused');
create type plan_period as enum ('monthly', 'quarterly', 'yearly');
create type subscription_status as enum ('active', 'expired', 'overdue');
create type payment_method as enum ('cash', 'instapay', 'bank_transfer', 'other');

-- 2. UPDATED_AT TRIGGER FUNCTION
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  role user_role not null default 'parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at_column();

-- Helper security function: get current user role
create or replace function public.current_user_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- 4. GROUPS TABLE
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  age_category text not null, -- e.g. U8, U10, U12, U14, U16
  coach_id uuid references public.profiles(id) on delete set null,
  training_days text[] default '{}', -- e.g. ['Saturday', 'Tuesday']
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_groups_updated_at
  before update on public.groups
  for each row execute function update_updated_at_column();

-- 5. PLAYERS TABLE
create table if not exists public.players (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  birth_date date not null,
  photo_url text,
  group_id uuid references public.groups(id) on delete set null,
  parent_id uuid references public.profiles(id) on delete set null,
  status player_status not null default 'active',
  emergency_phone text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_players_updated_at
  before update on public.players
  for each row execute function update_updated_at_column();

-- 6. SESSIONS TABLE
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  group_id uuid not null references public.groups(id) on delete cascade,
  session_date date not null,
  start_time time not null,
  end_time time not null,
  location text not null default 'الملعب الرئيسي',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_sessions_updated_at
  before update on public.sessions
  for each row execute function update_updated_at_column();

-- 7. ATTENDANCE TABLE
create table if not exists public.attendance (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status attendance_status not null default 'present',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_session_player unique(session_id, player_id)
);

create trigger tr_attendance_updated_at
  before update on public.attendance
  for each row execute function update_updated_at_column();

-- 8. SUBSCRIPTION PLANS
create table if not exists public.subscription_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  period plan_period not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_subscription_plans_updated_at
  before update on public.subscription_plans
  for each row execute function update_updated_at_column();

-- 9. SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  status subscription_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function update_updated_at_column();

-- 10. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  method payment_method not null default 'cash',
  paid_at timestamptz not null default now(),
  receipt_no text not null,
  note text,
  created_at timestamptz not null default now()
);

-- 11. PLAYER EVALUATIONS TABLE
create table if not exists public.evaluations (
  id uuid default gen_random_uuid() primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  coach_id uuid references public.profiles(id) on delete set null,
  eval_date date not null default current_date,
  technical integer not null check (technical between 1 and 10),
  physical integer not null check (physical between 1 and 10),
  tactical integer not null check (tactical between 1 and 10),
  discipline integer not null check (discipline between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_evaluations_updated_at
  before update on public.evaluations
  for each row execute function update_updated_at_column();

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
create index ifnx_profiles_role on public.profiles(role);
create index ifnx_groups_coach on public.groups(coach_id);
create index ifnx_players_group on public.players(group_id);
create index ifnx_players_parent on public.players(parent_id);
create index ifnx_players_status on public.players(status);
create index ifnx_sessions_group on public.sessions(group_id, session_date);
create index ifnx_attendance_session on public.attendance(session_id);
create index ifnx_attendance_player on public.attendance(player_id);
create index ifnx_subscriptions_player on public.subscriptions(player_id, status);
create index ifnx_payments_subscription on public.payments(subscription_id);
create index ifnx_evaluations_player on public.evaluations(player_id, eval_date desc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.players enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.evaluations enable row level security;

-- PROFILES POLICIES
create policy "Admins full access on profiles"
  on public.profiles for all
  using (public.current_user_role() = 'admin');

create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- GROUPS POLICIES
create policy "Admins full access on groups"
  on public.groups for all
  using (public.current_user_role() = 'admin');

create policy "Coaches view assigned groups"
  on public.groups for select
  using (coach_id = auth.uid() or public.current_user_role() = 'admin');

create policy "Parents view child groups"
  on public.groups for select
  using (
    id in (
      select group_id from public.players where parent_id = auth.uid()
    )
  );

-- PLAYERS POLICIES
create policy "Admins full access on players"
  on public.players for all
  using (public.current_user_role() = 'admin');

create policy "Coaches view players in their groups"
  on public.players for select
  using (
    group_id in (select id from public.groups where coach_id = auth.uid())
  );

create policy "Parents view own children"
  on public.players for select
  using (parent_id = auth.uid());

-- SESSIONS POLICIES
create policy "Admins full access on sessions"
  on public.sessions for all
  using (public.current_user_role() = 'admin');

create policy "Coaches manage sessions for their groups"
  on public.sessions for all
  using (
    group_id in (select id from public.groups where coach_id = auth.uid())
  );

create policy "Parents view sessions for their children's groups"
  on public.sessions for select
  using (
    group_id in (
      select group_id from public.players where parent_id = auth.uid()
    )
  );

-- ATTENDANCE POLICIES
create policy "Admins full access on attendance"
  on public.attendance for all
  using (public.current_user_role() = 'admin');

create policy "Coaches manage attendance in their groups"
  on public.attendance for all
  using (
    session_id in (
      select s.id from public.sessions s
      join public.groups g on g.id = s.group_id
      where g.coach_id = auth.uid()
    )
  );

create policy "Parents view attendance of their children"
  on public.attendance for select
  using (
    player_id in (select id from public.players where parent_id = auth.uid())
  );

-- SUBSCRIPTION PLANS POLICIES
create policy "Admins manage plans"
  on public.subscription_plans for all
  using (public.current_user_role() = 'admin');

create policy "Authenticated users read plans"
  on public.subscription_plans for select
  using (auth.role() = 'authenticated');

-- SUBSCRIPTIONS POLICIES
create policy "Admins manage subscriptions"
  on public.subscriptions for all
  using (public.current_user_role() = 'admin');

create policy "Parents view own children subscriptions"
  on public.subscriptions for select
  using (
    player_id in (select id from public.players where parent_id = auth.uid())
  );

-- PAYMENTS POLICIES
create policy "Admins manage payments"
  on public.payments for all
  using (public.current_user_role() = 'admin');

create policy "Parents view payments for own children"
  on public.payments for select
  using (
    subscription_id in (
      select s.id from public.subscriptions s
      join public.players p on p.id = s.player_id
      where p.parent_id = auth.uid()
    )
  );

-- EVALUATIONS POLICIES
create policy "Admins manage evaluations"
  on public.evaluations for all
  using (public.current_user_role() = 'admin');

create policy "Coaches manage evaluations for their group players"
  on public.evaluations for all
  using (
    player_id in (
      select p.id from public.players p
      join public.groups g on g.id = p.group_id
      where g.coach_id = auth.uid()
    )
  );

create policy "Parents view evaluations for their children"
  on public.evaluations for select
  using (
    player_id in (select id from public.players where parent_id = auth.uid())
  );

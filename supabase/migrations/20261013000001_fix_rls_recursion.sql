-- ==============================================================================
-- FIX RLS RECURSION & PERMISSIONS (إصلاح الصلاحيات والتكرار في قاعدة البيانات)
-- ==============================================================================

-- 1. إلغاء السياسات السابقة لتجنب أي تكرار
drop policy if exists "Allow authenticated users to read groups" on public.groups;
drop policy if exists "Admins manage groups" on public.groups;
drop policy if exists "Parents view child groups" on public.groups;
drop policy if exists "Coaches view assigned groups" on public.groups;
drop policy if exists "Admins full access on groups" on public.groups;

drop policy if exists "Admins full access on players" on public.players;
drop policy if exists "Users view relevant players" on public.players;
drop policy if exists "Coaches view players in their groups" on public.players;
drop policy if exists "Parents view own children" on public.players;

drop policy if exists "Allow authenticated users to view sessions" on public.sessions;
drop policy if exists "Admins and coaches manage sessions" on public.sessions;
drop policy if exists "Coaches manage sessions for their groups" on public.sessions;
drop policy if exists "Parents view sessions for their children's groups" on public.sessions;
drop policy if exists "Admins full access on sessions" on public.sessions;

drop policy if exists "Allow authenticated users to view attendance" on public.attendance;
drop policy if exists "Admins and coaches manage attendance" on public.attendance;
drop policy if exists "Coaches manage attendance in their groups" on public.attendance;
drop policy if exists "Parents view attendance of their children" on public.attendance;
drop policy if exists "Admins full access on attendance" on public.attendance;

-- 2. سياسات المجموعات (GROUPS): قراءة عامة للجميع، والإدارة للمسؤولين
create policy "Allow read groups"
  on public.groups for select
  to public
  using (true);

create policy "Admins manage groups"
  on public.groups for all
  to authenticated
  using (public.current_user_role() = 'admin');

-- 3. سياسات اللاعبين (PLAYERS): المسؤول والمدرب يشاهدون الجميع، وولي الأمر يشاهد أبناءه فقط
create policy "Admins manage players"
  on public.players for all
  to authenticated
  using (public.current_user_role() = 'admin');

create policy "Users view relevant players"
  on public.players for select
  to authenticated
  using (
    parent_id = auth.uid()
    or public.current_user_role() in ('admin', 'coach')
  );

-- 4. سياسات الحصص التدريبية (SESSIONS): قراءة متاحة للجميع، والإدارة للمدربين والمسؤولين
create policy "Allow read sessions"
  on public.sessions for select
  to public
  using (true);

create policy "Admins and coaches manage sessions"
  on public.sessions for all
  to authenticated
  using (public.current_user_role() in ('admin', 'coach'));

-- 5. سياسات الحضور والغياب (ATTENDANCE)
create policy "Allow read attendance"
  on public.attendance for select
  to authenticated
  using (true);

create policy "Admins and coaches manage attendance"
  on public.attendance for all
  to authenticated
  using (public.current_user_role() in ('admin', 'coach'));

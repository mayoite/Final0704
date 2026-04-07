-- Planner admin RLS groundwork for browser-safe oversight.
-- Keeps owner-managed access intact while allowing authenticated admins
-- to read and update planner saves through the normal Supabase client.

alter table public.planner_saves enable row level security;

drop policy if exists "Users can manage own saves" on public.planner_saves;
drop policy if exists "Users can read own saves" on public.planner_saves;
drop policy if exists "Users can insert own saves" on public.planner_saves;
drop policy if exists "Users can update own saves" on public.planner_saves;
drop policy if exists "Users can delete own saves" on public.planner_saves;
drop policy if exists planner_saves_owner_select on public.planner_saves;
drop policy if exists planner_saves_owner_insert on public.planner_saves;
drop policy if exists planner_saves_owner_update on public.planner_saves;
drop policy if exists planner_saves_owner_delete on public.planner_saves;
drop policy if exists planner_saves_admin_select on public.planner_saves;
drop policy if exists planner_saves_admin_update on public.planner_saves;

create policy planner_saves_owner_select
  on public.planner_saves
  for select
  using (auth.uid() = user_id);

create policy planner_saves_owner_insert
  on public.planner_saves
  for insert
  with check (auth.uid() = user_id);

create policy planner_saves_owner_update
  on public.planner_saves
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy planner_saves_owner_delete
  on public.planner_saves
  for delete
  using (auth.uid() = user_id);

create policy planner_saves_admin_select
  on public.planner_saves
  for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy planner_saves_admin_update
  on public.planner_saves
  for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

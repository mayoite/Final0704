create extension if not exists "pgcrypto";

create table if not exists public.planner_managed_products (
  id uuid primary key default gen_random_uuid(),
  legacy_product_id text,
  slug text not null unique,
  planner_source_slug text not null,
  name text not null,
  description text not null default '',
  category text not null,
  category_id text not null,
  category_name text not null,
  series_id text not null,
  series_name text not null,
  price integer not null default 0,
  flagship_image text not null default '',
  images jsonb not null default '[]'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.planner_managed_products
  add column if not exists legacy_product_id text,
  add column if not exists description text,
  add column if not exists active boolean,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

update public.planner_managed_products
set description = ''
where description is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'planner_managed_products'
      and column_name = 'created_by_user_id'
  ) then
    execute $sql$
      update public.planner_managed_products
      set created_by = coalesce(created_by, created_by_user_id)
      where created_by is null
        and created_by_user_id is not null
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'planner_managed_products'
      and column_name = 'planner_visible'
  ) or exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'planner_managed_products'
      and column_name = 'planner_status'
  ) then
    execute $sql$
      update public.planner_managed_products
      set active = coalesce(
        active,
        case
          when coalesce(planner_visible, false) then true
          when planner_status = 'approved' then true
          else false
        end
      )
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'planner_managed_products'
      and column_name = 'metadata'
  ) then
    execute $sql$
      update public.planner_managed_products
      set legacy_product_id = coalesce(
        legacy_product_id,
        nullif(metadata ->> 'legacyProductId', ''),
        nullif(metadata ->> 'legacy_product_id', '')
      )
      where legacy_product_id is null
    $sql$;
  end if;
end $$;

update public.planner_managed_products
set flagship_image = ''
where flagship_image is null;

update public.planner_managed_products
set images = '[]'::jsonb
where images is null or jsonb_typeof(images) <> 'array';

update public.planner_managed_products
set specs = '{}'::jsonb
where specs is null or jsonb_typeof(specs) <> 'object';

update public.planner_managed_products
set metadata = '{}'::jsonb
where metadata is null or jsonb_typeof(metadata) <> 'object';

update public.planner_managed_products
set active = true
where active is null;

alter table public.planner_managed_products
  alter column description set default '',
  alter column description set not null,
  alter column flagship_image set default '',
  alter column flagship_image set not null,
  alter column images set default '[]'::jsonb,
  alter column images set not null,
  alter column specs set default '{}'::jsonb,
  alter column specs set not null,
  alter column metadata set default '{}'::jsonb,
  alter column metadata set not null,
  alter column active set default true,
  alter column active set not null;

create unique index if not exists planner_managed_products_slug_idx
  on public.planner_managed_products(slug);

create index if not exists planner_managed_products_active_idx
  on public.planner_managed_products(active);

create index if not exists planner_managed_products_source_slug_idx
  on public.planner_managed_products(planner_source_slug);

alter table public.planner_managed_products enable row level security;

drop policy if exists "Admins can read planner managed products" on public.planner_managed_products;
drop policy if exists "Admins can insert planner managed products" on public.planner_managed_products;
drop policy if exists "Admins can update planner managed products" on public.planner_managed_products;
drop policy if exists "Admins can delete planner managed products" on public.planner_managed_products;
drop policy if exists planner_managed_products_select_active on public.planner_managed_products;
drop policy if exists planner_managed_products_select_admin on public.planner_managed_products;
drop policy if exists planner_managed_products_insert_admin on public.planner_managed_products;
drop policy if exists planner_managed_products_update_admin on public.planner_managed_products;
drop policy if exists planner_managed_products_delete_admin on public.planner_managed_products;

create policy planner_managed_products_select_active
  on public.planner_managed_products for select
  using (active = true);

create policy planner_managed_products_select_admin
  on public.planner_managed_products for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy planner_managed_products_insert_admin
  on public.planner_managed_products for insert
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy planner_managed_products_update_admin
  on public.planner_managed_products for update
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

create policy planner_managed_products_delete_admin
  on public.planner_managed_products for delete
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create or replace function public.set_planner_managed_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists planner_managed_products_updated_at on public.planner_managed_products;
create trigger planner_managed_products_updated_at
before update on public.planner_managed_products
for each row execute function public.set_planner_managed_products_updated_at();

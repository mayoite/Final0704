create extension if not exists "pgcrypto";

create table if not exists public.planner_managed_products (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id uuid references auth.users(id) on delete set null,
  updated_by_user_id uuid references auth.users(id) on delete set null,
  name text not null default 'Untitled product',
  slug text not null,
  category text not null default 'Planner Managed',
  price integer not null default 0,
  flagship_image text,
  images jsonb not null default '[]'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  category_id text not null default 'planner-managed',
  category_name text not null default 'Planner Managed',
  series_id text not null default 'planner-managed',
  series_name text not null default 'Planner Managed',
  planner_visible boolean not null default false,
  planner_status text not null default 'candidate',
  planner_category text not null default 'planner-managed',
  planner_sort_order integer not null default 0,
  planner_render_style text,
  planner_top_view text,
  planner_source_key text,
  planner_source_slug text not null,
  planner_source_url text,
  planner_default_width_cm numeric(10,2),
  planner_default_depth_cm numeric(10,2),
  planner_default_height_cm numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planner_managed_products_name_not_blank check (btrim(name) <> ''),
  constraint planner_managed_products_slug_not_blank check (btrim(slug) <> ''),
  constraint planner_managed_products_source_slug_not_blank check (btrim(planner_source_slug) <> ''),
  constraint planner_managed_products_status_check check (
    planner_status in ('candidate', 'approved', 'hidden', 'archived')
  ),
  constraint planner_managed_products_price_check check (price >= 0),
  constraint planner_managed_products_sort_order_check check (planner_sort_order >= 0),
  constraint planner_managed_products_images_is_array check (jsonb_typeof(images) = 'array'),
  constraint planner_managed_products_specs_is_object check (jsonb_typeof(specs) = 'object'),
  constraint planner_managed_products_metadata_is_object check (jsonb_typeof(metadata) = 'object'),
  constraint planner_managed_products_default_width_positive check (
    planner_default_width_cm is null or planner_default_width_cm > 0
  ),
  constraint planner_managed_products_default_depth_positive check (
    planner_default_depth_cm is null or planner_default_depth_cm > 0
  ),
  constraint planner_managed_products_default_height_positive check (
    planner_default_height_cm is null or planner_default_height_cm > 0
  )
);

create unique index if not exists idx_planner_managed_products_slug
  on public.planner_managed_products (slug);

create unique index if not exists idx_planner_managed_products_source_slug
  on public.planner_managed_products (planner_source_slug);

create index if not exists idx_planner_managed_products_status
  on public.planner_managed_products (planner_status);

create index if not exists idx_planner_managed_products_created_by
  on public.planner_managed_products (created_by_user_id);

create index if not exists idx_planner_managed_products_category_sort
  on public.planner_managed_products (planner_category, planner_sort_order, id);

create index if not exists idx_planner_managed_products_visible_sort
  on public.planner_managed_products (planner_sort_order, id)
  where planner_visible;

alter table public.planner_managed_products enable row level security;

drop policy if exists "Admins can read planner managed products" on public.planner_managed_products;
create policy "Admins can read planner managed products"
  on public.planner_managed_products for select
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Admins can insert planner managed products" on public.planner_managed_products;
create policy "Admins can insert planner managed products"
  on public.planner_managed_products for insert
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Admins can update planner managed products" on public.planner_managed_products;
create policy "Admins can update planner managed products"
  on public.planner_managed_products for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Admins can delete planner managed products" on public.planner_managed_products;
create policy "Admins can delete planner managed products"
  on public.planner_managed_products for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create or replace function public.set_updated_at()
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
for each row execute function public.set_updated_at();

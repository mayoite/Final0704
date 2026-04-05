-- Add planner-specific canonical fields on top of the existing catalog product model.
-- This keeps product truth in the catalog tables while giving the planner a stable
-- approval, presentation, and delivery-oriented field set.

do $$
declare
  rel_name text;
begin
  foreach rel_name in array array['catalog_products', 'products']
  loop
    if exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = rel_name
        and c.relkind = 'r'
    ) then
      execute format(
        'alter table public.%I
           add column if not exists planner_visible boolean not null default false,
           add column if not exists planner_status text not null default ''candidate'',
           add column if not exists planner_category text,
           add column if not exists planner_sort_order integer not null default 0,
           add column if not exists planner_render_style text,
           add column if not exists planner_top_view text,
           add column if not exists planner_source_key text,
           add column if not exists planner_source_slug text,
           add column if not exists planner_source_url text,
           add column if not exists planner_last_ingested_at timestamptz,
           add column if not exists planner_default_width_cm numeric(10,2),
           add column if not exists planner_default_depth_cm numeric(10,2),
           add column if not exists planner_default_height_cm numeric(10,2)',
        rel_name
      );

      execute format(
        'alter table public.%I
           drop constraint if exists %I_planner_status_check',
        rel_name,
        rel_name
      );

      execute format(
        'alter table public.%I
           add constraint %I_planner_status_check
           check (planner_status in (''candidate'', ''approved'', ''hidden'', ''archived''))',
        rel_name,
        rel_name
      );

      execute format(
        $sql$
        update public.%I as t
        set
          planner_category = coalesce(
            planner_category,
            nullif(to_jsonb(t) ->> 'canonical_category_id', ''),
            nullif(to_jsonb(t) ->> 'category_id', '')
          ),
          planner_render_style = coalesce(
            planner_render_style,
            nullif(to_jsonb(t) -> 'metadata' ->> 'renderStyle', '')
          ),
          planner_top_view = coalesce(
            planner_top_view,
            nullif(to_jsonb(t) -> 'metadata' ->> 'topView', '')
          ),
          planner_source_key = coalesce(
            planner_source_key,
            nullif(to_jsonb(t) -> 'metadata' ->> 'sourceKey', '')
          ),
          planner_source_slug = coalesce(
            planner_source_slug,
            nullif(to_jsonb(t) -> 'metadata' ->> 'sourceSlug', '')
          ),
          planner_source_url = coalesce(
            planner_source_url,
            nullif(to_jsonb(t) -> 'metadata' ->> 'sourceUrl', '')
          ),
          planner_status = case
            when planner_visible then 'approved'
            when planner_status in ('candidate', 'approved', 'hidden', 'archived') then planner_status
            else 'candidate'
          end
        $sql$,
        rel_name
      );

      execute format(
        'create index if not exists idx_%I_planner_status on public.%I (planner_status)',
        rel_name,
        rel_name
      );

      execute format(
        'create index if not exists idx_%I_planner_category on public.%I (planner_category)',
        rel_name,
        rel_name
      );

      execute format(
        'create index if not exists idx_%I_planner_source_slug on public.%I (planner_source_slug)',
        rel_name,
        rel_name
      );

      execute format(
        'create index if not exists idx_%I_planner_visible_sort on public.%I (planner_sort_order, id) where planner_visible',
        rel_name,
        rel_name
      );

      execute format(
        'create index if not exists idx_%I_planner_visible_category_sort on public.%I (planner_category, planner_sort_order, id) where planner_visible',
        rel_name,
        rel_name
      );
    end if;
  end loop;
end
$$;

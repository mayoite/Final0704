import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { repairProductSlug } from "@/lib/catalogSlug";

type ProductRow = {
  id: string;
  category_id: string;
  canonical_category_id?: string | null;
  canonical_subcategory_id?: string | null;
  canonical_subcategory_label?: string | null;
  canonical_slug_v2?: string | null;
  canonical_series_id?: string | null;
  series: string | null;
  name: string;
  slug: string | null;
  description: string | null;
  images: unknown;
  flagship_image: string | null;
  map_layout: string | null;
  features: unknown;
  finishes: unknown;
  metadata: unknown;
  specs: unknown;
  series_id: string | null;
  series_name: string | null;
  created_at: string | null;
  alt_text: string | null;
  normalized_name_key?: string | null;
};

type CategoryRow = {
  id: string;
  canonical_id?: string | null;
  name: string;
  description: string | null;
};

type ProductSpecRow = {
  product_id: string;
  specs: unknown;
  source: string;
  created_at: string | null;
  updated_at: string | null;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  image_kind: string;
  variant_id: string | null;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
};

type ProductSlugAliasRow = {
  id: number | string;
  alias_slug: string;
  canonical_slug: string;
  reason: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type BusinessStatsRow = {
  id: string;
  projects_delivered: number;
  client_organisations: number;
  sectors_served: number;
  locations_served: number;
  years_experience: number;
  as_of_date: string;
  is_active: boolean;
  updated_at: string | null;
};

const PAGE_SIZE = 1000;
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 800;

function buildEndpointCandidates(rawEndpoint: string): string[] {
  const trimmed = rawEndpoint.trim().replace(/\/+$/, "");
  if (!trimmed) return [];
  if (trimmed.endsWith("/v1/graphql")) {
    const v1 = trimmed.replace(/\/v1\/graphql$/, "/v1");
    return [trimmed, v1];
  }
  if (trimmed.endsWith("/v1")) {
    return [`${trimmed}/graphql`, trimmed];
  }
  return [`${trimmed}/v1/graphql`, `${trimmed}/v1`, trimmed];
}

function getGraphqlHeaders(credential: string): Array<Record<string, string>> {
  if (credential.includes(".")) {
    return [
      { "Content-Type": "application/json", Authorization: `Bearer ${credential}` },
      { "Content-Type": "application/json", "x-hasura-admin-secret": credential },
    ];
  }

  return [
    { "Content-Type": "application/json", "x-hasura-admin-secret": credential },
    { "Content-Type": "application/json", Authorization: `Bearer ${credential}` },
  ];
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function fetchAllRows<T>(
  supabase: SupabaseClient,
  table: string,
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    let data: T[] | null = null;
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      const response = await supabase
        .from(table)
        .select("*")
        .range(offset, offset + PAGE_SIZE - 1);

      if (!response.error) {
        data = (response.data ?? []) as T[];
        lastError = null;
        break;
      }

      lastError = response.error.message;
      const normalized = lastError.toLowerCase();
      const transient =
        normalized.includes("ssl handshake failed") ||
        normalized.includes("error code 525") ||
        normalized.includes("cloudflare") ||
        normalized.includes("<!doctype html") ||
        normalized.includes("fetch failed") ||
        normalized.includes("timeout");

      if (!transient || attempt >= MAX_RETRIES) break;

      const waitMs = BASE_RETRY_DELAY_MS * 2 ** (attempt - 1);
      console.warn(
        `[supabase:${table}] transient error at offset=${offset}, retry ${attempt}/${MAX_RETRIES} in ${waitMs}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    if (lastError) throw new Error(`[supabase:${table}] ${lastError}`);

    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  return rows;
}

type VerificationInputs = {
  sampleProductSlug: string;
  sampleActiveAliasSlug: string | null;
  expectedActiveBusinessStatsRows: number;
};

function summarizeError(error: unknown): string {
  if (!error) return "unknown error";
  if (error instanceof Error) return error.message;
  return String(error);
}

async function runNhostGraphqlQuery<T>(
  label: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const rawEndpoint =
    process.env.NHOST_GRAPHQL_ENDPOINT?.trim() ||
    process.env.NHOST_GRAPHQL_URL?.trim();
  const credential =
    process.env.NHOST_ADMIN_SECRET?.trim() ||
    process.env.NHOST_SERVICE_ROLE_KEY?.trim();
  if (!rawEndpoint || !credential) {
    throw new Error(
      `[verify:graphql:${label}] missing NHOST_GRAPHQL_ENDPOINT/NHOST_GRAPHQL_URL or NHOST_ADMIN_SECRET/NHOST_SERVICE_ROLE_KEY`,
    );
  }

  const endpoints = buildEndpointCandidates(rawEndpoint);
  const headerCandidates = getGraphqlHeaders(credential);
  let lastError = "unknown GraphQL error";

  for (const endpoint of endpoints) {
    for (const headers of headerCandidates) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({ query, variables }),
          cache: "no-store",
        });

        if (!response.ok) {
          lastError = `http ${response.status}`;
          continue;
        }

        const payload = (await response.json()) as {
          data?: T;
          errors?: Array<{ message?: string }>;
        };

        if (Array.isArray(payload.errors) && payload.errors.length > 0) {
          lastError = payload.errors[0]?.message || "unknown GraphQL error";
          continue;
        }

        if (!payload.data) {
          lastError = "missing GraphQL data payload";
          continue;
        }

        return payload.data;
      } catch (error) {
        lastError = summarizeError(error);
      }
    }
  }

  throw new Error(`[verify:graphql:${label}] ${lastError}`);
}

async function verifyNhostGraphqlReads(input: VerificationInputs) {
  const productData = await runNhostGraphqlQuery<{ products?: Array<{ id: string; slug: string }> }>(
    "product-by-slug",
    `
      query VerifyProductBySlug($slug: String!) {
        products(where: { slug: { _eq: $slug } }, limit: 1) {
          id
          slug
        }
      }
    `,
    { slug: input.sampleProductSlug },
  );
  const productRows = productData.products ?? [];
  if (productRows.length === 0) {
    throw new Error(`[verify:graphql:product-by-slug] missing slug=${input.sampleProductSlug}`);
  }

  const statsData = await runNhostGraphqlQuery<{
    business_stats_current?: Array<{ id: string; as_of_date: string; is_active: boolean }>;
  }>(
    "active-business-stats",
    `
      query VerifyActiveBusinessStats {
        business_stats_current(where: { is_active: { _eq: true } }, limit: 1) {
          id
          as_of_date
          is_active
        }
      }
    `,
  );
  const statsRows = statsData.business_stats_current ?? [];
  if (input.expectedActiveBusinessStatsRows > 0 && statsRows.length === 0) {
    throw new Error("[verify:graphql:active-business-stats] missing active row");
  }

  if (input.sampleActiveAliasSlug) {
    const aliasData = await runNhostGraphqlQuery<{
      product_slug_aliases?: Array<{ alias_slug: string; canonical_slug: string }>;
    }>(
      "alias-lookup",
      `
        query VerifyAliasLookup($aliasSlug: String!) {
          product_slug_aliases(
            where: { alias_slug: { _eq: $aliasSlug }, is_active: { _eq: true } }
            limit: 1
          ) {
            alias_slug
            canonical_slug
          }
        }
      `,
      { aliasSlug: input.sampleActiveAliasSlug },
    );
    const aliasRows = aliasData.product_slug_aliases ?? [];
    if (aliasRows.length === 0) {
      throw new Error(
        `[verify:graphql:alias-lookup] missing alias_slug=${input.sampleActiveAliasSlug}`,
      );
    }
  } else {
    console.log("[verify] GraphQL alias lookup skipped (no active alias rows to verify)");
  }

  console.log(
    `[verify] GraphQL reads ok: product-by-slug, active-business-stats${input.sampleActiveAliasSlug ? ", alias-lookup" : ""}`,
  );
}

async function verifyNhostSqlReads(sql: postgres.Sql, input: VerificationInputs) {
  const productRows = await sql<Array<{ id: string; slug: string }>>`
    select id, slug
    from public.products
    where slug = ${input.sampleProductSlug}
    limit 1
  `;
  if (productRows.length === 0) {
    throw new Error(`[verify:sql:product-by-slug] missing slug=${input.sampleProductSlug}`);
  }

  const statsRows = await sql<Array<{ id: string }>>`
    select id
    from public.business_stats_current
    where is_active = true
    order by updated_at desc nulls last, as_of_date desc
    limit 1
  `;
  if (input.expectedActiveBusinessStatsRows > 0 && statsRows.length === 0) {
    throw new Error("[verify:sql:active-business-stats] missing active row");
  }

  if (input.sampleActiveAliasSlug) {
    const aliasRows = await sql<Array<{ alias_slug: string; canonical_slug: string }>>`
      select alias_slug, canonical_slug
      from public.product_slug_aliases
      where alias_slug = ${input.sampleActiveAliasSlug}
        and is_active = true
      limit 1
    `;
    if (aliasRows.length === 0) {
      throw new Error(`[verify:sql:alias-lookup] missing alias_slug=${input.sampleActiveAliasSlug}`);
    }
  } else {
    console.log("[verify] SQL alias lookup skipped (no active alias rows to verify)");
  }

  console.log(
    `[verify] SQL reads ok: product-by-slug, active-business-stats${input.sampleActiveAliasSlug ? ", alias-lookup" : ""}`,
  );
}

async function verifyNhostCounts(
  sql: postgres.Sql,
  expectedCounts: Record<string, number>,
) {
  const rows = await sql<Array<Record<string, number>>>`
    select
      (select count(*)::int from public.catalog_products) as catalog_products,
      (select count(*)::int from public.catalog_categories) as catalog_categories,
      (select count(*)::int from public.catalog_product_specs) as catalog_product_specs,
      (select count(*)::int from public.catalog_product_images) as catalog_product_images,
      (select count(*)::int from public.catalog_product_slug_aliases) as catalog_product_slug_aliases,
      (select count(*)::int from public.business_stats_current) as business_stats_current,
      (select count(*)::int from public.products) as products,
      (select count(*)::int from public.categories) as categories,
      (select count(*)::int from public.product_specs) as product_specs,
      (select count(*)::int from public.product_images) as product_images,
      (select count(*)::int from public.product_slug_aliases) as product_slug_aliases
  `;
  const actual = rows[0] ?? {};
  const mismatches: string[] = [];

  for (const [table, expected] of Object.entries(expectedCounts)) {
    const actualCount = Number(actual[table] ?? NaN);
    if (!Number.isFinite(actualCount) || actualCount !== expected) {
      mismatches.push(`${table}: expected=${expected}, actual=${String(actual[table])}`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`[verify:counts] mismatch detected: ${mismatches.join("; ")}`);
  }

  console.log(`[verify] row counts matched=${JSON.stringify(actual)}`);
}

async function main() {
  config({ path: ".env.local" });

  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const nhostDbUrl = requiredEnv("NHOST_DATABASE_URL");

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const sql = postgres(nhostDbUrl, {
    ssl: "require",
    max: 1,
    connect_timeout: 15,
    idle_timeout: 20,
  });

  try {
    console.log("[sync] fetching rows from Supabase...");
    const [products, categories, specs, images, aliases, stats] = await Promise.all([
      fetchAllRows<ProductRow>(supabase, "products"),
      fetchAllRows<CategoryRow>(supabase, "categories"),
      fetchAllRows<ProductSpecRow>(supabase, "product_specs"),
      fetchAllRows<ProductImageRow>(supabase, "product_images"),
      fetchAllRows<ProductSlugAliasRow>(supabase, "product_slug_aliases"),
      fetchAllRows<BusinessStatsRow>(supabase, "business_stats_current"),
    ]);
    console.log(
      `[sync] products=${products.length} categories=${categories.length} product_specs=${specs.length} product_images=${images.length} product_slug_aliases=${aliases.length} business_stats_current=${stats.length}`,
    );

    const productPayload = products.map((row) => {
      const repairedSlug = repairProductSlug({
        slug: row.slug,
        categoryId: row.category_id,
        name: row.name,
      });
      return {
        id: row.id,
        category_id: row.category_id,
        canonical_category_id: row.canonical_category_id ?? row.category_id,
        canonical_subcategory_id: row.canonical_subcategory_id ?? null,
        canonical_subcategory_label: row.canonical_subcategory_label ?? null,
        canonical_slug_v2: row.canonical_slug_v2 ?? null,
        canonical_series_id: row.canonical_series_id ?? null,
        series: row.series ?? null,
        name: row.name,
        slug: repairedSlug,
        description: row.description ?? null,
        images: row.images ?? [],
        flagship_image: row.flagship_image ?? null,
        map_layout: row.map_layout ?? null,
        features: row.features ?? [],
        finishes: row.finishes ?? [],
        metadata: row.metadata ?? {},
        specs: row.specs ?? {},
        series_id: row.series_id ?? null,
        series_name: row.series_name ?? null,
        created_at: row.created_at ?? new Date().toISOString(),
        alt_text: row.alt_text ?? null,
        normalized_name_key:
          row.normalized_name_key ??
          row.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
      };
    });

    const categoryPayload = categories.map((row) => ({
      id: row.id,
      canonical_id: row.canonical_id ?? row.id,
      name: row.name,
      description: row.description ?? null,
    }));

    const specPayload = specs.map((row) => ({
      product_id: row.product_id,
      specs: row.specs ?? {},
      source: row.source || "products.specs",
      created_at: row.created_at ?? new Date().toISOString(),
      updated_at: row.updated_at ?? new Date().toISOString(),
    }));

    const imagePayload = images.map((row) => ({
      id: row.id,
      product_id: row.product_id,
      image_url: row.image_url,
      image_kind: row.image_kind,
      variant_id: row.variant_id ?? null,
      sort_order: Number(row.sort_order) || 0,
      created_at: row.created_at ?? new Date().toISOString(),
      updated_at: row.updated_at ?? new Date().toISOString(),
    }));

    const canonicalSlugSet = new Set(
      productPayload
        .map((row) => String(row.slug || "").trim())
        .filter(Boolean),
    );

    const aliasPayloadRaw = aliases.map((row) => ({
      id: Number(row.id),
      alias_slug: row.alias_slug,
      canonical_slug: row.canonical_slug,
      reason: row.reason || "legacy_alias",
      is_active: Boolean(row.is_active),
      created_at: row.created_at ?? new Date().toISOString(),
      updated_at: row.updated_at ?? new Date().toISOString(),
    }));

    const aliasPayload = aliasPayloadRaw.filter((row) =>
      canonicalSlugSet.has(String(row.canonical_slug || "").trim()),
    );
    const droppedAliasCount = aliasPayloadRaw.length - aliasPayload.length;
    if (droppedAliasCount > 0) {
      console.warn(
        `[sync] dropping ${droppedAliasCount} alias rows with missing canonical_slug in products`,
      );
    }

    const statsPayload = stats.map((row) => ({
      id: row.id,
      projects_delivered: Number(row.projects_delivered) || 0,
      client_organisations: Number(row.client_organisations) || 0,
      sectors_served: Number(row.sectors_served) || 0,
      locations_served: Number(row.locations_served) || 0,
      years_experience: Number(row.years_experience) || 0,
      as_of_date: row.as_of_date,
      is_active: Boolean(row.is_active),
      updated_at: row.updated_at ?? null,
    }));

    await sql.begin(async (tx) => {
      await tx`create extension if not exists pgcrypto;`;

      await tx.unsafe(`
        do $$
        declare
          rel_name text;
          rel_kind "char";
        begin
          foreach rel_name in array array[
            'product_slug_aliases',
            'product_images',
            'product_specs',
            'categories',
            'products',
            'catalog_product_slug_aliases',
            'catalog_product_images',
            'catalog_product_specs',
            'catalog_products',
            'catalog_categories',
            'business_stats_current'
          ]
          loop
            select c.relkind
            into rel_kind
            from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relname = rel_name
            limit 1;

            if rel_kind = 'v' then
              execute format('drop view public.%I cascade', rel_name);
            elsif rel_kind = 'r' then
              execute format('drop table public.%I cascade', rel_name);
            end if;

            rel_kind := null;
          end loop;
        end
        $$;
      `);

      await tx`
        create table public.catalog_categories (
          id text primary key,
          canonical_id text,
          name text not null,
          description text
        );
      `;

      await tx`
        create table public.catalog_products (
          id uuid primary key,
          category_id text not null,
          canonical_category_id text,
          canonical_subcategory_id text,
          canonical_subcategory_label text,
          canonical_slug_v2 text,
          canonical_series_id text,
          series text,
          name text not null,
          slug text not null unique,
          description text,
          images jsonb not null default '[]'::jsonb,
          flagship_image text,
          map_layout text,
          features jsonb not null default '[]'::jsonb,
          finishes jsonb not null default '[]'::jsonb,
          metadata jsonb not null default '{}'::jsonb,
          specs jsonb not null default '{}'::jsonb,
          series_id text,
          series_name text,
          created_at timestamptz not null default now(),
          alt_text text,
          normalized_name_key text
        );
      `;

      await tx`
        create table public.catalog_product_specs (
          product_id uuid primary key references public.catalog_products(id) on delete cascade,
          specs jsonb not null default '{}'::jsonb,
          source text not null default 'products.specs',
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          constraint catalog_product_specs_specs_is_object check (jsonb_typeof(specs) = 'object')
        );
      `;

      await tx`
        create table public.catalog_product_images (
          id uuid primary key default gen_random_uuid(),
          product_id uuid not null references public.catalog_products(id) on delete cascade,
          image_url text not null,
          image_kind text not null default 'gallery',
          variant_id text,
          sort_order integer not null default 0,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          constraint catalog_product_images_kind_check check (
            image_kind in ('flagship', 'gallery', 'scene', 'variant', 'other')
          )
        );
      `;

      await tx`
        create table public.catalog_product_slug_aliases (
          id bigint primary key,
          alias_slug text not null,
          canonical_slug text not null references public.catalog_products(slug) on update cascade on delete cascade,
          reason text not null default 'legacy_alias',
          is_active boolean not null default true,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          constraint catalog_product_slug_aliases_alias_not_blank check (btrim(alias_slug) <> ''),
          constraint catalog_product_slug_aliases_canonical_not_blank check (btrim(canonical_slug) <> ''),
          constraint catalog_product_slug_aliases_not_self check (alias_slug <> canonical_slug)
        );
      `;

      await tx`
        create table public.business_stats_current (
          id uuid primary key default gen_random_uuid(),
          projects_delivered int not null default 0,
          client_organisations int not null default 0,
          sectors_served int not null default 0,
          locations_served int not null default 0,
          years_experience int not null default 0,
          as_of_date date not null,
          is_active boolean not null default true,
          updated_at timestamptz not null default now()
        );
      `;

      await tx.unsafe(`
        create table public.categories (like public.catalog_categories including defaults);
        create table public.products (like public.catalog_products including defaults);
        create table public.product_specs (like public.catalog_product_specs including defaults);
        create table public.product_images (like public.catalog_product_images including defaults);
        create table public.product_slug_aliases (like public.catalog_product_slug_aliases including defaults);
      `);

      await tx.unsafe(`
        create index idx_catalog_products_slug on public.catalog_products(slug);
        create index idx_catalog_products_category_id on public.catalog_products(category_id);
        create index idx_catalog_products_canonical_category_id on public.catalog_products(canonical_category_id);
        create index idx_catalog_products_canonical_subcategory_id on public.catalog_products(canonical_subcategory_id);
        create index idx_catalog_products_canonical_slug_v2 on public.catalog_products(canonical_slug_v2);
        create index idx_catalog_products_name on public.catalog_products(name);
        create index idx_catalog_products_category_normalized_name_key
          on public.catalog_products(category_id, normalized_name_key);
        create index idx_catalog_product_specs_source on public.catalog_product_specs(source);
        create unique index idx_catalog_product_images_unique
          on public.catalog_product_images(product_id, image_kind, image_url, sort_order);
        create index idx_catalog_product_images_lookup
          on public.catalog_product_images(product_id, image_kind, sort_order);
        create unique index idx_catalog_product_slug_aliases_active_alias
          on public.catalog_product_slug_aliases(alias_slug)
          where is_active;
        create index idx_catalog_product_slug_aliases_active_canonical
          on public.catalog_product_slug_aliases(canonical_slug)
          where is_active;
        create unique index ux_business_stats_active_true
          on public.business_stats_current ((is_active))
          where is_active = true;
      `);

      await tx.unsafe(`
        create or replace function public.compute_normalized_product_name_key(source_name text)
        returns text
        language sql
        immutable
        as $$
          select nullif(
            trim(both '-' from regexp_replace(lower(coalesce(source_name, '')), '[^a-z0-9]+', '-', 'g')),
            ''
          );
        $$;

        create or replace function public.set_catalog_products_normalized_name_key()
        returns trigger
        language plpgsql
        as $$
        begin
          new.normalized_name_key := public.compute_normalized_product_name_key(new.name);
          return new;
        end;
        $$;

        create or replace function public.touch_catalog_product_specs_updated_at()
        returns trigger
        language plpgsql
        as $$
        begin
          new.updated_at = now();
          return new;
        end;
        $$;

        create or replace function public.touch_catalog_product_images_updated_at()
        returns trigger
        language plpgsql
        as $$
        begin
          new.updated_at = now();
          return new;
        end;
        $$;

        create or replace function public.touch_catalog_product_slug_aliases_updated_at()
        returns trigger
        language plpgsql
        as $$
        begin
          new.updated_at = now();
          return new;
        end;
        $$;
      `);

      await tx.unsafe(`
        create trigger trg_set_catalog_products_normalized_name_key
        before insert or update of name on public.catalog_products
        for each row execute function public.set_catalog_products_normalized_name_key();

        create trigger trg_touch_catalog_product_specs_updated_at
        before update on public.catalog_product_specs
        for each row execute function public.touch_catalog_product_specs_updated_at();

        create trigger trg_touch_catalog_product_images_updated_at
        before update on public.catalog_product_images
        for each row execute function public.touch_catalog_product_images_updated_at();

        create trigger trg_touch_catalog_product_slug_aliases_updated_at
        before update on public.catalog_product_slug_aliases
        for each row execute function public.touch_catalog_product_slug_aliases_updated_at();
      `);

      if (categoryPayload.length > 0) {
        await tx`insert into public.catalog_categories ${tx(categoryPayload, ["id", "canonical_id", "name", "description"])}`;
        await tx`insert into public.categories ${tx(categoryPayload, ["id", "canonical_id", "name", "description"])}`;
      }
      if (productPayload.length > 0) {
        await tx`
          insert into public.catalog_products ${tx(productPayload, [
            "id",
            "category_id",
            "canonical_category_id",
            "canonical_subcategory_id",
            "canonical_subcategory_label",
            "canonical_slug_v2",
            "canonical_series_id",
            "series",
            "name",
            "slug",
            "description",
            "images",
            "flagship_image",
            "map_layout",
            "features",
            "finishes",
            "metadata",
            "specs",
            "series_id",
            "series_name",
            "created_at",
            "alt_text",
            "normalized_name_key",
          ])}
        `;
        await tx`
          insert into public.products ${tx(productPayload, [
            "id",
            "category_id",
            "canonical_category_id",
            "canonical_subcategory_id",
            "canonical_subcategory_label",
            "canonical_slug_v2",
            "canonical_series_id",
            "series",
            "name",
            "slug",
            "description",
            "images",
            "flagship_image",
            "map_layout",
            "features",
            "finishes",
            "metadata",
            "specs",
            "series_id",
            "series_name",
            "created_at",
            "alt_text",
            "normalized_name_key",
          ])}
        `;
      }
      if (specPayload.length > 0) {
        await tx`
          insert into public.catalog_product_specs ${tx(specPayload, [
            "product_id",
            "specs",
            "source",
            "created_at",
            "updated_at",
          ])}
        `;
        await tx`
          insert into public.product_specs ${tx(specPayload, [
            "product_id",
            "specs",
            "source",
            "created_at",
            "updated_at",
          ])}
        `;
      }
      if (imagePayload.length > 0) {
        await tx`
          insert into public.catalog_product_images ${tx(imagePayload, [
            "id",
            "product_id",
            "image_url",
            "image_kind",
            "variant_id",
            "sort_order",
            "created_at",
            "updated_at",
          ])}
        `;
        await tx`
          insert into public.product_images ${tx(imagePayload, [
            "id",
            "product_id",
            "image_url",
            "image_kind",
            "variant_id",
            "sort_order",
            "created_at",
            "updated_at",
          ])}
        `;
      }
      if (aliasPayload.length > 0) {
        await tx`
          insert into public.catalog_product_slug_aliases ${tx(aliasPayload, [
            "id",
            "alias_slug",
            "canonical_slug",
            "reason",
            "is_active",
            "created_at",
            "updated_at",
          ])}
        `;
        await tx`
          insert into public.product_slug_aliases ${tx(aliasPayload, [
            "id",
            "alias_slug",
            "canonical_slug",
            "reason",
            "is_active",
            "created_at",
            "updated_at",
          ])}
        `;
      }
      if (statsPayload.length > 0) {
        await tx`
          insert into public.business_stats_current ${tx(statsPayload, [
            "id",
            "projects_delivered",
            "client_organisations",
            "sectors_served",
            "locations_served",
            "years_experience",
            "as_of_date",
            "is_active",
            "updated_at",
          ])}
        `;
      }

      await tx.unsafe(`
        create or replace view public.product_name_collisions as
        select
          category_id,
          normalized_name_key,
          count(*) as row_count,
          array_agg(slug order by slug) as slugs
        from public.catalog_products
        where normalized_name_key is not null
        group by category_id, normalized_name_key
        having count(*) > 1;
      `);
    });

    const sampleProductSlug = productPayload
      .map((row) => String(row.slug || "").trim())
      .find((value) => Boolean(value));
    if (!sampleProductSlug) {
      throw new Error("[verify] unable to select a product slug for post-sync verification");
    }

    const sampleActiveAliasSlug =
      aliasPayload
        .map((row) => ({
          alias_slug: String(row.alias_slug || "").trim(),
          is_active: Boolean(row.is_active),
        }))
        .find((row) => row.is_active && row.alias_slug.length > 0)?.alias_slug ?? null;
    const expectedActiveBusinessStatsRows = statsPayload.filter((row) => row.is_active).length;

    await verifyNhostCounts(sql, {
      catalog_products: productPayload.length,
      catalog_categories: categoryPayload.length,
      catalog_product_specs: specPayload.length,
      catalog_product_images: imagePayload.length,
      catalog_product_slug_aliases: aliasPayload.length,
      business_stats_current: statsPayload.length,
      products: productPayload.length,
      categories: categoryPayload.length,
      product_specs: specPayload.length,
      product_images: imagePayload.length,
      product_slug_aliases: aliasPayload.length,
    });
    await verifyNhostGraphqlReads({
      sampleProductSlug,
      sampleActiveAliasSlug,
      expectedActiveBusinessStatsRows,
    });
    await verifyNhostSqlReads(sql, {
      sampleProductSlug,
      sampleActiveAliasSlug,
      expectedActiveBusinessStatsRows,
    });
    console.log("[sync] completed successfully");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
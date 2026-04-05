import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";

type CountRow = {
  table_name: string;
  row_count: number;
};

type NhostCountMap = Record<string, number>;

type GraphqlCheck = {
  label: string;
  ok: boolean;
  detail: string;
};

type ParityAudit = {
  generatedAt: string;
  supabaseHost: string;
  nhostDbHost: string;
  supabaseCounts: NhostCountMap;
  nhostCounts: NhostCountMap;
  diffs: Array<{
    table: string;
    supabase: number;
    nhost: number;
    diff: number;
  }>;
  graphqlChecks: GraphqlCheck[];
  sampledSlugChecks: Array<{
    slug: string;
    canonicalInNhost: boolean;
    aliasInNhost: boolean;
  }>;
  sampledAliasChecks: Array<{
    alias_slug: string;
    canonical_slug: string;
    resolvesInNhost: boolean;
  }>;
};

const SUPABASE_TABLES = [
  "categories",
  "products",
  "product_specs",
  "product_images",
  "product_slug_aliases",
  "business_stats_current",
];

const NHOST_TABLES = [
  "catalog_categories",
  "catalog_products",
  "catalog_product_specs",
  "catalog_product_images",
  "catalog_product_slug_aliases",
  "business_stats_current",
  "categories",
  "products",
  "product_specs",
  "product_images",
  "product_slug_aliases",
];

function getEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function summarizeError(error: unknown): string {
  if (!error) return "unknown";
  const text =
    error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);
  return text.replace(/\s+/g, " ").trim();
}

function parseHostFromDsn(dsn: string): string {
  try {
    if (dsn.startsWith("postgresql://")) {
      return new URL(dsn.replace(/^postgresql:\/\//, "http://")).host;
    }
    if (dsn.startsWith("postgres://")) {
      return new URL(dsn.replace(/^postgres:\/\//, "http://")).host;
    }
    return new URL(dsn).host;
  } catch {
    const match = dsn.match(/@([^/?]+)/);
    return match?.[1] ?? "unknown";
  }
}

function createSupabaseAdminClient(): SupabaseClient {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim() ??
    "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    "";
  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function supabaseCounts(client: SupabaseClient): Promise<NhostCountMap> {
  const counts: NhostCountMap = {};
  for (const table of SUPABASE_TABLES) {
    const response = await client.from(table).select("*", { count: "exact", head: true });
    counts[table] = response.error ? -1 : response.count ?? 0;
  }
  return counts;
}

async function nhostCounts(sql: postgres.Sql): Promise<NhostCountMap> {
  const counts: NhostCountMap = {};
  for (const table of NHOST_TABLES) {
    try {
      const rows = await sql.unsafe<CountRow[]>(
        `select '${table}'::text as table_name, count(*)::int as row_count from public."${table}"`,
      );
      counts[table] = rows[0]?.row_count ?? -1;
    } catch {
      counts[table] = -1;
    }
  }
  return counts;
}

async function runGraphqlChecks(): Promise<GraphqlCheck[]> {
  const endpoint =
    process.env.NHOST_GRAPHQL_ENDPOINT?.trim() ||
    process.env.NHOST_GRAPHQL_URL?.trim() ||
    "";
  const secret =
    process.env.NHOST_ADMIN_SECRET?.trim() ||
    process.env.NHOST_SERVICE_ROLE_KEY?.trim() ||
    "";

  if (!endpoint || !secret) {
    return [
      {
        label: "GraphQL probe",
        ok: false,
        detail: "skipped: missing NHOST_GRAPHQL_ENDPOINT/URL or admin secret",
      },
    ];
  }

  const checks: Array<{ label: string; query: string }> = [
    {
      label: "products",
      query: "query VerifyProducts { products(limit: 1) { id slug } }",
    },
    {
      label: "product_slug_aliases",
      query:
        "query VerifyAliases { product_slug_aliases(limit: 1) { alias_slug canonical_slug } }",
    },
    {
      label: "business_stats_current",
      query:
        "query VerifyStats { business_stats_current(limit: 1) { id as_of_date is_active } }",
    },
  ];

  const results: GraphqlCheck[] = [];
  for (const check of checks) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": secret,
        },
        body: JSON.stringify({ query: check.query }),
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        errors?: Array<{ message?: string }>;
      };
      if (!response.ok) {
        results.push({ label: check.label, ok: false, detail: `http ${response.status}` });
        continue;
      }
      if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        results.push({
          label: check.label,
          ok: false,
          detail: summarizeError(payload.errors[0]?.message),
        });
        continue;
      }
      results.push({ label: check.label, ok: true, detail: "ok" });
    } catch (error) {
      results.push({ label: check.label, ok: false, detail: summarizeError(error) });
    }
  }

  return results;
}

function renderMarkdown(audit: ParityAudit): string {
  const lines: string[] = [];
  lines.push("# Nhost Parity Audit");
  lines.push("");
  lines.push(`- Generated at: ${audit.generatedAt}`);
  lines.push(`- Supabase host: ${audit.supabaseHost}`);
  lines.push(`- Nhost DB host: ${audit.nhostDbHost}`);
  lines.push("");
  lines.push("## Count Diffs");
  for (const diff of audit.diffs) {
    lines.push(`- ${diff.table}: supabase=${diff.supabase}, nhost=${diff.nhost}, diff=${diff.diff}`);
  }
  lines.push("");
  lines.push("## GraphQL Checks");
  for (const check of audit.graphqlChecks) {
    lines.push(`- ${check.label}: ${check.ok ? "ok" : "fail"} (${check.detail})`);
  }
  lines.push("");
  lines.push("## Sampled Canonical Slug Checks");
  for (const item of audit.sampledSlugChecks) {
    lines.push(
      `- ${item.slug}: canonicalInNhost=${item.canonicalInNhost ? "yes" : "no"}, aliasInNhost=${item.aliasInNhost ? "yes" : "no"}`,
    );
  }
  lines.push("");
  lines.push("## Sampled Alias Checks");
  for (const item of audit.sampledAliasChecks) {
    lines.push(
      `- ${item.alias_slug} -> ${item.canonical_slug}: resolvesInNhost=${item.resolvesInNhost ? "yes" : "no"}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  config({ path: ".env.local" });

  const supabase = createSupabaseAdminClient();
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const nhostDbUrl = getEnv("NHOST_DATABASE_URL");

  const sql = postgres(nhostDbUrl, {
    ssl: "require",
    max: 1,
    connect_timeout: 10,
    idle_timeout: 10,
  });

  try {
    const [supabaseCountMap, nhostCountMap, graphqlChecks] = await Promise.all([
      supabaseCounts(supabase),
      nhostCounts(sql),
      runGraphqlChecks(),
    ]);

    const pairs: Array<[string, string]> = [
      ["categories", "categories"],
      ["products", "products"],
      ["product_specs", "product_specs"],
      ["product_images", "product_images"],
      ["product_slug_aliases", "product_slug_aliases"],
      ["business_stats_current", "business_stats_current"],
      ["categories", "catalog_categories"],
      ["products", "catalog_products"],
      ["product_specs", "catalog_product_specs"],
      ["product_images", "catalog_product_images"],
      ["product_slug_aliases", "catalog_product_slug_aliases"],
    ];

    const diffs = pairs.map(([supa, nhost]) => ({
      table: `${supa} -> ${nhost}`,
      supabase: supabaseCountMap[supa] ?? -1,
      nhost: nhostCountMap[nhost] ?? -1,
      diff: (nhostCountMap[nhost] ?? -1) - (supabaseCountMap[supa] ?? -1),
    }));

    const sampledProductsResponse = await supabase
      .from("products")
      .select("slug")
      .not("slug", "is", null)
      .order("slug", { ascending: true })
      .limit(10);
    if (sampledProductsResponse.error) {
      throw new Error(`Failed sampling products: ${summarizeError(sampledProductsResponse.error.message)}`);
    }
    const sampleSlugs = (sampledProductsResponse.data ?? [])
      .map((row) => String((row as { slug?: string | null }).slug || "").trim())
      .filter(Boolean);

    const sampledAliasesResponse = await supabase
      .from("product_slug_aliases")
      .select("alias_slug,canonical_slug")
      .eq("is_active", true)
      .limit(10);
    if (sampledAliasesResponse.error) {
      throw new Error(`Failed sampling aliases: ${summarizeError(sampledAliasesResponse.error.message)}`);
    }
    const sampleAliases = (sampledAliasesResponse.data ?? []) as Array<{
      alias_slug?: string | null;
      canonical_slug?: string | null;
    }>;

    const sampledSlugChecks = [];
    for (const slug of sampleSlugs) {
      const canonicalRows = await sql<Array<{ slug: string }>>`
        select slug from public.products where slug = ${slug} limit 1
      `;
      const aliasRows = await sql<Array<{ alias_slug: string }>>`
        select alias_slug from public.product_slug_aliases where alias_slug = ${slug} and is_active = true limit 1
      `;
      sampledSlugChecks.push({
        slug,
        canonicalInNhost: canonicalRows.length > 0,
        aliasInNhost: aliasRows.length > 0,
      });
    }

    const sampledAliasChecks = [];
    for (const row of sampleAliases) {
      const aliasSlug = String(row.alias_slug || "").trim();
      const canonicalSlug = String(row.canonical_slug || "").trim();
      if (!aliasSlug || !canonicalSlug) continue;
      const resolved = await sql<Array<{ canonical_slug: string }>>`
        select canonical_slug
        from public.product_slug_aliases
        where alias_slug = ${aliasSlug}
          and is_active = true
        limit 1
      `;
      sampledAliasChecks.push({
        alias_slug: aliasSlug,
        canonical_slug: canonicalSlug,
        resolvesInNhost: resolved[0]?.canonical_slug === canonicalSlug,
      });
    }

    const audit: ParityAudit = {
      generatedAt: new Date().toISOString(),
      supabaseHost: new URL(supabaseUrl).host,
      nhostDbHost: parseHostFromDsn(nhostDbUrl),
      supabaseCounts: supabaseCountMap,
      nhostCounts: nhostCountMap,
      diffs,
      graphqlChecks,
      sampledSlugChecks,
      sampledAliasChecks,
    };

    const auditsDir = path.join(process.cwd(), "docs", "ops", "audits");
    fs.mkdirSync(auditsDir, { recursive: true });

    const parityJsonPath = path.join(auditsDir, "nhost-parity-audit.json");
    const parityMdPath = path.join(auditsDir, "nhost-parity-audit.md");
    const runtimeMdPath = path.join(auditsDir, "nhost-runtime-fallback-audit.md");
    const diffJsonPath = path.join(auditsDir, "supabase-vs-nhost-row-diff.json");

    fs.writeFileSync(parityJsonPath, JSON.stringify(audit, null, 2), "utf8");
    fs.writeFileSync(parityMdPath, renderMarkdown(audit), "utf8");
    fs.writeFileSync(
      runtimeMdPath,
      [
        "# Nhost Runtime Fallback Audit",
        "",
        `- Generated at: ${audit.generatedAt}`,
        "",
        "## GraphQL Checks",
        ...audit.graphqlChecks.map(
          (check) => `- ${check.label}: ${check.ok ? "ok" : "fail"} (${check.detail})`,
        ),
        "",
        "## Sampled Alias Resolution",
        ...audit.sampledAliasChecks.map(
          (item) =>
            `- ${item.alias_slug} -> ${item.canonical_slug}: ${item.resolvesInNhost ? "ok" : "fail"}`,
        ),
        "",
      ].join("\n"),
      "utf8",
    );
    fs.writeFileSync(diffJsonPath, JSON.stringify(audit.diffs, null, 2), "utf8");

    console.log(`[audit:nhost] wrote ${path.relative(process.cwd(), parityMdPath)}`);
    console.log(
      `[audit:nhost] tableDiffs=${audit.diffs.filter((item) => item.diff !== 0).length} graphqlFailures=${audit.graphqlChecks.filter((item) => !item.ok).length}`,
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
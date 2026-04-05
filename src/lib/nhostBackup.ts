import "server-only";

import type { BusinessStats } from "@/lib/types/businessStats";
import postgres from "postgres";

export type NhostBusinessStatsSource = "nhost-graphql" | "nhost-sql";

export interface NhostBusinessStatsResult {
  stats: BusinessStats;
  source: NhostBusinessStatsSource;
}

type NhostStatsRow = {
  projects_delivered?: number | null;
  client_organisations?: number | null;
  sectors_served?: number | null;
  locations_served?: number | null;
  years_experience?: number | null;
  as_of_date?: string | null;
};

function toSafeNumber(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

function toSafeDate(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString().slice(0, 10);
}

function toBusinessStats(row: NhostStatsRow, fallbackDate: string): BusinessStats {
  return {
    projectsDelivered: toSafeNumber(row.projects_delivered),
    clientOrganisations: toSafeNumber(row.client_organisations),
    sectorsServed: toSafeNumber(row.sectors_served),
    locationsServed: toSafeNumber(row.locations_served),
    yearsExperience: toSafeNumber(row.years_experience),
    asOfDate: toSafeDate(row.as_of_date, fallbackDate),
  };
}

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

function isSchemaUnavailable(errors: Array<{ message?: string }>): boolean {
  const text = errors
    .map((error) => String(error.message || "").toLowerCase())
    .join(" ");
  return (
    text.includes("no_queries_available") ||
    (text.includes("field") && text.includes("not found"))
  );
}

export async function fetchNhostBusinessStats(
  fallbackDate: string,
): Promise<NhostBusinessStatsResult | null> {
  if (process.env.NHOST_BACKUP_ENABLED !== "true") return null;

  const rawEndpoint =
    process.env.NHOST_GRAPHQL_URL?.trim() ||
    process.env.NHOST_GRAPHQL_ENDPOINT?.trim();
  const credential =
    process.env.NHOST_ADMIN_SECRET?.trim() ||
    process.env.NHOST_SERVICE_ROLE_KEY?.trim();
  const endpoints = rawEndpoint ? buildEndpointCandidates(rawEndpoint) : [];
  if (!credential || endpoints.length === 0) {
    return fetchNhostBusinessStatsViaSql(fallbackDate);
  }

  const query = `
    query ActiveBusinessStats {
      business_stats_current(where: { is_active: { _eq: true } }, limit: 1) {
        projects_delivered
        client_organisations
        sectors_served
        locations_served
        years_experience
        as_of_date
      }
    }
  `;

  const headerCandidates: Array<Record<string, string>> = credential.includes(".")
    ? [
        { "Content-Type": "application/json", Authorization: `Bearer ${credential}` },
        { "Content-Type": "application/json", "x-hasura-admin-secret": credential },
      ]
    : [
        { "Content-Type": "application/json", "x-hasura-admin-secret": credential },
        { "Content-Type": "application/json", Authorization: `Bearer ${credential}` },
      ];

  try {
    for (const endpoint of endpoints) {
      for (const headers of headerCandidates) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({ query }),
            cache: "no-store",
            signal: controller.signal,
          });

          if (!response.ok) continue;

          const payload = (await response.json()) as {
            data?: { business_stats_current?: NhostStatsRow[] };
            errors?: Array<{ message?: string }>;
          };

          if (Array.isArray(payload.errors) && payload.errors.length > 0) {
            const denied = payload.errors.some((err) =>
              String(err.message || "").toLowerCase().includes("access-denied"),
            );
            if (denied) continue;
            if (isSchemaUnavailable(payload.errors)) continue;
            return fetchNhostBusinessStatsViaSql(fallbackDate);
          }

          const row = payload.data?.business_stats_current?.[0];
          if (!row) return fetchNhostBusinessStatsViaSql(fallbackDate);

          return {
            stats: toBusinessStats(row, fallbackDate),
            source: "nhost-graphql",
          };
        } finally {
          clearTimeout(timeoutId);
        }
      }
    }

    return fetchNhostBusinessStatsViaSql(fallbackDate);
  } catch {
    return fetchNhostBusinessStatsViaSql(fallbackDate);
  }
}

async function fetchNhostBusinessStatsViaSql(
  fallbackDate: string,
): Promise<NhostBusinessStatsResult | null> {
  const dbUrl = process.env.NHOST_DATABASE_URL?.trim();
  if (!dbUrl) return null;

  const sql = postgres(dbUrl, {
    ssl: "require",
    max: 1,
    connect_timeout: 5,
    idle_timeout: 10,
  });

  try {
    const rows = await sql<NhostStatsRow[]>`
      select
        projects_delivered,
        client_organisations,
        sectors_served,
        locations_served,
        years_experience,
        as_of_date
      from public.business_stats_current
      where is_active = true
      order by updated_at desc nulls last, as_of_date desc
      limit 1
    `;

    const row = rows[0];
    if (!row) return null;

    return {
      stats: toBusinessStats(row, fallbackDate),
      source: "nhost-sql",
    };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

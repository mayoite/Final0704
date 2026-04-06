import "server-only";

import type { BusinessStats } from "@/lib/types/businessStats";

export type CloudflareBusinessStatsSource = "cloudflare-d1";

export interface CloudflareBusinessStatsResult {
  stats: BusinessStats;
  source: CloudflareBusinessStatsSource;
}

type BackupStatsRow = {
  projects_delivered?: number | null;
  client_organisations?: number | null;
  sectors_served?: number | null;
  locations_served?: number | null;
  years_experience?: number | null;
  as_of_date?: string | null;
};

interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  all: <T = unknown>() => Promise<{ results?: T[] }>;
}

interface D1LikeDatabase {
  prepare: (sql: string) => D1PreparedStatement;
}

function toSafeNumber(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

function toSafeDate(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString().slice(0, 10);
}

function toBusinessStats(row: BackupStatsRow, fallbackDate: string): BusinessStats {
  return {
    projectsDelivered: toSafeNumber(row.projects_delivered),
    clientOrganisations: toSafeNumber(row.client_organisations),
    sectorsServed: toSafeNumber(row.sectors_served),
    locationsServed: toSafeNumber(row.locations_served),
    yearsExperience: toSafeNumber(row.years_experience),
    asOfDate: toSafeDate(row.as_of_date, fallbackDate),
  };
}

async function getBackupDb(): Promise<D1LikeDatabase | null> {
  if (process.env.CLOUDFLARE_BACKUP_ENABLED !== "true") return null;

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    const bindingName = process.env.CLOUDFLARE_BACKUP_D1_BINDING?.trim() || "CATALOG_BACKUP_D1";
    const db = (context.env as Record<string, unknown>)[bindingName];
    if (!db || typeof db !== "object" || !("prepare" in (db as object))) return null;
    return db as D1LikeDatabase;
  } catch {
    return null;
  }
}

export async function fetchCloudflareBusinessStats(
  fallbackDate: string,
): Promise<CloudflareBusinessStatsResult | null> {
  const db = await getBackupDb();
  if (!db) return null;

  try {
    const result = await db
      .prepare(
        `select
          projects_delivered,
          client_organisations,
          sectors_served,
          locations_served,
          years_experience,
          as_of_date
         from business_stats_current
         where is_active = 1
         order by updated_at desc, as_of_date desc
         limit 1`,
      )
      .all<BackupStatsRow>();

    const row = result.results?.[0];
    if (!row) return null;

    return {
      stats: toBusinessStats(row, fallbackDate),
      source: "cloudflare-d1",
    };
  } catch {
    return null;
  }
}

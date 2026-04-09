import "server-only";

import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/db";
import type { BusinessStats, BusinessStatsResult } from "@/lib/types/businessStats";
import { fetchCloudflareBusinessStats } from "@/lib/cloudflareBackup";
import {
  BUSINESS_STATS_FETCH_TIMEOUT_MS,
  BUSINESS_STATS_TOTAL_BUDGET_MS,
  BUSINESS_STATS_REVALIDATE_SECONDS,
  BUSINESS_STATS_SAFE_DEFAULTS,
} from "@/data/site/fallbacks";

interface BusinessStatsRow {
  projects_delivered: number;
  client_organisations: number;
  sectors_served: number;
  locations_served: number;
  years_experience: number;
  as_of_date: string;
}

let lastKnownGoodStats: BusinessStats | null = null;
const loggedBusinessStatsFallbacks = new Set<string>();

function isExpectedStatsFallback(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("timeout>") ||
    normalized.includes("public.business_stats_current") ||
    normalized.includes("missing_active_business_stats")
  );
}

function normalizeAsOfDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return BUSINESS_STATS_SAFE_DEFAULTS.asOfDate;
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeRow(row: BusinessStatsRow): BusinessStats {
  return {
    projectsDelivered: Math.max(0, Number(row.projects_delivered) || 0),
    clientOrganisations: Math.max(0, Number(row.client_organisations) || 0),
    sectorsServed: Math.max(0, Number(row.sectors_served) || 0),
    locationsServed: Math.max(0, Number(row.locations_served) || 0),
    yearsExperience: Math.max(0, Number(row.years_experience) || 0),
    asOfDate: normalizeAsOfDate(row.as_of_date),
  };
}

async function fetchLiveBusinessStats(): Promise<BusinessStats> {
  const dbQuery = supabase
    .from("business_stats_current")
    .select(
      "projects_delivered, client_organisations, sectors_served, locations_served, years_experience, as_of_date",
    )
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  let timeoutHandle: NodeJS.Timeout | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error(`timeout>${BUSINESS_STATS_FETCH_TIMEOUT_MS}ms`)),
      BUSINESS_STATS_FETCH_TIMEOUT_MS,
    );
  });

  const result = await Promise.race([dbQuery, timeout]);
  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
  }
  const { data, error } = result as Awaited<typeof dbQuery>;

  if (error) {
    throw new Error(`supabase:${error.message}`);
  }

  if (!data) {
    throw new Error("supabase:missing_active_business_stats");
  }

  return normalizeRow(data as BusinessStatsRow);
}

const getCachedLiveBusinessStats = unstable_cache(fetchLiveBusinessStats, ["business-stats-live"], {
  revalidate: BUSINESS_STATS_REVALIDATE_SECONDS,
  tags: ["business-stats"],
});

async function fetchBusinessStatsChain(
  fetchedAt: string,
  forceLive?: boolean,
): Promise<BusinessStatsResult> {
  try {
    const stats = forceLive
      ? await fetchLiveBusinessStats()
      : await getCachedLiveBusinessStats();
    lastKnownGoodStats = stats;
    return { stats, source: "supabase", fetchedAt };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const summarized = message.slice(0, 180);
    if (!isExpectedStatsFallback(summarized) && !loggedBusinessStatsFallbacks.has(summarized)) {
      loggedBusinessStatsFallbacks.add(summarized);
      if (process.env.NODE_ENV !== "production") {
        console.error(`[business-stats] fallback: ${summarized}`);
      }
    }

    if (lastKnownGoodStats) {
      return { stats: lastKnownGoodStats, source: "stale-cache", fetchedAt };
    }

    const cloudflareFallback = await fetchCloudflareBusinessStats(
      BUSINESS_STATS_SAFE_DEFAULTS.asOfDate,
    );
    if (cloudflareFallback) {
      lastKnownGoodStats = cloudflareFallback.stats;
      return { stats: cloudflareFallback.stats, source: cloudflareFallback.source, fetchedAt };
    }

    return { stats: BUSINESS_STATS_SAFE_DEFAULTS, source: "safe-default", fetchedAt };
  }
}

export async function getBusinessStats(options?: {
  forceLive?: boolean;
}): Promise<BusinessStatsResult> {
  const fetchedAt = new Date().toISOString();

  const budgetTimeout = new Promise<BusinessStatsResult>((resolve) => {
    setTimeout(() => {
      resolve({
        stats: lastKnownGoodStats ?? BUSINESS_STATS_SAFE_DEFAULTS,
        source: lastKnownGoodStats ? "stale-cache" : "safe-default",
        fetchedAt,
      });
    }, BUSINESS_STATS_TOTAL_BUDGET_MS);
  });

  return Promise.race([fetchBusinessStatsChain(fetchedAt, options?.forceLive), budgetTimeout]);
}

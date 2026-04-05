"use client";

import { useEffect } from "react";
import type { BusinessStats, BusinessStatsResult, StatsSource } from "@/lib/types/businessStats";
import {
  trackKpiFallbackUsed,
  trackKpiMismatchDetected,
  trackKpiRendered,
} from "@/lib/analytics/kpiEvents";

interface KpiIntegrityMonitorProps {
  page: string;
  source: StatsSource;
  stats: BusinessStats;
}

function compareField(
  page: string,
  field: keyof BusinessStats,
  rendered: number,
  canonical: number,
) {
  if (rendered !== canonical) {
    trackKpiMismatchDetected({
      page,
      field,
      expected: canonical,
      actual: rendered,
    });
  }
}

export function KpiIntegrityMonitor({ page, source, stats }: KpiIntegrityMonitorProps) {
  useEffect(() => {
    trackKpiRendered({ asOfDate: stats.asOfDate, source });
    if (source !== "supabase") {
      trackKpiFallbackUsed({ source });
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/business-stats", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as BusinessStatsResult;
        const canonical = payload.stats;
        compareField(page, "projectsDelivered", stats.projectsDelivered, canonical.projectsDelivered);
        compareField(
          page,
          "clientOrganisations",
          stats.clientOrganisations,
          canonical.clientOrganisations,
        );
        compareField(page, "sectorsServed", stats.sectorsServed, canonical.sectorsServed);
      } catch {
        // Ignore telemetry-only failures.
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [page, source, stats]);

  return null;
}

export type StatsSource =
  | "supabase"
  | "cloudflare-d1"
  | "stale-cache"
  | "safe-default";

export interface BusinessStats {
  projectsDelivered: number;
  clientOrganisations: number;
  sectorsServed: number;
  locationsServed: number;
  yearsExperience: number;
  asOfDate: string;
}

export interface BusinessStatsResult {
  stats: BusinessStats;
  source: StatsSource;
  fetchedAt: string;
}

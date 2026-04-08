import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ClientBadge } from "@/components/ClientBadge";
import { KpiIntegrityMonitor } from "@/components/analytics/KpiIntegrityMonitor";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { PROJECTS_PAGE_CLIENTS, PROJECTS_PAGE_COPY } from "@/data/site/routeCopy";
import { getBusinessStats } from "@/lib/businessStats";
import { formatKpiValuePlus } from "@/lib/kpiFormat";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Projects",
  description:
    "Workspace projects delivered across government, finance, energy, manufacturing, and more.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const { stats, source } = await getBusinessStats();
  const clientsValue = formatKpiValuePlus(stats.clientOrganisations);

  return (
    <section className="scheme-page flex min-h-screen flex-col">
      <KpiIntegrityMonitor page="projects" source={source} stats={stats} />
      <Hero
        variant="small"
        title={PROJECTS_PAGE_COPY.heroTitle}
        subtitle={PROJECTS_PAGE_COPY.heroSubtitleTemplate.replace("{clients}", clientsValue)}
        showButton={false}
        backgroundImage="/images/hero/hero-2.webp"
      />

      <section className="container-wide py-16 md:py-24">
        <div className="scheme-panel scheme-border mb-12 rounded-blob border p-8 md:p-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="typ-label mb-3 scheme-text-body">{PROJECTS_PAGE_COPY.featuredLabel}</p>
              <h2 className="typ-section scheme-text-strong">{PROJECTS_PAGE_COPY.featuredTitle}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/trusted-by" className="btn-outline">
                Trusted by
              </Link>
              <Link href="/portfolio" className="home-btn-primary">
                View portfolio
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {PROJECTS_PAGE_CLIENTS.slice(0, 12).map((client) => (
              <ClientBadge key={client.name} {...client} />
            ))}
          </div>
        </div>

        <div className="scheme-border border-t pt-12">
          <p className="typ-label mb-6 scheme-text-body">{PROJECTS_PAGE_COPY.allLabel}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {PROJECTS_PAGE_CLIENTS.slice(12).map((client) => (
              <ClientBadge key={client.name} {...client} />
            ))}
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}

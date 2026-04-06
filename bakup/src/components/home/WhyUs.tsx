import type { BusinessStats } from "@/lib/types/businessStats";
import { formatKpiValuePlus } from "@/lib/kpiFormat";

interface WhyUsProps {
  stats: BusinessStats;
  asOfLabel: string;
}

export function WhyUs({ stats, asOfLabel }: WhyUsProps) {
  const pillars = [
    {
      id: "client-organisations",
      number: formatKpiValuePlus(stats.clientOrganisations),
      label: "Organisations served",
      caption: "One team for site survey, BOQ alignment and procurement approvals",
    },
    {
      id: "projects-delivered",
      number: formatKpiValuePlus(stats.projectsDelivered),
      label: "Projects delivered",
      caption: "Planned delivery windows with site-readiness checks and coordinated installation",
    },
    {
      id: "years-experience",
      number: `${stats.yearsExperience}+`,
      label: "Years of expertise",
      caption: "Warranty-backed systems with responsive after-sales support since 2011",
    },
  ] as const;

  return (
    <section className="section-ink w-full py-20 md:py-28">
      <div className="container px-6 2xl:px-0">
        <div className="mb-14">
          <p className="typ-label mb-4 text-(--color-accent-soft)">Why teams choose us</p>
          <h2 className="typ-section text-inverse">By the numbers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {pillars.map(({ id, number, label, caption }) => (
            <div key={label} className="px-0 md:px-12 first:pl-0 last:pr-0 py-10 md:py-6">
              <span
                data-testid={id === "projects-delivered" || id === "client-organisations" ? `kpi-${id}` : undefined}
                className="typ-stat block text-primary mb-3"
              >
                {number}
              </span>
              <p className="typ-label scheme-text-inverse-muted mb-2">{label}</p>
              <p className="typ-lead scheme-text-inverse-body max-w-[26ch]">{caption}</p>
            </div>
          ))}
        </div>
        <p data-testid="kpi-as-of-home" className="scheme-text-inverse-subtle mt-10 text-xs tracking-wide">
          {asOfLabel}
        </p>
      </div>
    </section>
  );
}


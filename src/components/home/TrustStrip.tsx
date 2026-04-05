import Image from "next/image";
import Link from "next/link";
import type { BusinessStats } from "@/lib/types/businessStats";
import { formatKpiValuePlus } from "@/lib/kpiFormat";
import { HOMEPAGE_TRUST_CONTENT } from "@/data/site/homepage";

interface TrustStripProps {
  stats: BusinessStats;
  embedded?: boolean;
  showLogos?: boolean;
  dark?: boolean;
}

export function TrustStrip({ stats, embedded = false, showLogos = true, dark = false }: TrustStripProps) {
  const kpis = [
    {
      value: formatKpiValuePlus(stats.clientOrganisations),
      label: "Organisations served",
      testId: "kpi-client-organisations",
    },
    {
      value: formatKpiValuePlus(stats.projectsDelivered),
      label: "Projects delivered",
      testId: "kpi-projects-delivered",
    },
    {
      value: `${stats.yearsExperience}+`,
      label: "Years experience",
      testId: "kpi-years-experience",
    },
    { value: formatKpiValuePlus(stats.sectorsServed), label: "Sectors served", testId: undefined },
  ];

  const content = (
    <>
      <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 ${embedded ? "" : "stats-block"}`}>
        {kpis.map(({ value, label, testId }) => (
          <div key={label} className={dark
            ? "rounded-2xl border border-inverse bg-[color:var(--overlay-panel-08)] p-6 text-center backdrop-blur-sm"
            : "scheme-panel scheme-border rounded-2xl border p-6 text-center"}>
            <p data-testid={testId} className={dark
              ? "font-display text-[clamp(2rem,4vw,3rem)] font-[350] leading-[0.96] tracking-[-0.045em] text-[var(--color-accent)]"
              : "typ-stat text-primary"}>
              {value}
            </p>
            <p className={dark
              ? "mt-2 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--text-inverse-muted)]"
              : "stats-block__label mt-2"}>{label}</p>
          </div>
        ))}
      </div>

      {showLogos ? (
        <div className="scheme-border mt-10 border-t pt-8 md:mt-10 md:pt-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {HOMEPAGE_TRUST_CONTENT.logos.map((logo) => (
              <div key={logo.name} className="flex min-h-12 items-center justify-center">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={140}
                  height={46}
                  className="h-9 w-auto object-contain opacity-65 grayscale transition hover:opacity-90"
                />
              </div>
            ))}
          </div>
          <div className="mt-7 text-center">
            <Link href="/projects" className="link-arrow typ-label">
              {HOMEPAGE_TRUST_CONTENT.projectsCta}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="scheme-section-soft scheme-border w-full border-y py-16 md:py-18" aria-label="Trust indicators">
      <div className="home-shell">
        <div>{content}</div>
      </div>
    </section>
  );
}


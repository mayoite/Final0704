import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { Newsletter } from "@/components/shared/Newsletter";
import {
  BadgeCheck,
  Gauge,
  Leaf,
  Lightbulb,
  Recycle,
  Sparkles,
  Wrench,
} from "lucide-react";
import { SUSTAINABILITY_PAGE_COPY } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Sustainability",
  description: "Long-life systems. Lower lifecycle waste.",
  path: "/sustainability",
});

const pillarIconMap = {
  leaf: Leaf,
  recycle: Recycle,
  lightbulb: Lightbulb,
} as const;

const ecoItemIcons = [Gauge, BadgeCheck, Wrench] as const;

export default function SustainabilityPage() {
  return (
    <section className="scheme-page flex min-h-screen flex-col">
      <Hero
        variant="small"
        title={SUSTAINABILITY_PAGE_COPY.heroTitle}
        subtitle={SUSTAINABILITY_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/images/products/imported/halo/image-1.webp"
      />

      <section className="container-wide py-18 md:py-22">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="typ-label scheme-text-body mb-4">{SUSTAINABILITY_PAGE_COPY.introKicker}</p>
            <h2 className="typ-section scheme-text-strong max-w-3xl">
              {SUSTAINABILITY_PAGE_COPY.introTitle}
            </h2>
            <p className="page-copy scheme-text-body mt-5 max-w-2xl">
              {SUSTAINABILITY_PAGE_COPY.introDescription}
            </p>
          </div>

          <div className="scheme-panel scheme-border rounded-huge border p-6 md:p-8 xl:p-10">
            <h3 className="typ-h3 scheme-text-strong">
              {SUSTAINABILITY_PAGE_COPY.introTitleLead}
              <span className="scheme-text-brand"> {SUSTAINABILITY_PAGE_COPY.introTitleEmphasis}</span>
            </h3>
            <ul className="mt-5 space-y-4">
              {SUSTAINABILITY_PAGE_COPY.introPoints.map((point, index) => (
                <li key={point} className="flex gap-3 border-b border-(--border-soft) pb-4 last:border-b-0 last:pb-0">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-brand">
                    {index === 0 ? <Leaf className="h-4 w-4" /> : index === 1 ? <Recycle className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                  </span>
                  <span className="page-copy-sm scheme-text-body">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="scheme-panel-soft scheme-border rounded-2xl border p-5 md:p-6">
            <div className="scheme-accent-wash mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand">
              <Leaf className="h-5 w-5" />
            </div>
            <h3 className="typ-h3 scheme-text-strong">Lower material churn</h3>
            <p className="page-copy-sm scheme-text-body mt-2">Selections favor longer service life and fewer avoidable replacements.</p>
          </article>
          <article className="scheme-panel-soft scheme-border rounded-2xl border p-5 md:p-6">
            <div className="scheme-accent-wash mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand">
              <Recycle className="h-5 w-5" />
            </div>
            <h3 className="typ-h3 scheme-text-strong">Repair-first approach</h3>
            <p className="page-copy-sm scheme-text-body mt-2">Configurations are planned for maintenance, repair, and staged upgrades.</p>
          </article>
          <article className="scheme-panel-soft scheme-border rounded-2xl border p-5 md:p-6">
            <div className="scheme-accent-wash mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="typ-h3 scheme-text-strong">Practical sustainability</h3>
            <p className="page-copy-sm scheme-text-body mt-2">Decisions stay grounded in specs, fit, and lifecycle reliability.</p>
          </article>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {SUSTAINABILITY_PAGE_COPY.pillars.map((pillar) => (
            <article key={pillar.title} className="scheme-panel scheme-border rounded-2xl border p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft text-brand">
                {(() => {
                  const Icon = pillarIconMap[pillar.icon as keyof typeof pillarIconMap] ?? Lightbulb;
                  return <Icon className="h-5 w-5" />;
                })()}
              </div>
              <h3 className="typ-h3 scheme-text-strong">{pillar.title}</h3>
              <p className="page-copy-sm scheme-text-body mt-3">{pillar.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="typ-h2 scheme-text-heading mb-6">{SUSTAINABILITY_PAGE_COPY.ecoScoreTitle}</h2>
            <p className="page-copy scheme-text-body mb-6">
              {SUSTAINABILITY_PAGE_COPY.ecoScoreDescription}
            </p>
            <ul className="page-copy scheme-text-body space-y-4">
              {SUSTAINABILITY_PAGE_COPY.ecoScoreItems.map((item, index) => {
                const Icon = ecoItemIcons[index] ?? Gauge;
                return (
                <li key={item.index} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <strong>{item.title}:</strong> {item.detail}
                  </span>
                </li>
              )})}
            </ul>
          </div>

          <div className="scheme-panel-soft scheme-border space-y-8 rounded-2xl border p-10 md:p-12">
            {SUSTAINABILITY_PAGE_COPY.badges.map((badge, index) => (
              <div key={badge.title}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="scheme-accent-wash inline-flex h-7 w-7 items-center justify-center rounded-full text-brand">
                    {index === 0 ? <BadgeCheck className="h-4 w-4" /> : <Gauge className="h-4 w-4" />}
                  </span>
                  <h3 className="typ-h3 scheme-text-heading">{badge.title}</h3>
                </div>
                <p className="page-copy-sm scheme-text-body">{badge.detail}</p>
                {index < SUSTAINABILITY_PAGE_COPY.badges.length - 1 ? (
                  <div className="scheme-border mt-8 h-px border-t" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="mb-8 max-w-3xl">
            <p className="typ-label scheme-text-body mb-4">{SUSTAINABILITY_PAGE_COPY.commitmentsKicker}</p>
            <h2 className="typ-section scheme-text-strong">{SUSTAINABILITY_PAGE_COPY.commitmentsTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {SUSTAINABILITY_PAGE_COPY.commitments.map((commitment, index) => (
              <article
                key={commitment.title}
                className="scheme-panel-soft scheme-border rounded-2xl border p-6"
              >
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-soft text-brand">
                  {index % 3 === 0 ? <Leaf className="h-4 w-4" /> : index % 3 === 1 ? <Recycle className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                </span>
                <h3 className="typ-h3 scheme-text-strong">{commitment.title}</h3>
                <p className="page-copy-sm scheme-text-body mt-3">{commitment.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="scheme-panel-dark relative mt-20 overflow-hidden rounded-blob p-12">
          <div className="absolute -mr-32 -mt-32 h-64 w-64 rounded-full bg-[color:var(--surface-sustain-glow)] blur-3xl right-0 top-0" />
          <div className="absolute -ml-24 -mb-24 h-56 w-56 rounded-full bg-[color:var(--surface-sustain-glow-strong)] blur-3xl left-0 bottom-0" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="max-w-xl">
              <p className="typ-label mb-3 text-[color:var(--text-sustain)]">Sustainability-aligned</p>
              <h3 className="typ-h2 scheme-text-inverse mb-4">{SUSTAINABILITY_PAGE_COPY.verifiedTitle}</h3>
              <p className="page-copy scheme-text-inverse-muted">
                {SUSTAINABILITY_PAGE_COPY.verifiedDescription}
              </p>
            </div>
            <div className="w-full rounded-2xl border border-[color:var(--border-sustain-soft)] bg-[color:var(--surface-sustain-soft)] p-4 backdrop-blur-sm md:w-auto md:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {SUSTAINABILITY_PAGE_COPY.verifiedLabels.map((label, index) => {
                  const Icon = index === 0 ? BadgeCheck : index === 1 ? Gauge : Sparkles;
                  return (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-full border border-[color:var(--border-sustain-soft)] bg-[color:var(--surface-sustain-soft)] px-4 py-3 transition-colors hover:bg-[color:var(--surface-sustain-soft-strong)]"
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-sustain-soft-strong)] text-[color:var(--text-sustain)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="typ-label whitespace-nowrap text-[0.68rem] tracking-[0.1em] text-[color:var(--text-inverse-body)]">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </section>

      <Newsletter />
      <ContactTeaser />
    </section>
  );
}



import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, GraduationCap, Users } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { JobCard } from "@/components/career/JobCard";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { CAREER_PAGE_COPY, CAREER_PAGE_JOBS } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Careers",
  description:
    "Join a team that builds practical, high-impact workspaces for organizations across India.",
  path: "/career",
});

const CAREER_PILLAR_ICONS = {
  users: Users,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
} as const;

export default function CareerPage() {
  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <Hero
        variant="small"
        title={CAREER_PAGE_COPY.heroTitle}
        subtitle={CAREER_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/images/hero/tvs-patna-enhanced.webp"
      />

      <section className="container px-6 py-18 2xl:px-0 md:py-22">
        <div className="mb-12 max-w-4xl space-y-5">
          <p className="typ-label scheme-text-body">{CAREER_PAGE_COPY.introKicker}</p>
          <h2 className="typ-section scheme-text-strong">{CAREER_PAGE_COPY.introTitle}</h2>
          <p className="page-copy scheme-text-body">{CAREER_PAGE_COPY.introDescription}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CAREER_PAGE_COPY.pillars.map((pillar) => {
            const Icon = CAREER_PILLAR_ICONS[pillar.icon];
            return (
              <article key={pillar.title} className="scheme-panel scheme-border rounded-2xl border p-7">
                <Icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="typ-h3 scheme-text-strong">{pillar.title}</h3>
                <p className="page-copy-sm scheme-text-body mt-3">{pillar.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="scheme-section-soft scheme-border w-full border-y py-18 md:py-22">
        <div className="container px-6 2xl:px-0">
          <div className="mb-8 max-w-3xl">
            <p className="typ-label scheme-text-body mb-4">{CAREER_PAGE_COPY.processKicker}</p>
            <h2 className="typ-section scheme-text-strong">{CAREER_PAGE_COPY.processTitle}</h2>
            <p className="page-copy scheme-text-body mt-5">{CAREER_PAGE_COPY.processDescription}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {CAREER_PAGE_COPY.processSteps.map((step, index) => (
              <article
                key={step.title}
                className="scheme-panel-soft scheme-border rounded-2xl border p-6"
              >
                <p className="typ-label scheme-text-brand mb-3">Step {index + 1}</p>
                <h3 className="typ-h3 scheme-text-strong">{step.title}</h3>
                <p className="page-copy-sm scheme-text-body mt-3">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-6 py-18 2xl:px-0 md:py-22">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="typ-section scheme-text-strong">{CAREER_PAGE_COPY.openingsTitle}</h2>
          <p className="typ-label scheme-text-body">
            {CAREER_PAGE_COPY.openingsAvailableTemplate.replace("{count}", String(CAREER_PAGE_JOBS.length))}
          </p>
        </div>

        <div className="space-y-4">
          {CAREER_PAGE_JOBS.map((job) => (
            <JobCard
              key={`${job.title}-${job.department}`}
              title={job.title}
              department={job.department}
              location={job.location}
            />
          ))}
        </div>

        <div className="scheme-panel scheme-border mt-10 rounded-2xl border p-6">
          <h3 className="typ-h3 scheme-text-strong">{CAREER_PAGE_COPY.fallbackTitle}</h3>
          <p className="page-copy-sm scheme-text-body mt-3 max-w-2xl">
            {CAREER_PAGE_COPY.fallbackDescription}
          </p>
          <a href={`mailto:${CAREER_PAGE_COPY.careersEmail}`} className="link-arrow mt-5">
            {CAREER_PAGE_COPY.careersEmail}
          </a>
        </div>
      </section>

      <section className="container px-6 pb-18 2xl:px-0 md:pb-22">
        <div className="scheme-panel-dark relative overflow-hidden rounded-blob p-8 md:p-10">
          <div className="absolute inset-y-0 right-0 w-1/2 surface-overlay-12" />
          <div className="relative z-10 grid gap-6 grid-cols-1_1-auto lg:items-end">
            <div className="max-w-2xl">
              <h2 className="typ-section text-inverse">{CAREER_PAGE_COPY.supportTitle}</h2>
              <p className="page-copy scheme-text-inverse-body mt-4">{CAREER_PAGE_COPY.supportDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                {CAREER_PAGE_COPY.supportPrimaryCta}
              </Link>
              <Link href="/planning" className="btn-outline-light">
                {CAREER_PAGE_COPY.supportSecondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}



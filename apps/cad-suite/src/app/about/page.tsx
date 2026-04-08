import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { ClientBadge } from "@/components/ClientBadge";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { ABOUT_PAGE_COPY } from "@/data/site/routeCopy";
import { TRUSTED_BY_CLIENTS, TRUSTED_BY_STATS } from "@/data/site/proof";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "About One&Only",
  description:
    "We provide office furniture and workspace solutions across India, offering durable designs, installation, and asset management.",
  path: "/about",
});

export default function AboutPage() {
  const featuredClients = TRUSTED_BY_CLIENTS.slice(0, 8);

  return (
    <div className="flex min-h-screen w-full flex-col scheme-page">
      <Hero
        variant="small"
        title={ABOUT_PAGE_COPY.heroTitle}
        subtitle={ABOUT_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/images/hero/hero-1.webp"
      />

      <section className="container mx-auto px-6 py-16 2xl:px-0 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-16/11 overflow-hidden rounded-4xl border scheme-border shadow-[0_24px_60px_-42px_var(--overlay-inverse-18)]">
            <Image
              src="/images/hero/hero-2.webp"
              alt="Workspace delivery by One&Only"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="typ-label mb-3 scheme-text-brand">
                {ABOUT_PAGE_COPY.sectionKicker}
              </p>
              <h2 className="typ-section scheme-text-strong">
                {ABOUT_PAGE_COPY.sectionTitle}
              </h2>
            </div>
            <div className="space-y-4">
              {ABOUT_PAGE_COPY.paragraphs.map((paragraph) => (
                <p key={paragraph} className="typ-lead scheme-text-body">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-y scheme-border scheme-section-soft py-16 md:py-24">
        <div className="container mx-auto px-6 2xl:px-0">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {TRUSTED_BY_STATS.map((item) => (
              <div
                key={item.label}
                className="scheme-panel rounded-2xl border p-8 text-center"
              >
                <p className="text-4xl font-semibold tracking-tight scheme-text-heading md:text-5xl">
                  {item.value}
                </p>
                <p className="typ-label mt-2 scheme-text-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 2xl:px-0 md:py-24">
        <div className="mb-12 max-w-3xl">
          <p className="typ-label mb-4 scheme-text-brand">
            {ABOUT_PAGE_COPY.modelKicker}
          </p>
          <h2 className="typ-section scheme-text-strong">
            {ABOUT_PAGE_COPY.modelTitle}
          </h2>
          <p className="typ-lead mt-5 scheme-text-body">
            {ABOUT_PAGE_COPY.modelDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {ABOUT_PAGE_COPY.modelPillars.map((pillar) => (
            <article key={pillar.title} className="scheme-panel rounded-2xl border p-8">
              <h3 className="typ-h3 scheme-text-strong">{pillar.title}</h3>
              <p className="mt-4 page-copy-sm scheme-text-body">{pillar.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="w-full border-y scheme-border scheme-section-soft py-16 md:py-24">
        <div className="container mx-auto px-6 2xl:px-0">
          <div className="mb-12 max-w-3xl">
            <p className="typ-label mb-4 scheme-text-brand">
              {ABOUT_PAGE_COPY.processKicker}
            </p>
            <h2 className="typ-section scheme-text-strong text-balance">
              {ABOUT_PAGE_COPY.processTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {ABOUT_PAGE_COPY.processSteps.map((step, index) => (
              <article
                key={step.title}
                className="scheme-panel flex flex-col rounded-2xl border p-8"
              >
                <p className="mb-4 inline-flex self-start rounded-full scheme-accent-wash px-3 py-1 text-xs font-semibold uppercase tracking-widest scheme-text-brand">
                  Step {index + 1}
                </p>
                <h3 className="typ-h3 scheme-text-strong">{step.title}</h3>
                <p className="mt-4 page-copy-sm scheme-text-body">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 2xl:px-0 md:py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="typ-label mb-4 scheme-text-brand">
              {ABOUT_PAGE_COPY.confidenceKicker}
            </p>
            <h2 className="typ-section scheme-text-strong text-balance">
              {ABOUT_PAGE_COPY.confidenceTitle}
            </h2>
          </div>
          <Link 
            href="/trusted-by" 
            className="btn-outline"
          >
            {ABOUT_PAGE_COPY.confidenceCta}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredClients.map((client) => (
            <ClientBadge key={client.name} {...client} />
          ))}
        </div>
      </section>

      <HomeFAQ />

      <section className="container mx-auto px-6 pb-16 2xl:px-0 md:pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] scheme-panel-dark p-8 md:p-14">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-(--overlay-panel-12)" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <h2 className="typ-section scheme-text-inverse text-balance">
                {ABOUT_PAGE_COPY.supportTitle}
              </h2>
              <p className="mt-5 typ-lead scheme-text-inverse-body">
                {ABOUT_PAGE_COPY.supportDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/planner" 
                className="btn-primary"
              >
                {ABOUT_PAGE_COPY.supportPrimaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactTeaser />
    </div>
  );
}


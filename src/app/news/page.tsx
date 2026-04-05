import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { NEWS_PAGE_COPY } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "News and Updates",
  description:
    "Workspace guidance, project themes, and service updates from One&Only.",
  path: "/news",
});

export default function NewsPage() {
  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <Hero
        variant="small"
        title={NEWS_PAGE_COPY.heroTitle}
        subtitle={NEWS_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/hero/dmrc-hero.webp"
      />

      <section className="container px-6 py-18 2xl:px-0 md:py-22">
        <div className="grid grid-cols-1 gap-8 grid-cols-1_05-0_95">
          <div>
            <p className="typ-label scheme-text-body mb-4">{NEWS_PAGE_COPY.introKicker}</p>
            <h2 className="typ-section scheme-text-strong max-w-3xl">
              {NEWS_PAGE_COPY.introTitle}
            </h2>
            <p className="page-copy scheme-text-body mt-5 max-w-2xl">
              {NEWS_PAGE_COPY.introDescription}
            </p>
          </div>

          <div className="scheme-panel scheme-border rounded-huge border p-6 md:p-8">
            <p className="typ-label scheme-text-body mb-4">Route intent</p>
            <p className="page-copy-sm scheme-text-body">
              This page stays useful only if it remains grounded in real project themes, live support routes,
              and current product/planning direction rather than synthetic newsroom content.
            </p>
          </div>
        </div>
      </section>

      <section className="scheme-section-soft scheme-border w-full border-y py-18 md:py-22">
        <div className="container px-6 2xl:px-0">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {NEWS_PAGE_COPY.cards.map((item) => (
              <article key={item.title} className="scheme-panel scheme-border rounded-2xl border p-6">
                <p className="typ-label scheme-text-brand mb-3">{item.category}</p>
                <h3 className="typ-h3 scheme-text-strong">{item.title}</h3>
                <p className="page-copy-sm scheme-text-body mt-3">{item.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-6 py-18 2xl:px-0 md:py-22">
        <div className="scheme-panel-dark relative overflow-hidden rounded-blob p-8 md:p-10">
          <div className="absolute inset-y-0 right-0 w-1/2 surface-overlay-12" />
          <div className="relative z-10 grid gap-6 grid-cols-1_1-auto lg:items-end">
            <div className="max-w-2xl">
              <h2 className="typ-section text-inverse">{NEWS_PAGE_COPY.ctaTitle}</h2>
              <p className="page-copy scheme-text-inverse-body mt-4">{NEWS_PAGE_COPY.ctaDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-outline-light">
                {NEWS_PAGE_COPY.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}



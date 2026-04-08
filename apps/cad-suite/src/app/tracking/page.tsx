import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { TRACKING_PAGE_COPY } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Order and Delivery Tracking",
  description:
    "Use the correct support lane for order-reference, delivery-status, installation, or after-sales follow-up requests.",
  path: "/tracking",
});

export default function TrackingPage() {
  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <Hero
        variant="small"
        title={TRACKING_PAGE_COPY.heroTitle}
        subtitle={TRACKING_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/hero/titan-hero.webp"
      />

      <section className="container px-6 py-18 2xl:px-0 md:py-22">
        <div className="grid grid-cols-1 gap-8 grid-cols-1_05-0_95">
          <div>
            <p className="typ-label scheme-text-body mb-4">{TRACKING_PAGE_COPY.introKicker}</p>
            <h2 className="typ-section scheme-text-strong max-w-3xl">
              {TRACKING_PAGE_COPY.introTitle}
            </h2>
            <p className="page-copy scheme-text-body mt-5 max-w-2xl">
              {TRACKING_PAGE_COPY.introDescription}
            </p>
          </div>

          <div className="scheme-panel scheme-border rounded-huge border p-6 md:p-8">
            <h3 className="typ-h3 scheme-text-strong">{TRACKING_PAGE_COPY.referenceTitle}</h3>
            <ul className="mt-5 space-y-4">
              {TRACKING_PAGE_COPY.referenceItems.map((item) => (
                <li
                  key={item}
                  className="page-copy-sm scheme-text-body border-b border-[color:var(--overlay-inverse-12)] pb-4 last:border-b-0 last:pb-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="scheme-section-soft scheme-border w-full border-y py-18 md:py-22">
        <div className="container px-6 2xl:px-0">
          <div className="mb-8 max-w-3xl">
            <h2 className="typ-section scheme-text-strong">{TRACKING_PAGE_COPY.lanesTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {TRACKING_PAGE_COPY.lanes.map((lane) => (
              <article key={lane.title} className="scheme-panel scheme-border rounded-2xl border p-6">
                <h3 className="typ-h3 scheme-text-strong">{lane.title}</h3>
                <p className="page-copy-sm scheme-text-body mt-3">{lane.detail}</p>
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
              <h2 className="typ-section text-inverse">{TRACKING_PAGE_COPY.supportTitle}</h2>
              <p className="page-copy scheme-text-inverse-body mt-4">{TRACKING_PAGE_COPY.supportDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/service" className="btn-primary">
                {TRACKING_PAGE_COPY.primaryCta}
              </Link>
              <Link href="/contact" className="btn-outline-light">
                {TRACKING_PAGE_COPY.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}




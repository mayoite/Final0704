import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { SOLUTIONS_DELIVERY_STEPS, SOLUTIONS_PAGE_COPY } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { getBusinessStats } from "@/lib/businessStats";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: SOLUTIONS_PAGE_COPY.metadataTitle,
  description: SOLUTIONS_PAGE_COPY.metadataDescription,
  path: "/solutions",
});

export default async function SolutionsPage() {
  const { stats } = await getBusinessStats();

  return (
    <section className="scheme-page flex min-h-screen flex-col">
      <Hero
        variant="small"
        title={SOLUTIONS_PAGE_COPY.heroTitle}
        subtitle={SOLUTIONS_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/images/hero/hero-2.webp"
      />

      <section className="container px-6 py-18 md:py-22 2xl:px-0">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="typ-label scheme-text-body mb-4">{SOLUTIONS_PAGE_COPY.deliveryKicker}</p>
            <h2 className="typ-section scheme-text-strong max-w-3xl">{SOLUTIONS_PAGE_COPY.deliveryTitle}</h2>
            <p className="page-copy scheme-text-body mt-4">
              {SOLUTIONS_PAGE_COPY.deliveryDescription}
            </p>
          </div>
          <div className="scheme-panel scheme-border relative aspect-4/3 overflow-hidden rounded-huge border">
            <Image
              src="/images/hero/hero-1.webp"
              alt="Workspace planning and delivery"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="home-section home-section--dark w-full py-14 md:py-18">
        <div className="container px-6 2xl:px-0">
          <TrustStrip stats={stats} embedded showLogos={false} dark />
        </div>
      </section>

      <section className="w-full py-18 md:py-22">
        <div className="container px-6 2xl:px-0">
          <div className="mb-10">
            <p className="typ-label scheme-text-body mb-4">{SOLUTIONS_PAGE_COPY.processKicker}</p>
            <h2 className="typ-section scheme-text-strong">{SOLUTIONS_PAGE_COPY.processTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SOLUTIONS_DELIVERY_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="scheme-panel scheme-border overflow-hidden rounded-xl border"
              >
                <div className="relative aspect-16/10 border-b scheme-border">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="typ-label scheme-text-body mb-3">Phase {index + 1}</p>
                  <h3 className="typ-h3 scheme-text-strong">{step.title}</h3>
                  <p className="page-copy scheme-text-body mt-3">{step.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scheme-section-soft scheme-border w-full border-y py-16">
        <div className="container px-6 2xl:px-0">
          <div className="scheme-panel scheme-border rounded-huge border p-7 md:p-9">
            <p className="typ-label scheme-text-body mb-4">{SOLUTIONS_PAGE_COPY.planningKicker}</p>
            <h2 className="typ-section scheme-text-strong max-w-3xl">{SOLUTIONS_PAGE_COPY.planningTitle}</h2>
            <p className="page-copy scheme-text-body mt-4 max-w-3xl">
              {SOLUTIONS_PAGE_COPY.planningDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                {SOLUTIONS_PAGE_COPY.planningPrimaryCta}
              </Link>
              <Link href="/products" className="btn-outline">
                {SOLUTIONS_PAGE_COPY.planningSecondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}

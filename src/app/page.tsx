import type { Metadata } from "next";
import { HomepageHero } from "@/components/home/HomepageHero";
import { PartnershipBanner } from "@/components/home/PartnershipBanner";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProcessSection } from "@/components/home/ProcessSection";
import { InteractiveTools } from "@/components/home/InteractiveTools";
import { Collections } from "@/components/home/Collections";
import { Projects } from "@/components/home/Projects";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { TestimonialsStrip } from "@/components/home/TestimonialsStrip";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { SectionReveal } from "@/components/shared/SectionReveal";
import { SITE_BRAND } from "@/data/site/brand";
import { buildPageJsonLd, buildPageMetadata } from "@/data/site/seo";
import { getBusinessStats } from "@/lib/businessStats";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: SITE_BRAND.defaultTitle,
  description: SITE_BRAND.description,
  path: "/",
});

export default async function Home() {
  const { stats } = await getBusinessStats();
  const homeJsonLd = buildPageJsonLd(SITE_URL, {
    path: "/",
    title: SITE_BRAND.defaultTitle,
    description: SITE_BRAND.description,
    pageType: "WebPage",
  });

  return (
    <div className="min-h-screen bg-panel">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomepageHero />
      <SectionReveal delay={0.02}>
        <PartnershipBanner />
      </SectionReveal>

      <SectionReveal delay={0.04}>
        <InteractiveTools />
      </SectionReveal>

      <SectionReveal delay={0.05}>
        <Collections />
      </SectionReveal>

      <SectionReveal delay={0.08}>
        <Projects />
      </SectionReveal>

      <SectionReveal delay={0.12}>
        <TestimonialsStrip />
      </SectionReveal>

      <SectionReveal delay={0.16}>
        <section className="home-section home-section--dark py-14 md:py-18">
          <div className="home-shell">
            <ProcessSection embedded dark />
            <div className="mt-10 md:mt-12">
              <TrustStrip stats={stats} embedded showLogos={false} dark />
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.18}>
        <HomeFAQ />
      </SectionReveal>

      <SectionReveal delay={0.2}>
        <ContactTeaser />
      </SectionReveal>
    </div>
  );
}


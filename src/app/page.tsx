import type { Metadata } from "next";
import { HomepageHero } from "@/components/home/HomepageHero";
import { PartnershipBanner } from "@/components/home/PartnershipBanner";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProcessSection } from "@/components/home/ProcessSection";
import { InteractiveTools } from "@/components/home/InteractiveTools";
import { Collections } from "@/components/home/Collections";
import { Projects } from "@/components/home/Projects";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { TestimonialsStrip } from "@/components/home/TestimonialsStrip";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
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
      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.02s" }}>
        <PartnershipBanner />
      </div>

      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.04s" }}>
        <FeaturedCarousel />
      </div>

      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.05s" }}>
        <Collections />
      </div>

      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.08s" }}>
        <InteractiveTools />
      </div>

      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.09s" }}>
        <Projects />
      </div>

      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.13s" }}>
        <TestimonialsStrip />
      </div>

      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.17s" }}>
        <section className="home-section home-section--dark py-14 md:py-18">
          <div className="home-shell">
            <ProcessSection embedded dark />
            <div className="mt-10 md:mt-12">
              <TrustStrip stats={stats} embedded showLogos={false} dark />
            </div>
          </div>
        </section>
      </div>

      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.19s" }}>
        <HomeFAQ />
      </div>

      <div className="home-reveal" style={{ ["--home-reveal-delay" as string]: "0.21s" }}>
        <ContactTeaser />
      </div>
    </div>
  );
}

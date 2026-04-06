import type { Metadata } from "next";
import { HomepageHero } from "@/components/home/HomepageHero";
import { PartnershipBanner } from "@/components/home/PartnershipBanner";
import { Collections } from "@/components/home/Collections";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ShowcaseCarousel } from "@/components/home/ShowcaseCarousel";
import { VideoSection } from "@/components/home/VideoSection";
import { InteractiveTools } from "@/components/home/InteractiveTools";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ProcessSection } from "@/components/home/ProcessSection";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { ContactTeaser } from "@/components/shared/ContactTeaser";

import { SITE_BRAND } from "@/data/site/brand";
import { HOMEPAGE_SHOWCASE_CONTENT } from "@/data/site/homepage";
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
    <div className="min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* 1. Hero */}
      <HomepageHero />

      {/* 2. Partnership Banner */}
      <PartnershipBanner />

      {/* 3. Product Categories */}
      <Collections />

      {/* 4. Stats */}
      <TrustStrip stats={stats} embedded={false} showLogos={false} />

      {/* 5. Showcase */}
      <ShowcaseCarousel
        sectionLabel={HOMEPAGE_SHOWCASE_CONTENT.sectionLabel}
        sectionTitle={HOMEPAGE_SHOWCASE_CONTENT.sectionTitle}
        items={[...HOMEPAGE_SHOWCASE_CONTENT.items]}
        browseLink="/projects"
        browseLabel="View portfolio"
      />

      {/* 7. Tools */}
      <InteractiveTools />

      {/* 8. Why Choose Us */}
      <WhyChooseUs />

      {/* 9. Process / Delivery System */}
      <ProcessSection dark />

      {/* 10. FAQs */}
      <HomeFAQ />

      {/* 11. Contact */}
      <ContactTeaser />

    </div>
  );
}

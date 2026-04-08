import type { Metadata } from "next";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { buildPageMetadata, buildFAQJsonLd } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";
import { HOMEPAGE_FAQ_CONTENT } from "@/data/site/homepage";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "FAQ | One&Only",
  description: "Common questions about our office furniture, delivery, installation, and warranty.",
  path: "/faq",
});

const faqJsonLd = buildFAQJsonLd(
  HOMEPAGE_FAQ_CONTENT.items.map((item) => ({ question: item.q, answer: item.a })),
);

export default function FAQPage() {
  return (
    <div className="pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeFAQ />
    </div>
  );
}

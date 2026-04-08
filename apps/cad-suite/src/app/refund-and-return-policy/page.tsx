import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { LEGAL_PAGE_COPY } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: LEGAL_PAGE_COPY.refund.metadataTitle,
  description: LEGAL_PAGE_COPY.refund.metadataDescription,
  path: "/refund-and-return-policy",
});

export default function RefundAndReturnPolicyPage() {
  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <Hero
        variant="small"
        title={LEGAL_PAGE_COPY.refund.heroTitle}
        subtitle={LEGAL_PAGE_COPY.refund.heroSubtitle}
        showButton={false}
        backgroundImage="/images/hero/hero-3.webp"
      />

      <section className="container px-6 py-16 2xl:px-0 md:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="scheme-panel-soft scheme-border rounded-blob border p-7 md:p-9">
            <p className="typ-label scheme-text-brand">{LEGAL_PAGE_COPY.refund.overviewKicker}</p>
            <h2 className="typ-section scheme-text-strong mt-3">
              {LEGAL_PAGE_COPY.refund.overviewTitle}
            </h2>
            <p className="page-copy scheme-text-body mt-4">
              {LEGAL_PAGE_COPY.refund.overviewDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="home-btn-primary">
                Contact sales desk
              </Link>
              <Link href="/service" className="home-btn-secondary">
                Service and support
              </Link>
            </div>
          </aside>

          <div className="space-y-4">
          {LEGAL_PAGE_COPY.refund.sections.map((section) => (
            <article
              key={section.title}
              className={`scheme-border rounded-huge border p-7 md:p-8 ${
                section.tone === "soft" ? "scheme-panel-soft" : "scheme-panel"
              }`}
            >
              <h2 className="typ-card scheme-text-strong">{section.title}</h2>
              {section.items.length > 0 ? (
                <ul className="page-copy-sm scheme-text-body mt-4 list-disc space-y-3 pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {"contactLines" in section && section.contactLines ? (
                <div className="page-copy-sm scheme-text-body mt-4 space-y-2">
                  {section.contactLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { CustomerQueryForm } from "@/components/contact/CustomerQueryForm";
import { SITE_CONTACT } from "@/data/site/contact";
import { CONTACT_PAGE_COPY } from "@/data/site/routeCopy";
import { buildPageJsonLd, buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Contact us",
  description: CONTACT_PAGE_COPY.heroSubtitle,
  path: "/contact",
  image: "/images/hero/tvs-patna-enhanced.webp",
});

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

const cardStyle =
  "border border-soft rounded-[var(--radius-lg)] p-5 md:p-6 bg-panel shadow-theme-soft";

const labelStyle =
  "font-sans text-[length:var(--type-label-size)] font-medium tracking-[0.11em] uppercase leading-[1.2] text-muted";

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const intent = firstValue(resolvedSearchParams.intent);
  const source = firstValue(resolvedSearchParams.source);
  const contactJsonLd = buildPageJsonLd(SITE_URL, {
    path: "/contact",
    title: "Contact us",
    description: CONTACT_PAGE_COPY.heroSubtitle,
    pageType: "ContactPage",
  });

  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <Hero
        variant="small"
        title={CONTACT_PAGE_COPY.heroTitle}
        subtitle={CONTACT_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/images/hero/tvs-patna-enhanced.webp"
      />
      <section className="container grid gap-8 px-6 py-12 2xl:px-0 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-12 md:py-16">
        <div className="space-y-8">
          <div className="section-divider border-b border-soft pb-6">
            <p className={labelStyle}>{CONTACT_PAGE_COPY.sectionTitle}</p>
            <h2 className="typ-section mt-3 text-strong">{CONTACT_PAGE_COPY.introTitle}</h2>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-body">
              {CONTACT_PAGE_COPY.introDescription}
            </p>
            <p className="mt-4 text-sm leading-7 text-body">
              {CONTACT_PAGE_COPY.resourceDeskLead}{" "}
              <Link href="/downloads" className="font-semibold text-primary transition-colors hover:text-primary-hover">
                {CONTACT_PAGE_COPY.resourceDeskCta}
              </Link>{" "}
              {CONTACT_PAGE_COPY.resourceDeskTail}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CONTACT_PAGE_COPY.offices.map((office) => (
              <div key={office.title} className={cardStyle}>
                <p className={labelStyle}>{office.title}</p>
                <div className="mt-3">
                  {office.lines.map((line) => (
                    <p key={`${office.title}-${line}`}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={cardStyle}>
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className={labelStyle}>Service region</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{SITE_CONTACT.regionLine}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-t border-soft py-4">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className={labelStyle}>Quotes and planning</p>
                <a
                  href={`tel:${SITE_CONTACT.salesPhone.replace(/\s+/g, "")}`}
                  className="mt-1 inline-flex items-center text-base text-strong transition-colors hover:text-primary"
                >
                  {SITE_CONTACT.salesPhone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4 border-t border-soft py-4">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className={labelStyle}>Support and enquiries</p>
                <a
                  href={`tel:${SITE_CONTACT.supportPhone.replace(/\s+/g, "")}`}
                  className="mt-1 inline-flex items-center text-base text-strong transition-colors hover:text-primary"
                >
                  {SITE_CONTACT.supportPhone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4 border-t border-soft py-4 last:pb-0">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className={labelStyle}>Email</p>
                <a href={`mailto:${SITE_CONTACT.salesEmail}`} className="mt-1 inline-flex items-center text-base text-strong transition-colors hover:text-primary">
                  {SITE_CONTACT.salesEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-soft rounded-xl p-6 md:p-8 bg-panel shadow-theme-panel">
          <div className="scheme-panel-dark mb-6 rounded-3xl p-6">
            <p className="typ-label scheme-text-inverse-muted">{CONTACT_PAGE_COPY.quickDeskKicker}</p>
            <h2 className="typ-section mt-3 text-inverse">{CONTACT_PAGE_COPY.quickDeskTitle}</h2>
            <p className="page-copy scheme-text-inverse-body mt-3">{CONTACT_PAGE_COPY.quickDeskDescription}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/planner" className="btn-primary">
                {CONTACT_PAGE_COPY.quickDeskSecondaryCta}
              </Link>
            </div>
          </div>
          <CustomerQueryForm intent={intent} source={source} />
        </div>
      </section>
    </section>
  );
}


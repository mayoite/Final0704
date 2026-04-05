import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock3, ShieldCheck, ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { HOMEPAGE_TRUST_CONTENT } from "@/data/site/homepage";
import { PRODUCTS_PAGE_COPY } from "@/data/site/routeCopy";
import { buildBreadcrumbJsonLd, buildPageJsonLd, buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

const PILLAR_ICONS = {
  "check-circle": CheckCircle2,
  clock: Clock3,
  shield: ShieldCheck,
} as const;

const CATEGORY_ITEMS = [
  { name: "Seating", url: "/products/seating" },
  { name: "Workstations", url: "/products/workstations" },
  { name: "Tables", url: "/products/tables" },
  { name: "Storage", url: "/products/storages" },
  { name: "Soft Seating", url: "/products/soft-seating" },
  { name: "Education", url: "/products/education" },
];

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Workspace Products",
  description: PRODUCTS_PAGE_COPY.heroSubtitle,
  path: "/products",
  image: "/images/catalog/oando-workstations--deskpro/image-1.jpg",
  keywords: [
    "office furniture Patna",
    "office furniture Bihar",
    "office furniture Jharkhand",
    "workspace furniture India",
    "ergonomic chairs Patna",
    "modular workstations Bihar",
    "meeting tables Jharkhand",
  ],
});

export default function ProductsPage() {
  const productsJsonLd = buildPageJsonLd(SITE_URL, {
    path: "/products",
    title: "Workspace Products",
    description: PRODUCTS_PAGE_COPY.heroSubtitle,
    pageType: "CollectionPage",
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(SITE_URL, [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Workspace Product Categories",
    itemListElement: CATEGORY_ITEMS.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: new URL(item.url, SITE_URL).toString(),
    })),
  };

  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Hero
        variant="small"
        title={PRODUCTS_PAGE_COPY.heroTitle}
        subtitle={PRODUCTS_PAGE_COPY.heroSubtitle}
        showButton
        buttonText="Browse Categories"
        buttonLink="#categories"
        backgroundImage="/images/products/60x30-workstation-1.webp"
      />

      <section className="w-full py-12 md:py-18">
        <div className="container px-6 2xl:px-0">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="scheme-panel rounded-blob border px-6 py-7 md:px-8 md:py-8">
              <p className="typ-label mb-4 scheme-text-brand">
                {PRODUCTS_PAGE_COPY.strategyKicker}
              </p>
              <h2 className="typ-section max-w-3xl scheme-text-strong">
                {PRODUCTS_PAGE_COPY.strategyTitle}
              </h2>
              <p className="page-copy mt-4 max-w-2xl scheme-text-body">
                {PRODUCTS_PAGE_COPY.strategyDescription}
              </p>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {PRODUCTS_PAGE_COPY.featureBullets.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border scheme-border bg-panel px-4 py-4 page-copy-sm scheme-text-body"
                  >
                    <span aria-hidden="true" className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      +
                    </span>
                    <span className="block">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6">
              <div className="scheme-panel rounded-blob border p-4 md:p-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-giant">
                  <Image
                    src="/images/catalog/oando-workstations--deskpro/image-1.jpg"
                    alt="Deskpro workstation setup used as category planning preview"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 surface-overlay-inverse-12" />
                </div>
              </div>

              <div className="scheme-panel rounded-blob border px-5 py-5 md:px-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="typ-label scheme-text-brand">Category routes</p>
                    <p className="mt-2 text-sm scheme-text-body">
                      Start with a category, then narrow by filters, compare, and enquiry.
                    </p>
                  </div>
                  <Link href="#categories" className="link-arrow shrink-0">
                    Open range
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ITEMS.map((item) => (
                    <Link key={item.url} href={item.url} className="btn-outline btn-pill-compact">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="categories" className="w-full">
        <CategoryGrid />
      </div>

      <section className="scheme-section-soft scheme-border w-full border-y py-14 md:py-18">
        <div className="container px-6 2xl:px-0">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="typ-label mb-4 scheme-text-brand">{PRODUCTS_PAGE_COPY.whyKicker}</p>
              <h2 className="typ-section scheme-text-strong">
                {PRODUCTS_PAGE_COPY.whyTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm scheme-text-body">
              Category selection should shorten the decision, not expand it. These are the rules behind the shortlist.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PRODUCTS_PAGE_COPY.pillars.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.icon];
              const headingId = `pillar-${pillar.title.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <article
                  key={pillar.title}
                  aria-labelledby={headingId}
                  className="scheme-panel rounded-[1.8rem] border p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 id={headingId} className="typ-h3 mt-5 scheme-text-strong">
                    {pillar.title}
                  </h3>
                  <p className="page-copy-sm mt-3 scheme-text-body">{pillar.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20">
        <div className="container px-6 2xl:px-0">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="scheme-panel rounded-blob border p-8 md:p-10">
              <p className="typ-label mb-4 scheme-text-brand">{PRODUCTS_PAGE_COPY.consultKicker}</p>
              <h2 className="typ-section max-w-3xl scheme-text-strong">
                {PRODUCTS_PAGE_COPY.consultTitle}
              </h2>
              <p className="page-copy mt-4 max-w-3xl scheme-text-body">
                {PRODUCTS_PAGE_COPY.consultDescription}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary">
                  {PRODUCTS_PAGE_COPY.consultPrimaryCta}
                </Link>
                <Link href="/planning" className="btn-outline">
                  {PRODUCTS_PAGE_COPY.consultSecondaryCta}
                </Link>
                <Link href="/downloads" className="btn-outline">
                  {PRODUCTS_PAGE_COPY.consultTertiaryCta}
                </Link>
              </div>
            </div>

            <div className="scheme-panel rounded-blob border p-6 md:p-7">
              <p className="typ-label mb-5 scheme-text-brand">{PRODUCTS_PAGE_COPY.confidenceKicker}</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {HOMEPAGE_TRUST_CONTENT.logos.slice(0, 8).map((logo) => (
                  <div
                    key={logo.name}
                    className="flex min-h-14 items-center justify-center rounded-lg border scheme-border bg-panel px-3 py-2"
                  >
                    {logo.src ? (
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={110}
                        height={36}
                        className="h-7 w-auto object-contain opacity-80 grayscale mix-blend-multiply transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                      />
                    ) : (
                      <span className="rounded-full border border-soft px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase text-muted">
                        {logo.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/compare" className="btn-outline">
                  {PRODUCTS_PAGE_COPY.confidenceCta}
                </Link>
                <Link href="/products/seating" className="link-arrow">
                  Start with seating
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}



import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { SITE_CONTACT, buildWhatsAppHref } from "@/data/site/contact";
import { DOWNLOADS_PAGE_COPY, DOWNLOADS_RESOURCE_CATEGORIES } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: DOWNLOADS_PAGE_COPY.metadataTitle,
  description: DOWNLOADS_PAGE_COPY.metadataDescription,
  path: "/downloads",
});

export default function DownloadsPage() {
  return (
    <section className="flex min-h-screen flex-col items-center bg-panel">
      <Hero
        variant="small"
        title={DOWNLOADS_PAGE_COPY.heroTitle}
        subtitle={DOWNLOADS_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/images/hero/hero-3.webp"
      />

      <section className="w-full bg-panel py-18 md:py-22">
        <div className="container px-6 2xl:px-0">
          <div className="mb-10">
            <p className="typ-label mb-4 text-body">{DOWNLOADS_PAGE_COPY.resourceKicker}</p>
            <h2 className="typ-section max-w-3xl text-strong">
              {DOWNLOADS_PAGE_COPY.resourceTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-body md:text-lg">
              {DOWNLOADS_PAGE_COPY.resourceDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {DOWNLOADS_RESOURCE_CATEGORIES.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-muted bg-hover p-6 transition-colors hover:border-muted"
              >
                <h3 className="text-2xl font-light tracking-tight text-strong">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-strong">{item.detail}</p>
                <Link href={item.href} className="link-arrow mt-5">
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-huge border border-muted bg-inverse p-6 text-inverse md:p-8">
              <p className="typ-label scheme-text-inverse-muted mb-3">{DOWNLOADS_PAGE_COPY.processKicker}</p>
              <h3 className="text-3xl font-light tracking-tight">{DOWNLOADS_PAGE_COPY.processTitle}</h3>
              <div className="mt-8 space-y-5">
                {DOWNLOADS_PAGE_COPY.processSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="grid gap-3 border-t border-inverse pt-5 first:border-t-0 first:pt-0 md:grid-cols-[auto_1fr]"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-inverse text-sm text-subtle">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="text-lg font-medium text-inverse">{step.title}</h4>
                      <p className="scheme-text-inverse-body mt-2 max-w-2xl text-sm leading-7 md:text-base">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-huge border border-muted bg-hover p-6 md:p-8">
              <p className="typ-label mb-3 text-body">{DOWNLOADS_PAGE_COPY.noteTitle}</p>
              <p className="text-base leading-relaxed text-strong">{DOWNLOADS_PAGE_COPY.noteBody}</p>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-body md:text-base">
                {DOWNLOADS_PAGE_COPY.notePoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="mt-10 rounded-huge border border-muted bg-panel p-6 md:p-8">
            <p className="typ-label mb-3 text-body">{DOWNLOADS_PAGE_COPY.urgentKicker}</p>
            <p className="max-w-3xl text-base leading-relaxed text-strong">
              {DOWNLOADS_PAGE_COPY.urgentDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                {DOWNLOADS_PAGE_COPY.primaryCta}
              </Link>
              <Link
                href={`mailto:${SITE_CONTACT.salesEmail}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-strong bg-panel px-6 py-3 text-sm font-semibold tracking-wide text-strong transition-colors hover:border-strong hover:bg-hover"
              >
                {DOWNLOADS_PAGE_COPY.secondaryCta}
              </Link>
              <Link
                href={buildWhatsAppHref(
                  "Hi, I need a product catalog or technical sheet pack for my workspace project.",
                )}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.08] px-6 py-3 text-sm font-semibold tracking-wide text-primary transition-colors hover:border-primary/40 hover:bg-primary/[0.14]"
              >
                {DOWNLOADS_PAGE_COPY.tertiaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}


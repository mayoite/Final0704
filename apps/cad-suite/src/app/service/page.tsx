import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { SITE_CONTACT } from "@/data/site/contact";
import {
  SERVICE_PAGE_CHANNELS,
  SERVICE_PAGE_COPY,
  SERVICE_PAGE_PILLARS,
} from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Service and Support",
  description:
    "After-sales support, warranty service, and delivery tracking for One&Only workspace projects.",
  path: "/service",
});

export default function ServicePage() {
  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <Hero
        variant="small"
        title={SERVICE_PAGE_COPY.heroTitle}
        subtitle={SERVICE_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/hero/usha-hero.webp"
      />

      <section className="w-full py-18 md:py-22">
        <div className="container px-6 2xl:px-0">
          <div className="mb-12 max-w-3xl">
            <p className="typ-label scheme-text-body mb-4">{SERVICE_PAGE_COPY.frameworkKicker}</p>
            <h2 className="typ-section scheme-text-strong">{SERVICE_PAGE_COPY.frameworkTitle}</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SERVICE_PAGE_PILLARS.map((item) => (
              <article
                key={item.title}
                className="scheme-panel scheme-border rounded-3xl border p-6"
              >
                <h3 className="text-2xl font-light tracking-tight text-strong">{item.title}</h3>
                <p className="page-copy scheme-text-body mt-3">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scheme-section-soft scheme-border w-full border-y py-18 md:py-22">
        <div className="container px-6 2xl:px-0">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="typ-label scheme-text-body mb-4">{SERVICE_PAGE_COPY.channelsKicker}</p>
              <h2 className="typ-section scheme-text-strong">{SERVICE_PAGE_COPY.channelsTitle}</h2>
              <div className="mt-6 space-y-4">
                {SERVICE_PAGE_CHANNELS.map((channel) => {
                  if (channel.kind === "supportPhone") {
                    const phone = SITE_CONTACT.supportPhone;
                    return (
                      <a
                        key={channel.label}
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="scheme-panel scheme-border block rounded-lg border px-5 py-4 transition-colors hover:border-primary/50"
                      >
                        <p className="text-xs font-semibold uppercase tracking-ultra text-body">
                          {channel.label}
                        </p>
                        <p className="mt-1 text-lg text-strong">{phone}</p>
                      </a>
                    );
                  }

                  if (channel.kind === "salesEmail") {
                    const email = SITE_CONTACT.salesEmail;
                    return (
                      <a
                        key={channel.label}
                        href={`mailto:${email}`}
                        className="scheme-panel scheme-border block rounded-lg border px-5 py-4 transition-colors hover:border-primary/50"
                      >
                        <p className="text-xs font-semibold uppercase tracking-ultra text-body">
                          {channel.label}
                        </p>
                        <p className="mt-1 text-lg text-strong">{email}</p>
                      </a>
                    );
                  }

                  return (
                    <a
                      key={channel.label}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="scheme-panel scheme-border block rounded-lg border px-5 py-4 transition-colors hover:border-primary/50"
                    >
                      <p className="text-xs font-semibold uppercase tracking-ultra text-body">
                        {channel.label}
                      </p>
                      <p className="mt-1 text-lg text-strong">{channel.value}</p>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="scheme-panel scheme-border rounded-3xl border p-6">
              <p className="typ-label scheme-text-body mb-3">{SERVICE_PAGE_COPY.supportKicker}</p>
              <p className="page-copy scheme-text-body">
                {SERVICE_PAGE_COPY.supportDescription}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary">
                  {SERVICE_PAGE_COPY.primaryCta}
                </Link>
                <Link href="/tracking" className="btn-outline">
                  {SERVICE_PAGE_COPY.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-6 md:py-10">
        <div className="container px-6 2xl:px-0">
          <div className="scheme-panel-dark rounded-4xl p-8 md:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="typ-label scheme-text-inverse-muted">{SERVICE_PAGE_COPY.supportDeskKicker}</p>
                <h2 className="typ-section mt-4 text-inverse">{SERVICE_PAGE_COPY.supportDeskTitle}</h2>
                <p className="page-copy scheme-text-inverse-body mt-4 max-w-2xl">
                  {SERVICE_PAGE_COPY.supportDeskDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact" className="home-btn-primary">
                  {SERVICE_PAGE_COPY.primaryCta}
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


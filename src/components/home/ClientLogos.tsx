"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const valuePillars = [
  {
    title: "Customising",
    description:
      "We build customized office furniture. In series. Talk to us about our customizing capabilities.",
    href: "/contact",
    linkText: "Learn more",
  },
  {
    title: "Design & quality",
    description:
      "We live quality you can touch. High-quality, well thought-out, safe and flexible — Made in India.",
    href: "/about",
    linkText: "Discover quality",
  },
  {
    title: "Sustainably produced",
    description:
      "We think and act sustainably. Responsible sourcing, durable materials, and eco-conscious manufacturing.",
    href: "/about",
    linkText: "More about sustainability",
  },
];

export function ClientLogos() {
  return (
    <section>
      <div className="container mx-auto px-6 lg:px-12 pt-24 pb-12">
        <div className="max-w-4xl mb-16">
          <p className="scheme-text-muted text-sm tracking-[0.3em] uppercase mb-4">
            Why choose us
          </p>
          <h2 className="font-slogan text-5xl mb-6 text-strong">
            We have the answers.
          </h2>
          <p className="text-xl text-muted leading-relaxed max-w-2xl">
            As a leading name in the Indian office furniture industry, we offer
            innovative, functional and aesthetically pleasing products of
            outstanding quality — also as customized special solutions.
          </p>
        </div>
      </div>

      {/* Value pillars — 3 columns with top border like OandO */}
      <div className="container mx-auto px-6 lg:px-12 pt-16 pb-24">
        <div className="grid md:grid-cols-3 gap-12 md:gap-0 md:divide-x divide-soft">
          {valuePillars.map((pillar) => (
            <div
              key={pillar.title}
              className="px-0 md:px-10 first:pl-0 last:pr-0 py-4"
            >
              <h4 className="mb-4 text-3xl font-light text-strong">
                {pillar.title}
              </h4>
              <p className="text-xl text-muted leading-relaxed mb-6">
                {pillar.description}
              </p>
              <Link
                href={pillar.href}
                className="inline-flex items-center gap-1.5 text-[16px] text-primary font-medium hover:underline"
              >
                {pillar.linkText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOMEPAGE_SOLUTIONS_CONTENT } from "@/data/site/homepage";

const sectionShellClass = "container px-6 2xl:px-0";

const panelClass =
  "rounded-blob border border-(--border-muted) bg-panel px-6 py-8 shadow-[0_28px_76px_-52px_var(--overlay-inverse-12)] md:px-8 md:py-10";

const kickerClass =
  "mb-3 text-[0.74rem] font-semibold uppercase leading-[1.2] tracking-wider text-(--text-body)";

const headingClass =
  "max-w-3xl font-display text-[clamp(1.9rem,2.7vw,2.85rem)] font-[350] leading-[1] tracking-[var(--type-letter-title)] text-balance text-(--text-heading)";

const copyClass =
  "mt-4 max-w-2xl font-sans text-[var(--type-body-lg-size)] font-normal leading-[1.52] tracking-[var(--type-letter-copy)] text-(--text-body)";

const linkClass =
  "inline-flex w-fit items-center gap-2 typ-body-sm font-semibold tracking-[0.01em] text-(--text-brand) transition-[color,transform] duration-fast [transition-timing-function:var(--ease-standard)] hover:text-(--color-primary-active) [&_svg]:transition-transform [&_svg]:duration-[var(--motion-fast)] [&_svg]:[transition-timing-function:var(--ease-standard)] hover:[&_svg]:translate-x-1";

const cardClass =
  "group relative flex h-full flex-col overflow-hidden rounded-giant border border-(--border-soft) bg-panel shadow-(--shadow-soft) transition-[transform,border-color,box-shadow] duration-[var(--motion-base)] [transition-timing-function:var(--ease-standard)] hover:-translate-y-1.5 hover:border-(--border-hover) hover:shadow-[0_34px_76px_-52px_var(--overlay-inverse-24)]";

export function SolutionsShowcase() {
  return (
    <section className="py-[var(--section-space-sm)]">
      <div className={sectionShellClass}>
        <div className={panelClass}>
          <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className={kickerClass}>{HOMEPAGE_SOLUTIONS_CONTENT.kicker}</p>
              <h2 className={headingClass}>
                {HOMEPAGE_SOLUTIONS_CONTENT.title}
              </h2>
              <p className={`${copyClass} max-w-xl`}>{HOMEPAGE_SOLUTIONS_CONTENT.description}</p>
            </div>

            <Link href="/products" className={linkClass}>
              {HOMEPAGE_SOLUTIONS_CONTENT.catalogCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {HOMEPAGE_SOLUTIONS_CONTENT.capabilities.map((item) => (
              <Link key={item.title} href={item.href} className={cardClass}>
                <div className="relative overflow-hidden bg-(--surface-muted) [aspect-ratio:16/11]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-standard)] group-hover:scale-[1.045]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 px-5 py-5 md:px-6 md:py-6">
                  <h3 className="font-display text-[var(--type-card-title-size)] font-[350] leading-[1.02] tracking-[-0.035em] text-(--text-heading) transition-colors duration-fast [transition-timing-function:var(--ease-standard)] group-hover:text-(--color-primary-active)">
                    {item.title}
                  </h3>
                  <p className="typ-body-sm leading-[1.55] text-(--text-body) transition-colors duration-fast [transition-timing-function:var(--ease-standard)] group-hover:text-(--text-strong)">
                    {item.outcome}
                  </p>
                  <span className={`${linkClass} mt-auto`}>
                    View
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


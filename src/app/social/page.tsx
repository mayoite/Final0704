import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { getProducts } from "@/lib/getProducts";
import { SOCIAL_PAGE_COPY, SOCIAL_PAGE_POSTS } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Social Highlights",
  description:
    "Project inspiration and product-linked social highlights grounded in the live catalog and planning routes.",
  path: "/social",
});

export default async function SocialPage() {
  const products = await getProducts();

  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <Hero
        variant="small"
        title={SOCIAL_PAGE_COPY.heroTitle}
        subtitle={SOCIAL_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/projects/Titan/27-06-2025 Image 05_edited_edited.webp"
      />

      <section className="container px-6 py-18 2xl:px-0 md:py-22">
        <div className="grid grid-cols-1 gap-8 grid-cols-1_05-0_95">
          <div>
            <p className="typ-label scheme-text-body mb-4">{SOCIAL_PAGE_COPY.introKicker}</p>
            <h2 className="typ-section scheme-text-strong max-w-3xl">
              {SOCIAL_PAGE_COPY.introTitle}
            </h2>
            <p className="page-copy scheme-text-body mt-5 max-w-2xl">
              {SOCIAL_PAGE_COPY.introDescription}
            </p>
          </div>

          <div className="scheme-panel scheme-border rounded-huge border p-6 md:p-8">
            <p className="typ-label scheme-text-body mb-4">Social handle</p>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/8 text-primary">
                <Star className="h-5 w-5" />
              </span>
              <p className="typ-h3 scheme-text-strong">{SOCIAL_PAGE_COPY.handleLabel}</p>
            </div>
            <p className="page-copy-sm scheme-text-body mt-4">
              This route is a curated inspiration surface, not a live embedded social feed.
            </p>
          </div>
        </div>
      </section>

      <section className="scheme-section-soft scheme-border w-full border-y py-18 md:py-22">
        <div className="container px-6 2xl:px-0">
          <div className="mb-8 max-w-3xl">
            <p className="typ-label scheme-text-body mb-4">{SOCIAL_PAGE_COPY.feedKicker}</p>
            <h2 className="typ-section scheme-text-strong">{SOCIAL_PAGE_COPY.feedTitle}</h2>
            <p className="page-copy scheme-text-body mt-5">{SOCIAL_PAGE_COPY.feedDescription}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {SOCIAL_PAGE_POSTS.map((post) => {
              const product = products.find((item) => item.slug === post.productSlug);
              const href = product ? `/products/${product.category_id}/${product.slug}` : "/products";

              return (
                <article
                  key={post.id}
                  className="scheme-panel scheme-border overflow-hidden rounded-xl border"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="typ-h3 scheme-text-strong">{post.title}</h3>
                    <p className="page-copy-sm scheme-text-body mt-3">{post.caption}</p>
                    <Link href={href} className="link-arrow mt-5">
                      View related route
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container px-6 py-18 2xl:px-0 md:py-22">
        <div className="scheme-panel-dark relative overflow-hidden rounded-blob p-8 md:p-10">
          <div className="absolute inset-y-0 right-0 w-1/2 surface-overlay-12" />
          <div className="relative z-10 grid gap-6 grid-cols-1_1-auto lg:items-end">
            <div className="max-w-2xl">
              <h2 className="typ-section text-inverse">{SOCIAL_PAGE_COPY.ctaTitle}</h2>
              <p className="page-copy scheme-text-inverse-body mt-4">{SOCIAL_PAGE_COPY.ctaDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                {SOCIAL_PAGE_COPY.primaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}



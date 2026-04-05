import type { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { GALLERY_PAGE_COPY, GALLERY_PROJECTS } from "@/data/site/routeCopy";
import { Masonry, MasonryItem } from "@/components/ui/Masonry";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Project Gallery",
  description:
    "Selected workspace deliveries across corporate, public, and institutional environments.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <Hero
        variant="small"
        title={GALLERY_PAGE_COPY.heroTitle}
        subtitle={GALLERY_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/projects/titan-gallery.webp"
      />

      <section className="container px-6 py-18 md:py-22 2xl:px-0">
        <div className="scheme-panel scheme-border mb-12 max-w-4xl rounded-blob border p-8 md:p-10">
          <p className="typ-label mb-4 scheme-text-body">{GALLERY_PAGE_COPY.kicker}</p>
          <h2 className="typ-section scheme-text-strong">{GALLERY_PAGE_COPY.title}</h2>
          <p className="page-copy mt-4 max-w-3xl scheme-text-body">
            {GALLERY_PAGE_COPY.description}
          </p>
        </div>

        <Masonry columns={2} gap="2rem">
          {GALLERY_PROJECTS.map((project) => (
            <MasonryItem key={`${project.title}-${project.location}`}>
              <article className="group scheme-border relative mb-8 overflow-hidden rounded-xl border bg-hover">
                <Image
                  src={project.image}
                  alt={`${project.title} project`}
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 surface-overlay-24" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="scheme-text-inverse-muted text-xs font-semibold uppercase tracking-ultra">
                    {project.category}
                  </p>
                  <h3 className="mt-2 text-3xl font-light tracking-tight text-inverse">{project.title}</h3>
                  <p className="scheme-text-inverse-body mt-1 text-sm">{project.location}</p>
                </div>
              </article>
            </MasonryItem>
          ))}
        </Masonry>
      </section>

      <ContactTeaser />
    </section>
  );
}



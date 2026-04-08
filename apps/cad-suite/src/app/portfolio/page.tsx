import type { Metadata } from "next";
import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";
import Image from "next/image";
import { Hero } from "@/components/home/Hero";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { PORTFOLIO_CLIENTS, PORTFOLIO_PAGE_COPY } from "@/data/site/routeCopy";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Portfolio",
  description: "Real delivery photos grouped by client projects.",
  path: "/portfolio",
});

type ClientPortfolio = (typeof PORTFOLIO_CLIENTS)[number];

type ClientPortfolioWithPhotos = ClientPortfolio & {
  photos: string[];
};

const BROKEN_PORTFOLIO_FILES = new Set([
  "snapedit_1688107891699 (1).webp",
]);

function encodePathForNextImage(pathname: string): string {
  return encodeURI(pathname);
}

async function getClientPhotos(folder: string): Promise<string[]> {
  const folderPath = path.join(process.cwd(), "public", "projects", folder);
  const fileNames = await fs.readdir(folderPath);
  return fileNames
    .filter((name) => /\.(webp|jpg|jpeg|png)$/i.test(name))
    .filter((name) => !BROKEN_PORTFOLIO_FILES.has(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/projects/${folder}/${name}`);
}

async function buildPortfolioData(): Promise<ClientPortfolioWithPhotos[]> {
  const items = await Promise.all(
    PORTFOLIO_CLIENTS.map(async (client) => {
      const photos = await getClientPhotos(client.folder);
      return { ...client, photos };
    }),
  );

  return items.filter((item) => item.photos.length >= 2);
}

export default async function PortfolioPage() {
  const portfolio = await buildPortfolioData();
  const totalPhotos = portfolio.reduce((sum, item) => sum + item.photos.length, 0);
  const portfolioHero = encodePathForNextImage(
    portfolio.find((item) => item.id === "titan")?.photos[0] ??
      "/projects/Titan/27-06-2025 Image 05_edited_edited.webp",
  );

  return (
    <section className="scheme-page flex min-h-screen flex-col">
      <Hero
        variant="small"
        title={PORTFOLIO_PAGE_COPY.heroTitle}
        subtitle={PORTFOLIO_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage={portfolioHero}
      />

      <section className="container px-6 py-16 md:py-20 2xl:px-0">
        <div className="scheme-panel scheme-border mb-10 flex flex-wrap items-end justify-between gap-6 rounded-blob border p-8 md:p-10">
          <div>
            <p className="typ-eyebrow">{PORTFOLIO_PAGE_COPY.eyebrow}</p>
            <h2 className="typ-h1 mt-2 text-strong">{PORTFOLIO_PAGE_COPY.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted">
              {PORTFOLIO_PAGE_COPY.totalTemplate
                .replace("{clients}", String(portfolio.length))
                .replace("{photos}", String(totalPhotos))}
            </p>
            <Link href="/projects" className="btn-outline">
              View clients
            </Link>
          </div>
        </div>

        <div className="space-y-12">
          {portfolio.map((client) => (
            <article
              key={client.id}
              className="scheme-panel scheme-border overflow-hidden rounded-3xl border p-5 md:p-7"
            >
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h3 className="typ-h2 text-strong">{client.name}</h3>
                  <p className="mt-1 text-sm uppercase tracking-wider text-muted">
                    {client.location}
                  </p>
                </div>
                <p className="max-w-3xl text-base leading-relaxed text-muted">
                  {client.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="relative overflow-hidden rounded-2xl border border-soft md:col-span-7">
                  <Image
                    src={encodePathForNextImage(client.photos[0])}
                    alt={`${client.name} portfolio photo 1`}
                    width={1600}
                    height={1000}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-5">
                  {client.photos.slice(1).map((photo, index) => (
                    <div
                      key={`${client.id}-${photo}`}
                      className="relative overflow-hidden rounded-2xl border border-soft"
                    >
                      <Image
                        src={encodePathForNextImage(photo)}
                        alt={`${client.name} portfolio photo ${index + 2}`}
                        width={900}
                        height={700}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}

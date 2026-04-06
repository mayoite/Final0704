import type { Metadata } from "next";
import "./globals.css";
import { CookieConsentBar } from "@/components/site/CookieConsentBar";
import { SiteFooter } from "@/components/site/Footer";
import { FooterLogoMarquee } from "@/components/site/FooterLogoMarquee";
import { SiteHeader } from "@/components/site/Header";
import dynamic from "next/dynamic";
import QueryProvider from "@/app/providers/QueryProvider";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { ciscoSans, helveticaNeue } from "@/lib/fonts";
import { SITE_URL } from "@/lib/siteUrl";
import { buildGlobalJsonLd, buildSiteMetadata } from "@/data/site/seo";

const DynamicBotWrapper = dynamic(() => import("@/components/bot/DynamicBotWrapper"));

export const metadata: Metadata = buildSiteMetadata(SITE_URL);

const GLOBAL_JSON_LD = buildGlobalJsonLd(SITE_URL);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${ciscoSans.variable} ${helveticaNeue.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(GLOBAL_JSON_LD),
          }}
        />
      </head>
      <body className="antialiased bg-panel selection:bg-primary selection:text-inverse">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-9999 focus:bg-panel focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <FooterLogoMarquee />
          <SiteFooter />
          <CookieConsentBar />
          <DynamicBotWrapper />
          <WhatsAppCTA />
        </QueryProvider>
      </body>
    </html>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { FooterLogoMarquee } from "@/components/site/FooterLogoMarquee";
import { CookieConsentBar } from "@/components/site/CookieConsentBar";
import DynamicBotWrapper from "@/components/bot/DynamicBotWrapper";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";

export function RouteChrome({
  position,
}: {
  position: "top" | "bottom";
}) {
  const pathname = usePathname();
  const isPlannerRoute = pathname === "/planner" || pathname?.startsWith("/planner/");

  if (position === "top") {
    if (isPlannerRoute) {
      return null;
    }

    return <SiteHeader />;
  }

  if (isPlannerRoute) {
    return null;
  }

  return (
    <>
      <FooterLogoMarquee />
      <SiteFooter />
      <CookieConsentBar />
      <DynamicBotWrapper />
      <WhatsAppCTA />
    </>
  );
}

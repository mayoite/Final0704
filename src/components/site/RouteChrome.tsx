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
  const isCADRoute =
    pathname === "/planner" || pathname?.startsWith("/planner/") ||
    pathname === "/planners" || pathname?.startsWith("/planners/") ||
    pathname === "/planner-blueprint" || pathname?.startsWith("/planner-blueprint/") ||
    pathname === "/planner1" || pathname?.startsWith("/planner1/") ||
    pathname === "/planner-lab" || pathname?.startsWith("/planner-lab/") ||
    pathname === "/draw" || pathname?.startsWith("/draw/") ||
    pathname === "/configurator" || pathname?.startsWith("/configurator/");

  if (position === "top") {
    if (isCADRoute) {
      return null;
    }

    return <SiteHeader />;
  }

  if (isCADRoute) {
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

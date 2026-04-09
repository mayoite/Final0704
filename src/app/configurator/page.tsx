import type { Metadata } from "next";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";
import ConfiguratorPageClient from "./ConfiguratorPageClient";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Office Planning Studio",
  description:
    "Lay out workstations, tables, seating, and storage in a 2D office planning workspace.",
  path: "/configurator",
});

export default function ConfiguratorPage() {
  return <ConfiguratorPageClient />;
}

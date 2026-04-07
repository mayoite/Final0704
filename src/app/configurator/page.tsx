import type { Metadata } from "next";
import { Configurator } from "@/components/configurator/Configurator";
import { buildPageMetadata } from "@/data/site/seo";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = buildPageMetadata(SITE_URL, {
  title: "Office Planning Studio",
  description:
    "Lay out workstations, tables, seating, and storage in a 2D office planning workspace.",
  path: "/configurator",
});

export default async function ConfiguratorPage() {
  return (
    <section className="min-h-screen bg-panel">
      <section className="border-b border-soft bg-hover/60">
        <div className="mx-auto max-w-[1760px] px-4 py-4 md:px-6 2xl:px-8">
          <p className="text-[11px] font-medium text-subtle">
            Office Planning Studio
          </p>
          <h1 className="mt-1.5 text-base font-semibold tracking-tight text-strong md:text-lg">
            Plan the room, then place the office.
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-body">
            Draw the shell, place products in 2D, and create a quote-ready workspace.
          </p>
        </div>
      </section>

      <div className="w-full">
        <Configurator />
      </div>
    </section>
  );
}

"use client";

import { HotspotImage, Hotspot } from "@/components/ui/HotspotImage";
import { Reveal } from "@/components/shared/Reveal";

// Temporarily disabling dynamic path resolution to fix build
// using static paths based on standard structure

const DEFAULT_HOTSPOTS: Hotspot[] = [
  {
    id: "h1",
    x: 65,
    y: 45,
    title: "Fluid X",
    description:
      "Ergonomic executive seating engineered for long-duration performance.",
    linkUrl: "/products/seating/oando-seating--fluid-x",
  },
  {
    id: "h2",
    x: 35,
    y: 65,
    title: "Cabin Workstation",
    description: "Modular L-shape workstation for focused, heads-down work.",
    linkUrl: "/products/workstations/cabin-l-shape",
  },
];

export function InteractiveRoom() {
  return (
    <section className="w-full bg-inverse py-32 text-inverse">
      <div className="container px-6 2xl:px-0">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <Reveal>
              <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-6">
                Freedom of Movement
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="scheme-text-muted text-xl font-light leading-relaxed">
                Designing spaces that adapt to you. Explore our curated
                configurations that support focus, collaboration, and everything
                in between.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.2} width="100%">
          <div className="w-full rounded-sm overflow-hidden border border-strong">
            <HotspotImage
              src="/images/products/imported/nuvic/image-1.webp"
              alt="Modern office spatial setup"
              hotspots={DEFAULT_HOTSPOTS}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}



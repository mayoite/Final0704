import Link from "next/link";
import { ArrowRight, Box, DraftingCompass, Layers2 } from "lucide-react";

const tools = [
  {
    title: "Planner",
    description: "Plan complete workspace layouts, place modules, inspect measurements, and prepare the BOQ.",
    href: "/planner",
    icon: DraftingCompass,
  },
  {
    title: "Draw",
    description: "Launch the canvas-first drawing route for direct layout drafting and diagramming work.",
    href: "/draw",
    icon: Layers2,
    badge: "New",
  },
  {
    title: "Configurator",
    description: "Build custom desk configurations and preview spacing in the 3D workspace route.",
    href: "/configurator",
    icon: Box,
  },
];

export function InteractiveTools() {
  return (
    <section className="home-section home-section--dark py-16 md:py-24">
      <div className="home-shell">
        <div className="mx-auto grid max-w-6xl gap-0 overflow-hidden rounded-[1.75rem] border border-inverse md:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group flex flex-col items-center text-center border-b border-inverse bg-[color:var(--overlay-panel-08)] p-8 shadow-[0_18px_40px_-32px_var(--overlay-inverse-24)] transition-all hover:bg-[color:var(--overlay-panel-12)] md:min-h-[22rem] md:border-b-0 md:px-10 md:py-10 [&:nth-child(1)]:md:border-r"
              >
                <div className="mb-6 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--overlay-panel-12)] text-[var(--color-accent)]">
                    <Icon className="h-6 w-6 stroke-[1.5]" />
                  </div>
                </div>

                {tool.badge && (
                  <span className="mb-5 rounded-full border border-inverse bg-[color:var(--overlay-panel-08)] px-3 py-1 typ-caption font-bold uppercase tracking-wider text-[var(--text-inverse-muted)]">
                    {tool.badge}
                  </span>
                )}
                
                <h3 className="typ-h3 text-[var(--text-inverse)] group-hover:text-[var(--color-accent)] transition-colors">
                  {tool.title}
                </h3>
                
                <p className="mt-4 flex-1 max-w-[30ch] text-sm leading-6 text-[var(--text-inverse-body)]">
                  {tool.description}
                </p>

                <div className="mt-8 flex items-center justify-center text-sm font-semibold text-[var(--color-accent)] transition-transform group-hover:translate-x-1">
                  Launch tool
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

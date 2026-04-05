import Link from "next/link";
import { ArrowRight, Box, Monitor, DraftingCompass } from "lucide-react";

const tools = [
  {
    title: "Floor Planner",
    description: "Draw and visualize your office layouts with our robust 2D smart diagramming engine.",
    href: "/smartdraw",
    icon: DraftingCompass,
    badge: "New",
  },
  {
    title: "3D Configurator",
    description: "Build custom desk configurations and preview spacing in a completely 3D interactive room layout.",
    href: "/configurator",
    icon: Box,
  },
  {
    title: "Partner Portal",
    description: "Sign in to manage and review enterprise projects, access specialized pricing, and manage tracking.",
    href: "/login",
    icon: Monitor,
  },
];

export function InteractiveTools() {
  return (
    <section className="home-section py-16 md:py-24 border-y scheme-border bg-hover/30">
      <div className="home-shell">
        <div className="mb-12 max-w-2xl">
          <p className="typ-label mb-3 text-primary">Digital Workspace</p>
          <h2 className="typ-h2 text-strong">Advanced planning tools</h2>
          <p className="typ-lead mt-4 text-body">
            Go beyond the catalog. Use our integrated suite of interactive tools to design, configure, and manage your commercial furniture projects.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group flex flex-col rounded-4xl border scheme-border bg-panel p-8 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl scheme-accent-wash text-primary">
                    <Icon className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  {tool.badge && (
                    <span className="rounded-full border scheme-border bg-hover px-3 py-1 typ-caption font-bold uppercase tracking-wider text-muted">
                      {tool.badge}
                    </span>
                  )}
                </div>
                
                <h3 className="typ-h3 text-strong group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                
                <p className="mt-4 flex-1 text-sm leading-6 text-body">
                  {tool.description}
                </p>

                <div className="mt-8 flex items-center text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
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

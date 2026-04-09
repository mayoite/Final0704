import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Box, DraftingCompass, Layers3, LayoutGrid } from "lucide-react";

export const metadata: Metadata = {
  title: "All Planners | One&Only",
  description:
    "Access the live planner, Blueprint planner, preserved lab routes, and configurator from one page.",
};

const PLANNER_LINKS = [
  {
    title: "Live planner",
    href: "/planner",
    icon: DraftingCompass,
    badge: "Active",
    description:
      "Current integrated planner tied to the live catalog, quote cart, and current planner runtime.",
  },
  {
    title: "Blueprint planner",
    href: "/planner-blueprint",
    icon: Layers3,
    badge: "Legacy",
    description:
      "Imported legacy Blueprint planner with the preserved 2D and 3D review workflow.",
  },
  {
    title: "Planner 1",
    href: "/planner1",
    icon: LayoutGrid,
    badge: "Mirror",
    description:
      "Preserved planner1 route inside the main app so the legacy entrypoint still exists.",
  },
  {
    title: "Planner lab",
    href: "/planner-lab",
    icon: LayoutGrid,
    badge: "Lab",
    description:
      "Preserved planner lab route for side-by-side access from the same deployment.",
  },
  {
    title: "Configurator",
    href: "/configurator",
    icon: Box,
    badge: "3D",
    description:
      "Launch the current configurator and 3D preview workflow from the same planners hub.",
  },
];

export default function PlannersPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(180,154,106,0.12),_transparent_48%),linear-gradient(180deg,_var(--surface-page)_0%,_var(--surface-panel)_100%)] px-6 py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Planner hub
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--text-heading)]">
            All planners in one main app.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
            Open the live planner, the imported Blueprint planner, preserved lab
            routes, and the configurator from one page. No separate deployment.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {PLANNER_LINKS.map((planner) => {
            const Icon = planner.icon;

            return (
              <Link
                key={planner.href}
                href={planner.href}
                className="group flex min-h-[240px] flex-col rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-glass-strong)] p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-panel)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] text-[var(--color-primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[var(--surface-accent-wash)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    {planner.badge}
                  </span>
                </div>

                <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-[var(--text-heading)] transition-colors group-hover:text-[var(--color-primary)]">
                  {planner.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-[var(--text-muted)]">
                  {planner.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-body)] transition-all group-hover:gap-3 group-hover:text-[var(--color-primary)]">
                  Open <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}

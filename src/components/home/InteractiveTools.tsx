"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Box, DraftingCompass } from "lucide-react";

const tools = [
  {
    title: "Planner",
    description: "Plan complete workspace layouts. Place furniture, check compliance, and export BOQs.",
    href: "/planner",
    icon: DraftingCompass,
  },
  {
    title: "Draw",
    description: "Draw and visualize your office layouts with our robust 2D smart diagramming engine.",
    href: "/draw",
    icon: DraftingCompass,
    badge: "New",
  },
  {
    title: "Configurator",
    description: "Build custom desk configurations and preview spacing in a 3D interactive room layout.",
    href: "/configurator",
    icon: Box,
  },
];

export function InteractiveTools() {
  return (
    <section className="scheme-page w-full border-t border-theme-soft py-16 md:py-20">
      <div className="container px-6 2xl:px-0">
        {/* Section header — same style as Collections */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="typ-section-title scheme-text-strong">
            Design your workspace, your way.
          </h2>
        </div>

        {/* Tool cards — standard grid matching Collections */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <Link
                  href={tool.href}
                  className="group scheme-panel scheme-border relative flex flex-col rounded-2xl border shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-30px_var(--overlay-inverse-16)] min-h-[170px]"
                >
                  {tool.badge && (
                    <span className="absolute top-5 right-5 rounded-full scheme-accent-wash scheme-text-brand px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider">
                      {tool.badge}
                    </span>
                  )}

                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border scheme-border scheme-section-soft scheme-text-brand transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                  </div>

                  <h3 className="text-lg font-medium tracking-tight scheme-text-strong mb-2 transition-colors group-hover:text-primary">
                    {tool.title}
                  </h3>

                  <p className="text-sm leading-relaxed scheme-text-body flex-1">
                    {tool.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold scheme-text-muted transition-all group-hover:text-primary group-hover:gap-2.5">
                    Launch <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

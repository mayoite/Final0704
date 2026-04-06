"use client";

import { motion } from "framer-motion";
import { HOMEPAGE_PROCESS_CONTENT } from "@/data/site/homepage";

interface ProcessSectionProps {
  dark?: boolean;
}

export function ProcessSection({ dark = true }: ProcessSectionProps) {
  return (
    <section
      className={`relative w-full py-10 md:py-14 border-t-2 border-t-[var(--color-accent)] ${
        dark ? "bg-[#0d0d0d] text-white" : "bg-panel text-body"
      }`}
    >
      <div className="container px-6 2xl:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center mb-16">
          <div>
            <h2 className="typ-section-title">
              {HOMEPAGE_PROCESS_CONTENT.titleLead}{" "}
              <span className="text-[var(--color-accent)] italic">
                {HOMEPAGE_PROCESS_CONTENT.titleAccent}
              </span>
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-start lg:items-center justify-start gap-6 lg:ml-10">
            <p className="text-sm font-light leading-relaxed max-w-md opacity-50">
              Each project follows a transparent sequence so procurement, facilities, and leadership teams stay aligned from day one.
            </p>
            <a
              href="/contact"
              className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)] text-[var(--color-accent)] px-6 py-2.5 text-sm font-medium tracking-tight hover:bg-[var(--color-accent)] hover:text-black transition-all whitespace-nowrap"
            >
              Start brief →
            </a>
          </div>
        </div>

        {/* Steps — full-width dividers, gold accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y divide-white/8 sm:divide-y-0 sm:divide-x sm:divide-[var(--color-accent)]/15">
          {HOMEPAGE_PROCESS_CONTENT.steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="flex flex-col justify-between px-8 py-10 first:pl-0 last:pr-0"
            >
              <div>
                <span className="text-[2.75rem] font-[100] leading-none tracking-tight block mb-4 text-[var(--color-accent)] opacity-60">
                  0{index + 1}
                </span>
                <h3 className="text-xl font-medium tracking-tight mb-3 text-white">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-sm leading-relaxed font-light opacity-50">
                    {step.description}
                  </p>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-[0.65rem] font-semibold uppercase tracking-widest">
                  {step.sla}
                </span>
                <span className="px-2.5 py-1 rounded border border-white/10 text-white/30 text-[0.65rem] font-semibold uppercase tracking-widest">
                  {step.deliverable}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

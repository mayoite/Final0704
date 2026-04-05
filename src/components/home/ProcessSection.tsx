"use client";

import { motion } from "framer-motion";
import { HOMEPAGE_PROCESS_CONTENT } from "@/data/site/homepage";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/helpers/motion";

interface ProcessSectionProps {
  embedded?: boolean;
  dark?: boolean;
}

export function ProcessSection({ embedded = false, dark = false }: ProcessSectionProps) {
  const hasDescription = HOMEPAGE_PROCESS_CONTENT.description.trim().length > 0;
  const sectionDescription = hasDescription
    ? HOMEPAGE_PROCESS_CONTENT.description
    : "Four clear phases from brief alignment to after-sales continuity.";
  const content = (
    <>
      <motion.div
        className="mb-8 md:mb-10"
        {...fadeUp(12, 0.02)}
      >
        <div className="min-w-0 text-center md:text-left">
          <h2
            className={`max-w-3xl mx-auto md:mx-0 font-display text-[clamp(2.25rem,4.2vw,3.45rem)] font-[400] leading-[1.04] tracking-[-0.032em] ${
              dark ? "text-inverse" : "text-[var(--text-heading-soft)]"
            }`}
          >
            {HOMEPAGE_PROCESS_CONTENT.titleLead}{" "}
            <span className={dark ? "text-[var(--color-accent)]" : "home-heading__accent"}>{HOMEPAGE_PROCESS_CONTENT.titleAccent}</span>
          </h2>
          <p className={`mt-3 max-w-2xl mx-auto md:mx-0 text-sm leading-relaxed md:text-base ${dark ? "text-[var(--text-inverse-body)]" : "scheme-text-body"}`}>
            {sectionDescription}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
      >
        {HOMEPAGE_PROCESS_CONTENT.steps.map((step, index) => (
          <motion.div
            key={step.title}
            variants={staggerItem}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={dark
              ? "rounded-[1.35rem] border p-5 md:p-6 text-center [border-color:var(--overlay-panel-14)] [background:var(--overlay-panel-08)] backdrop-blur-sm transition-colors hover:[background:var(--overlay-panel-12)]"
              : "home-step-card group text-center"}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className={`text-2xl font-light leading-tight tracking-tight ${dark ? "text-inverse" : "text-strong"}`}>
                {step.title}
              </p>
              <span className={dark ? "text-xs font-semibold tracking-wider text-[var(--text-inverse-subtle)]" : "text-xs font-semibold tracking-wider text-muted"}>
                0{index + 1}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className={dark
                ? "inline-flex w-fit items-center whitespace-nowrap rounded-full border px-3 py-1 text-[0.78rem] font-medium [border-color:var(--border-contrast-accent)] bg-[var(--color-accent)]/12 text-[var(--color-accent)]"
                : "home-chip home-chip--accent"}>{step.sla}</span>
              <span className={dark
                ? "inline-flex w-fit items-center whitespace-nowrap rounded-full border px-3 py-1 text-[0.78rem] font-medium [border-color:var(--overlay-panel-14)] [background:var(--overlay-panel-10)] text-[var(--text-inverse-body)]"
                : "home-step-card__meta"}>{step.deliverable}</span>
            </div>
            {step.description ? (
              <p className={`mt-4 text-sm leading-relaxed ${dark ? "text-[var(--text-inverse-muted)]" : "text-muted"}`}>
                {step.description}
              </p>
            ) : null}
          </motion.div>
        ))}
      </motion.div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="home-section home-section--sand py-10 md:py-12">
      <div className="home-shell">
        <div className="home-frame home-frame--standard">
          {content}
        </div>
      </div>
    </section>
  );
}


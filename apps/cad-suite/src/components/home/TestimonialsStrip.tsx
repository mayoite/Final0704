"use client";

import { motion } from "framer-motion";
import { HOMEPAGE_TESTIMONIALS_CONTENT } from "@/data/site/homepage";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/helpers/motion";

export function TestimonialsStrip() {
  return (
    <section className="home-section home-section--soft border-t border-b border-theme-soft py-10 md:py-14">
      <div className="home-shell">
        <div className="home-frame home-frame--standard">
          <motion.div className="mb-8 md:mb-10" {...fadeUp(14, 0.03)}>
            <h2 className="home-heading">
              {HOMEPAGE_TESTIMONIALS_CONTENT.titleLead}{" "}
              <span className="home-heading__accent">
                {HOMEPAGE_TESTIMONIALS_CONTENT.titleAccent}
              </span>
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.16 }}
          >
            {HOMEPAGE_TESTIMONIALS_CONTENT.items.map((item) => (
              <motion.blockquote
                key={item.org}
                variants={staggerItem}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="flex h-full flex-col gap-5 rounded-xl border border-[var(--border-muted)] bg-panel p-7 shadow-[0_8px_32px_-16px_var(--overlay-inverse-12)]"
              >
                <p className="text-base leading-relaxed text-body">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-auto">
                  <p className="text-xs text-muted">{item.org}</p>
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}



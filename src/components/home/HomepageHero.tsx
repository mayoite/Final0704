"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { HOMEPAGE_HERO_CONTENT } from "@/data/site/homepage";
import { MOTION_EASE } from "@/lib/helpers/motion";
import { normalizeImageSource } from "@/lib/helpers/images";

const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.18,
    },
  },
};

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      ease: MOTION_EASE,
    },
  },
};

export function HomepageHero() {
  const hasDescription = HOMEPAGE_HERO_CONTENT.description.trim().length > 0;
  const titleLines = HOMEPAGE_HERO_CONTENT.title.filter((line) => line.trim().length > 0);
  const heroImage = normalizeImageSource("/images/hero/titan-patna-hq.webp");

  function openGuidedPlanner() {
    window.dispatchEvent(new CustomEvent("oando-assistant:open"));
  }

  return (
    <section
      id="home-hero"
      className="relative min-h-[74vh] w-full overflow-hidden bg-inverse pt-24 md:min-h-[90vh] md:pt-28"
    >
      <div className="absolute inset-0 relative">
        <Image
          src={heroImage}
          alt="Ergonomic seating and workstations installed at Titan Patna HQ by One&Only"
          fill
          priority
          sizes="100vw"
          className="animate-hero-pan object-cover object-[62%_center] md:object-[58%_42%]"
        />
        <div className="absolute inset-0 surface-overlay-24 md:bg-[color:var(--overlay-inverse-18)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 surface-overlay-inverse-12" />
      </div>

      <div className="container relative z-10 flex min-h-[calc(74vh-5rem)] items-center px-4 py-12 sm:px-6 md:min-h-[calc(90vh-5rem)] md:py-16">
        <div className="w-full text-left">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
            className="max-w-[42rem]"
          >
            <motion.p
              variants={heroItemVariants}
              className="mb-4 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-inverse-muted)] [text-shadow:0_1px_6px_var(--overlay-inverse-24)]"
            >
              {HOMEPAGE_HERO_CONTENT.eyebrow}
            </motion.p>
            <motion.h1
              variants={heroItemVariants}
              className="mb-5 max-w-[11ch] font-display text-[clamp(3.3rem,12vw,5.6rem)] font-[300] leading-[0.88] tracking-[-0.05em] text-[var(--text-inverse)] [text-shadow:0_2px_14px_var(--overlay-inverse-18)] md:mb-6"
            >
              {titleLines.map((line) => (
                <span key={line} className="block md:whitespace-nowrap">
                  {line}
                </span>
              ))}
            </motion.h1>
            {hasDescription ? (
              <motion.p variants={heroItemVariants} className="typ-lead scheme-text-inverse-body mb-8 max-w-2xl md:mb-10">
                {HOMEPAGE_HERO_CONTENT.description}
              </motion.p>
            ) : null}
            <motion.div variants={heroItemVariants} className="home-actions">
              <motion.button
                type="button"
                onClick={openGuidedPlanner}
                className="btn-hero-primary"
                whileHover={{ y: -1.5 }}
                whileTap={{ y: 0 }}
              >
                {HOMEPAGE_HERO_CONTENT.primaryCta.label}
              </motion.button>
              <motion.div whileHover={{ y: -1.5 }} whileTap={{ y: 0 }}>
                <Link
                href={HOMEPAGE_HERO_CONTENT.secondaryCta.href}
                className="btn-hero-secondary"
                >
                  {HOMEPAGE_HERO_CONTENT.secondaryCta.label}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



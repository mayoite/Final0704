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
  const heroTitleWords = ["Work.", "Space.", "Performance."] as const;
  const heroImage = normalizeImageSource("/images/hero/titan-patna-hq.webp");

  return (
    <section
      id="home-hero"
      className="relative min-h-[72vh] w-full overflow-hidden bg-inverse pt-20 md:min-h-[78vh] md:pt-24"
    >
      <div className="absolute inset-0 h-full w-full">
        <div className="relative h-full w-full">
          <Image
            src={heroImage}
            alt="Ergonomic seating and workstations installed at Titan Patna HQ by One&Only"
            fill
            priority
            sizes="100vw"
            className="animate-hero-pan scale-[1.03] object-cover object-[68%_52%] md:scale-[1.02] md:object-[64%_48%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(102deg,rgba(8,12,20,0.82)_0%,rgba(8,12,20,0.68)_30%,rgba(8,12,20,0.34)_58%,rgba(8,12,20,0.14)_78%,rgba(8,12,20,0.06)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/58 via-black/20 to-transparent" />
        </div>
      </div>

      <div className="container relative z-10 flex min-h-[calc(72vh-5rem)] items-center px-6 py-12 2xl:px-0 md:min-h-[calc(78vh-5rem)] md:py-16">
        <div className="w-full text-left">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
            className="max-w-4xl space-y-6 md:space-y-8"
          >
            <div className="relative w-full overflow-hidden">
              <motion.h1
                variants={heroItemVariants}
                className="max-w-[10ch] text-white text-[clamp(2.25rem,9.8vw,3.55rem)] font-[200] leading-[1.02] tracking-[-0.055em] md:text-[clamp(3.55rem,6.2vw,4.85rem)] md:font-[270] md:leading-[1.04] md:tracking-[-0.05em]"
              >
                {heroTitleWords.map((word) => (
                  <span key={word} className="block">
                    {word}
                  </span>
                ))}
              </motion.h1>
            </div>
            <div className="relative w-full overflow-hidden">
              <motion.div variants={heroItemVariants} className="home-actions">
                  <motion.div whileHover={{ y: -1.5 }} whileTap={{ y: 0 }}>
                    <Link
                      href={HOMEPAGE_HERO_CONTENT.primaryCta.href}
                      className="btn-hero-primary"
                    >
                      {HOMEPAGE_HERO_CONTENT.primaryCta.label}
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -1.5 }} whileTap={{ y: 0 }}>
                    <Link
                      href={HOMEPAGE_HERO_CONTENT.secondaryCta.href}
                      className="btn-hero-secondary"
                    >
                      {HOMEPAGE_HERO_CONTENT.secondaryCta.label}
                    </Link>
                  </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

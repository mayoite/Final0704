"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

import { HOMEPAGE_HERO_CONTENT } from "@/data/site/homepage";
import { MOTION_EASE } from "@/lib/helpers/motion";
import { normalizeImageSource } from "@/lib/helpers/images";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
};

const wordVariants: Variants = {
  hidden: { y: "105%", opacity: 0, rotate: 3 },
  visible: {
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.9, ease: MOTION_EASE },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: MOTION_EASE } },
};

export function HomepageHero() {
  const heroTitleWords = ["Work.", "Space.", "Performance."] as const;
  const heroImage = normalizeImageSource("/images/hero/titan-patna-hq.webp");

  return (
    <section
      id="home-hero"
      className="relative min-h-[78vh] w-full overflow-hidden bg-inverse pt-20 md:min-h-[85vh] md:pt-24"
    >
      {/* Background image — CSS parallax via transform */}
      <motion.div
        className="absolute inset-0 h-[115%] w-full -top-[7%] origin-center"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      >
        <Image
          src={heroImage}
          alt="Ergonomic seating and workstations installed at Titan Patna HQ by One&Only"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_52%] md:object-[64%_48%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="container relative z-10 flex min-h-[calc(78vh-5rem)] items-center px-6 py-12 2xl:px-0 md:min-h-[calc(85vh-5rem)] md:py-16">
        <motion.div
          className="max-w-4xl w-full space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Staggered word reveal */}
          <h1 className="max-w-[10ch] text-white text-[clamp(2.35rem,9.8vw,3.65rem)] font-[200] leading-[1.02] tracking-[-0.055em] md:text-[clamp(3.65rem,6.2vw,4.95rem)] md:font-[270] md:leading-[1.04] md:tracking-[-0.05em]">
            {heroTitleWords.map((word) => (
              <span key={word} className="block overflow-hidden">
                <motion.span className="inline-block" variants={wordVariants}>
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* CTA Buttons */}
          <motion.div variants={fadeUpVariants} className="home-actions">
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={HOMEPAGE_HERO_CONTENT.primaryCta.href}
                className="btn-hero-primary shadow-theme-panel"
              >
                {HOMEPAGE_HERO_CONTENT.primaryCta.label}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={HOMEPAGE_HERO_CONTENT.secondaryCta.href}
                className="btn-hero-secondary shadow-theme-panel"
              >
                {HOMEPAGE_HERO_CONTENT.secondaryCta.label}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

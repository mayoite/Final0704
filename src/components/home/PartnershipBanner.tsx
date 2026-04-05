"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { HOMEPAGE_PARTNERSHIP_CONTENT } from "@/data/site/homepage";
import { fadeUp } from "@/lib/helpers/motion";

export function PartnershipBanner() {
  return (
    <section className="home-section home-section--white py-10 md:py-12">
      <div className="home-shell">
        <div className="home-frame home-frame--roomy flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <motion.div className="shrink-0 md:pl-2" {...fadeUp(14, 0.03)}>
            <Image
              src={HOMEPAGE_PARTNERSHIP_CONTENT.image.src}
              alt={HOMEPAGE_PARTNERSHIP_CONTENT.image.alt}
              width={224}
              height={153}
              sizes="(max-width: 768px) 154px, 224px"
              quality={100}
              className="h-auto w-[154px] md:w-[224px]"
            />
          </motion.div>

          <motion.div className="max-w-2xl" {...fadeUp(18, 0.08)}>
            <h2 className="home-heading mb-4">
              {HOMEPAGE_PARTNERSHIP_CONTENT.title[0]}{" "}
              <span className="home-heading__accent">
                {HOMEPAGE_PARTNERSHIP_CONTENT.title[1]}
              </span>
            </h2>
            <p className="scheme-text-body mb-6 max-w-lg text-base">
              {HOMEPAGE_PARTNERSHIP_CONTENT.description}
            </p>
            <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
              <Link href={HOMEPAGE_PARTNERSHIP_CONTENT.cta.href} className="link-arrow typ-label">
              {HOMEPAGE_PARTNERSHIP_CONTENT.cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

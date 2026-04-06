"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HOMEPAGE_PARTNERSHIP_CONTENT } from "@/data/site/homepage";
import { fadeUp } from "@/lib/helpers/motion";

export function PartnershipBanner() {
  return (
    <section className="home-section home-section--white -mt-3 py-7 md:-mt-4 md:py-9">
      <div className="home-shell">
        <div className="home-frame flex flex-col items-start justify-between gap-4 px-4 py-3 md:flex-row md:items-center md:px-5 md:py-4">
          <motion.div className="shrink-0 md:pl-2" {...fadeUp(14, 0.03)}>
            <Image
              src={HOMEPAGE_PARTNERSHIP_CONTENT.image.src}
              alt={HOMEPAGE_PARTNERSHIP_CONTENT.image.alt}
              width={224}
              height={153}
              sizes="(max-width: 768px) 154px, 224px"
              quality={100}
              className="h-auto w-[108px] md:w-[158px]"
            />
          </motion.div>

          <motion.div className="max-w-2xl" {...fadeUp(18, 0.08)}>
            <h2 className="home-heading mb-4">
              {HOMEPAGE_PARTNERSHIP_CONTENT.title[0]}{" "}
              <span className="home-heading__accent">
                {HOMEPAGE_PARTNERSHIP_CONTENT.title[1]}
              </span>
            </h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

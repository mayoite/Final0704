"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { HOMEPAGE_COLLECTIONS_CONTENT } from "@/data/site/homepage";
import { fadeUp } from "@/lib/helpers/motion";

import "swiper/css";
import "swiper/css/navigation";

export function Collections() {
  return (
    <section className="home-section--soft border-t border-b border-theme-soft py-10 md:py-12">
      <div className="home-shell">
        <div className="home-frame home-frame--standard">
          <motion.div
            className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between"
            {...fadeUp(14, 0.03)}
          >
            <div className="max-w-3xl">
              <h2 className="home-heading">
                {HOMEPAGE_COLLECTIONS_CONTENT.titleLead}{" "}
                <span className="home-heading__accent">
                  {HOMEPAGE_COLLECTIONS_CONTENT.titleAccent}
                </span>
              </h2>
            </div>

            <div className="flex gap-4">
              <motion.button
                aria-label="Previous slide"
                className="swiper-button-prev-custom inline-flex h-12 w-12 items-center justify-center rounded-full border border-soft bg-panel text-body transition-all hover:border-strong hover:bg-inverse hover:text-inverse disabled:opacity-50"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                aria-label="Next slide"
                className="swiper-button-next-custom inline-flex h-12 w-12 items-center justify-center rounded-full border border-soft bg-panel text-body transition-all hover:border-strong hover:bg-inverse hover:text-inverse disabled:opacity-50"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div {...fadeUp(18, 0.08)}>
            <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="pb-4"
          >
            {HOMEPAGE_COLLECTIONS_CONTENT.items.map((item) => (
              <SwiperSlide key={item.name}>
                <Link
                  href={item.href}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-huge border border-soft bg-hover"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 surface-overlay-24 opacity-76 transition-opacity duration-500 group-hover:opacity-82" />

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 md:p-7">
                    <h3 className="text-xl font-light text-inverse md:text-2xl">
                      {item.name}
                    </h3>
                    <div
                      aria-hidden="true"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--surface-panel-strong)] text-[1.35rem] leading-none text-strong transition-all duration-300 group-hover:translate-x-0.5"
                    >
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



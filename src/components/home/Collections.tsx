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
            className="mb-8 flex items-end justify-between gap-6"
            {...fadeUp(14, 0.03)}
          >
            <div className="max-w-2xl">
              <h2 className="typ-section-title text-strong">
                Browse by workspace need.
              </h2>
            </div>

            <div className="hidden items-center gap-4 sm:flex shrink-0">
              <motion.button
                aria-label="Previous slide"
                className="swiper-button-prev-custom inline-flex h-12 w-12 items-center justify-center rounded-full border border-soft text-body hover:border-strong hover:bg-hover disabled:cursor-not-allowed disabled:opacity-20 transition-all duration-300"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                aria-label="Next slide"
                className="swiper-button-next-custom inline-flex h-12 w-12 items-center justify-center rounded-full border border-soft text-body hover:border-strong hover:bg-hover disabled:cursor-not-allowed disabled:opacity-20 transition-all duration-300"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <Link
                href="/products"
                className="ml-4 text-sm font-medium tracking-tight border-b border-transparent pb-0.5 transition-all text-muted hover:text-strong hover:border-strong flex items-center gap-1.5"
              >
                Browse full catalog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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



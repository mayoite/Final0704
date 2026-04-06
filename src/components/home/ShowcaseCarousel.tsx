"use client";

import { type KeyboardEvent, useCallback, useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselItem {
  id: string;
  name: string;
  label: string;
  image: string;
  link: string;
  description?: string;
}

interface ShowcaseCarouselProps {
  sectionLabel: string;
  sectionTitle: ReactNode;
  items: CarouselItem[];
  browseLink?: string;
  browseLabel?: string;
  className?: string;
  dark?: boolean;
}

export function ShowcaseCarousel({
  sectionLabel,
  sectionTitle,
  items,
  browseLink,
  browseLabel = "Browse all",
  className = "",
  dark = false
}: ShowcaseCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    const frameId = window.requestAnimationFrame(onSelect);
    return () => {
      window.cancelAnimationFrame(frameId);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!emblaApi) return;
    if (event.key === "ArrowLeft") {
        event.preventDefault();
        emblaApi.scrollPrev();
    }
    if (event.key === "ArrowRight") {
        event.preventDefault();
        emblaApi.scrollNext();
    }
  }

  return (
    <section className={`w-full py-12 md:py-20 overflow-hidden ${dark ? "bg-inverse" : "bg-[var(--surface-page)]"} ${className}`} aria-label={sectionLabel}>
      <div className="container px-6 2xl:px-0">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className={`typ-section-title ${dark ? "text-inverse" : "text-strong"}`}>{sectionTitle}</h2>
          </div>
          <div className="hidden items-center gap-4 sm:flex shrink-0">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${dark 
                ? "border-white/10 text-white hover:border-white hover:bg-white/5" 
                : "border-soft text-body hover:border-strong hover:bg-hover"} 
                disabled:cursor-not-allowed disabled:opacity-20`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${dark 
                ? "border-white/10 text-white hover:border-white hover:bg-white/5" 
                : "border-soft text-body hover:border-strong hover:bg-hover"} 
                disabled:cursor-not-allowed disabled:opacity-20`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {browseLink && (
              <Link
                href={browseLink}
                className={`ml-4 text-sm font-medium tracking-tight border-b border-transparent pb-0.5 transition-all flex items-center gap-1.5 ${dark ? "text-white/80 hover:text-white" : "text-muted hover:text-strong hover:border-strong"}`}
              >
                {browseLabel} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        <div
          ref={emblaRef}
          className="overflow-hidden"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="flex">
            {items.map((item) => (
              <div key={item.id} className="min-w-0 flex-[0_0_100%] pr-4 md:flex-[0_0_45%] lg:flex-[0_0_35%] md:pr-8">
                <Link
                  href={item.link}
                  className="group relative block overflow-hidden rounded-blob bg-soft focus-visible:outline-none"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.08] group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 p-8 transform transition-transform duration-500 group-hover:-translate-y-2">

                      <h3 className="text-2xl font-light tracking-tight text-white">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-white/50 mt-3 line-clamp-2 opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">{item.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-3">
            {items.length > 5 ? (
               <div className={`text-xs font-mono ${dark ? "text-white/40" : "text-muted"}`}>
                 {selectedIndex + 1} / {items.length}
               </div>
            ) : items.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  selectedIndex === index 
                    ? (dark ? "w-8 bg-primary" : "w-8 bg-strong") 
                    : (dark ? "bg-white/20" : "bg-soft")
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4">
             <button
               type="button"
               onClick={() => emblaApi?.scrollPrev()}
               disabled={!canScrollPrev}
               className={`h-10 w-10 flex items-center justify-center rounded-full border ${dark ? "border-white/10 text-white" : "border-soft text-body"}`}
             >
               <ChevronLeft className="h-4 w-4" />
             </button>
             <button
               type="button"
               onClick={() => emblaApi?.scrollNext()}
               disabled={!canScrollNext}
               className={`h-10 w-10 flex items-center justify-center rounded-full border ${dark ? "border-white/10 text-white" : "border-soft text-body"}`}
             >
               <ChevronRight className="h-4 w-4" />
             </button>
          </div>
        </div>
      </div>
    </section>
  );
}

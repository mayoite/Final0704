"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";

import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

interface VideoSectionProps {
  videoSrc?: string;
  posterSrc?: string;
  images?: string[];
  title: ReactNode;
  description: string;
  lightMode?: boolean; // If true, use dark text on light background, else white text on dark/video
  buttonText?: string;
  buttonLink?: string;
}

export function VideoSection({
  videoSrc,
  posterSrc,
  images,
  title,
  description,
  lightMode = false,
  buttonText = "Discover More",
  buttonLink = "/products",
}: VideoSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const montageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      Fancybox.bind(container, "[data-fancybox]", {});
    }

    // GSAP Montage Slideshow
    if (images && images.length > 0 && montageRef.current) {
      const items = montageRef.current.querySelectorAll(".montage-item");
      if (items.length > 0) {
        // Initial state for all items
        gsap.set(items, { opacity: 0, scale: 1.1 });
        
        const tl = gsap.timeline({ repeat: -1 });
        
        items.forEach((item) => {
          // Crossroads fade
          tl.to(item, {
            opacity: 1,
            scale: 1,
            duration: 2.5,
            ease: "power2.inOut"
          })
          .to(item, {
            scale: 1.05,
            duration: 4,
            ease: "none"
          }, "-=0.5")
          .to(item, {
            opacity: 0,
            duration: 2,
            ease: "power2.inOut"
          }, "-=1.5");
        });
      }
    }

    return () => {
      if (container) {
        Fancybox.unbind(container);
        Fancybox.close();
      }
    };
  }, [images]);

  return (
    <section
      ref={containerRef}
      className={`relative w-full py-16 md:py-28 overflow-hidden ${lightMode ? "bg-hover" : "bg-inverse"}`}
    >
      {/* Background Montage or Video */}
      <div className="absolute inset-0 z-0">
        {images && images.length > 0 ? (
          <div ref={montageRef} className="relative w-full h-full bg-black">
            {images.map((src, i) => (
              <div 
                key={src} 
                className="montage-item absolute inset-0 w-full h-full opacity-0"
              >
                <Image
                  src={src}
                  alt={`Project execution showcase ${i + 1}`}
                  fill
                  priority={i === 0}
                  className="object-cover opacity-60"
                />
              </div>
            ))}
          </div>
        ) : videoSrc ? (
          <>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-60 pointer-events-none"
              poster={posterSrc}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>

            {/* Lightbox Trigger Overlay */}
            <a
              href={videoSrc}
              data-fancybox
              className="absolute inset-0 z-20 flex items-center justify-center group cursor-pointer"
              aria-label="Play Video"
            >
              <div
                className={`w-20 h-20 flex items-center justify-center rounded-full border-2 transition-all duration-300 transform group-hover:scale-110 ${lightMode ? "border-strong bg-panel/20 hover:bg-inverse text-strong hover:text-inverse" : "border-inverse bg-panel/20 hover:bg-panel text-inverse hover:text-strong"}`}
              >
                <Play className="w-8 h-8 fill-current" />
              </div>
            </a>
          </>
        ) : posterSrc ? (
          <Image
            src={posterSrc}
            alt="Workspace background"
            fill
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div
            className={`w-full h-full ${lightMode ? "bg-soft" : "bg-inverse"} animate-pulse`}
          />
        )}
        <div
          className={`absolute inset-0 ${lightMode ? "bg-panel/40" : "bg-gradient-to-b from-black/20 via-black/40 to-black/80"}`}
        />
      </div>

      <div className="container relative z-10 px-6 2xl:px-0 h-full flex flex-col justify-center pointer-events-none">
        <div className="max-w-4xl space-y-8 pointer-events-auto">
          <h2
            className={`text-[clamp(1.75rem,5vw,3rem)] font-light leading-[1.05] tracking-tight text-balance ${lightMode ? "text-strong" : "text-white"}`}
          >
            {title}
          </h2>
          <p
            className={`text-lg font-light leading-relaxed max-w-2xl ${lightMode ? "text-body" : "text-gray-300"}`}
          >
            {description}
          </p>

          <div className="pt-8">
            <Link
              href={buttonLink}
              className={`group inline-flex items-center gap-6 pb-2 border-b-2 transition-all ${lightMode
                  ? "text-strong border-strong hover:text-primary hover:border-primary"
                  : "text-white border-white/20 hover:border-white"
                }`}
            >
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                {buttonText}
              </span>
              <span className="text-xl transition-transform group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

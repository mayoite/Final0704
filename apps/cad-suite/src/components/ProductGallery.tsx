"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && images.length < 5) {
      console.warn(
        "ProductGallery: Fewer than 5 images provided for product:",
        productName,
      );
    }
  }, [images, productName]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    },
    [images.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const fallbackImg = "/images/products/imported/fluid/image-1.webp";

  // Ensure selectedIndex is valid (e.g. if images array changes)
  const safeIndex = selectedIndex >= images.length ? 0 : selectedIndex;
  const currentImage = images[safeIndex] || fallbackImg;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4 w-full h-full">
      {/* Thumbnails */}
      <div className="order-2 md:order-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto scrollbar-hide px-6 md:px-0 py-2 md:py-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={clsx(
              "shrink-0 w-16 h-16 md:w-20 md:h-20 bg-hover rounded-sm overflow-hidden border-2 transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-inverse focus-visible:ring-offset-2",
              safeIndex === idx
                ? "border-inverse opacity-100"
                : "border-transparent opacity-60 hover:opacity-100 hover:border-muted",
            )}
            title={`View ${productName} image ${idx + 1}`}
          >
            <Image
              src={img}
              alt={`${productName} product photo ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 18vw, 80px"
              style={{ objectFit: "contain" }}
              className="p-1"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="order-1 md:order-2 relative bg-hover w-full min-h-[50vw] md:min-h-125 lg:min-h-0 flex-1 flex items-center justify-center p-4">
        <Image
          src={currentImage}
          alt={`Primary product photo of ${productName}`}
          fill
          sizes="(max-width: 768px) 100vw, 70vw"
          style={{ objectFit: "contain" }}
          className="p-8 lg:p-16 transition-opacity duration-500"
        />

        {/* Image count badge */}
        {images.length > 0 && (
          <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-full border border-soft surface-overlay-92 px-3 py-1 text-sm font-bold tracking-widest text-strong shadow-sm backdrop-blur">
            {safeIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}


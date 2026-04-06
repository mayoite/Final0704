"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import {
  getBlurPlaceholder,
  getImageSizes,
  getPriorityImageProps,
  normalizeImageSource,
} from "@/lib/helpers/images";

interface SafeImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/images/products/60x30-workstation-1.webp",
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const normalizedSrc = normalizeImageSource(src);
  const normalizedFallbackSrc = normalizeImageSource(fallbackSrc);
  const imgSrc = error || !normalizedSrc ? normalizedFallbackSrc : normalizedSrc;
  const priorityProps = getPriorityImageProps(0, Boolean(props.priority));

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      sizes={props.sizes ?? getImageSizes("product")}
      placeholder={props.placeholder ?? "blur"}
      blurDataURL={props.blurDataURL ?? getBlurPlaceholder()}
      priority={priorityProps.priority}
      loading={props.loading ?? priorityProps.loading}
      fetchPriority={props.fetchPriority ?? priorityProps.fetchPriority}
      onError={() => setError(true)}
    />
  );
}

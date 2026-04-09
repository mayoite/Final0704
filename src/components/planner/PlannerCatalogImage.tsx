"use client";

import { useState } from "react";
import Image from "next/image";
import { Archive, Armchair, Table2 } from "lucide-react";

import { PlannerCatalogItem } from "./types";
import {
  getCatalogImageSrc,
  getCatalogPlaceholderTone,
  getCategoryIconKey,
} from "./utils";

const ICONS = {
  archive: Archive,
  armchair: Armchair,
  table: Table2,
} as const;

type PlannerCatalogImageProps = {
  item: PlannerCatalogItem;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function PlannerCatalogImage({
  item,
  alt,
  sizes,
  priority = false,
  className,
}: PlannerCatalogImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = imageFailed ? null : getCatalogImageSrc(item);
  const Icon = ICONS[getCategoryIconKey(item.categoryLabel ?? item.category)];
  const tone = getCatalogPlaceholderTone(item);

  if (!src) {
    return (
      <div
        className={[
          "flex h-full w-full flex-col items-center justify-center gap-3 text-center",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background: "var(--planner-catalog-placeholder-bg)",
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 24%, white)`,
        }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-inverse shadow-[var(--planner-shadow-soft)]"
          style={{
            background: `linear-gradient(135deg, ${tone}, color-mix(in srgb, ${tone} 60%, var(--text-heading)))`,
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="px-4">
          <p className="text-sm font-semibold text-[var(--text-heading)]">{item.name}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Planner placeholder
          </p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setImageFailed(true)}
    />
  );
}

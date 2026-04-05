"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useQuoteCart } from "@/lib/store/quoteCart";

interface CompareColumnActionsProps {
  productName: string;
  productHref: string;
  productImage?: string;
  viewLabel: string;
  addLabel: string;
}

export function CompareColumnActions({
  productName,
  productHref,
  productImage,
  viewLabel,
  addLabel,
}: CompareColumnActionsProps) {
  const addItem = useQuoteCart((state) => state.addItem);

  return (
    <div className="mt-4 grid gap-2">
      <Link
        href={productHref}
        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-soft px-3 text-sm font-medium text-strong transition-colors hover:border-inverse"
      >
        {viewLabel}
      </Link>
      <button
        type="button"
        onClick={() =>
          addItem({
            id: `quote-${productHref.split("/").filter(Boolean).pop() || productName}`,
            name: productName,
            image: productImage,
            href: productHref,
          })
        }
        aria-label={`Add to quote cart ${productName}`}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-inverse transition-colors hover:bg-primary-hover"
      >
        <MessageSquare className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}


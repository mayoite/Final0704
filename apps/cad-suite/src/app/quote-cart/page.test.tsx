import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import QuoteCartPage from "./page";

const quoteCartState = {
  items: [] as Array<{
    id: string;
    name: string;
    qty: number;
    price?: number;
    source: "planner" | "catalog";
    plannerFamily?: string;
    plannerDimensions?: string;
  }>,
  totalQty: 0,
  setQty: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
};

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/store/quoteCart", () => ({
  useQuoteCart: (selector: (state: typeof quoteCartState) => unknown) => selector(quoteCartState),
}));

describe("QuoteCartPage", () => {
  it("renders enquiry-focused copy without visible prices", () => {
    quoteCartState.items = [
      {
        id: "desk-1",
        name: "Desk",
        qty: 3,
        price: 52000,
        source: "planner",
        plannerFamily: "Focus",
        plannerDimensions: "1600 x 800 x 750 mm",
      },
    ];
    quoteCartState.totalQty = 3;

    render(<QuoteCartPage />);

    expect(screen.getByText("BOQ Enquiry")).toBeDefined();
    expect(screen.getByText("BOQ Summary")).toBeDefined();
    expect(screen.getByText(/total quantity:/i)).toBeDefined();
    expect(screen.queryByText(/unit price/i)).toBeNull();
    expect(screen.queryByText(/line total/i)).toBeNull();
    expect(screen.queryByText(/total price/i)).toBeNull();
    expect(screen.queryByText(/INR/i)).toBeNull();
  });
});

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SmartdrawPlanner } from "./SmartdrawPlanner";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/store/quoteCart", () => ({
  useQuoteCart: () => ({
    addItem: vi.fn(),
    clearCart: vi.fn(),
  }),
}));

vi.mock("../../features/planner/ui/PlannerCanvas", () => ({
  PlannerCanvas: () => <div data-testid="planner-canvas" />,
}));

// Mock only the helper APIs this test touches; keep the real module exports intact.
vi.mock("tldraw", async (importOriginal) => {
  const actual = await importOriginal<typeof import("tldraw")>();

  return {
    ...actual,
    createShapeId: (id?: string) => (typeof id === "string" ? id : "shape-id"),
    AssetRecordType: { createId: vi.fn(() => "asset-1") },
    getIndices: (count: number) => Array.from({ length: count }, (_, index) => `index-${index}`),
    toRichText: (value: string) => value,
  };
});

describe("SmartdrawPlanner", () => {
  it("renders the planner shell", () => {
    render(<SmartdrawPlanner catalogProducts={[]} />);

    const section = document.querySelector("section");
    expect(section).toBeDefined();
    expect(section?.className).toContain("fixed inset-0");
  });

  it("starts in room shell mode with later steps gated", () => {
    render(<SmartdrawPlanner catalogProducts={[]} />);

    expect(screen.getByRole("button", { name: /^Space$/i })).toHaveAttribute("aria-current", "step");
    expect((screen.getByRole("button", { name: /^Catalog$/i }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /^Measure$/i }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /^Review$/i }) as HTMLButtonElement).disabled).toBe(true);
  });
});

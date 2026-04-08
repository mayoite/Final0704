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
  }),
}));

// Mock Tldraw as it's a heavy canvas component
vi.mock("tldraw", () => ({
  Tldraw: ({
    children,
    onMount,
  }: {
    children?: React.ReactNode;
    onMount?: (editor: object) => void;
  }) => {
    React.useEffect(() => {
      const mockEditor = {
        updateInstanceState: vi.fn(),
        user: { updateUserPreferences: vi.fn() },
        setCurrentTool: vi.fn(),
        setStyleForNextShapes: vi.fn(),
        getSelectedShapeIds: vi.fn(() => []),
        canUndo: vi.fn(() => false),
        canRedo: vi.fn(() => false),
        getShape: vi.fn(() => ({ id: "room-boundary" })),
        createShape: vi.fn(),
        getShapePageBounds: vi.fn(() => ({ minX: 0, minY: 0, maxX: 100, maxY: 100 })),
        zoomToBounds: vi.fn(),
        zoomToSelection: vi.fn(),
        getCamera: vi.fn(() => ({ z: 1 })),
        store: { listen: vi.fn(() => vi.fn()) },
        getCurrentPageShapes: vi.fn(() => []),
        getCurrentPageShapesSorted: vi.fn(() => []),
        getViewportPageBounds: vi.fn(() => ({ center: { x: 0, y: 0 } })),
        createAssets: vi.fn(),
        setCamera: vi.fn(),
        deleteShapes: vi.fn(),
        pageToViewport: vi.fn(({ x, y }) => ({ x, y })),
        select: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        zoomToFit: vi.fn(),
        duplicateShapes: vi.fn(),
      };

      onMount?.(mockEditor);
    }, [onMount]);

    return <div data-testid="tldraw-canvas">{children}</div>;
  },
  createShapeId: (id: string) => id,
  AssetRecordType: { createId: vi.fn(() => "asset-1") },
  Editor: class {},
}));

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

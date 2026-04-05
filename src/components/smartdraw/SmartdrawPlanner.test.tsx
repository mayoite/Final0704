import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SmartdrawPlanner } from "./SmartdrawPlanner";

// Mock Tldraw as it's a heavy canvas component
vi.mock("tldraw", () => ({
  Tldraw: ({ children }: any) => <div data-testid="tldraw-canvas">{children}</div>,
  createShapeId: (id: string) => id,
  useEditor: () => ({
    store: {
      listen: vi.fn(),
    },
    getShapePageBounds: vi.fn(),
  }),
}));

describe("SmartdrawPlanner", () => {
  it("renders the loading state or canvas", () => {
    render(<SmartdrawPlanner catalogProducts={[]} />);
    // Check if the main container is present
    const section = document.querySelector("section");
    expect(section).toBeDefined();
    expect(section?.className).toContain("fixed inset-0");
  });

  it("shows common tool headings", () => {
    render(<SmartdrawPlanner catalogProducts={[]} />);
    // Verify toolbar items (using text snippets from the component)
    expect(screen.getByText(/SmartDraw/i)).toBeDefined();
  });
});

import { describe, expect, it } from "vitest";

import type { BoqItem } from "../../../components/draw/types";

import {
  buildPlannerQuoteCartItems,
  calculatePlannerBoqTotal,
  groupPlannerBoqItems,
} from "./quoteBridge";

describe("planner quote bridge", () => {
  const boqItems: BoqItem[] = [
    {
      id: "shape-1",
      productId: "prod-1",
      productSlug: "alpha-desk",
      plannerSourceSlug: "alpha-desk",
      name: "Alpha Desk",
      category: "Desks",
      price: 45000,
      imageUrl: "/desk.png",
      dimensions: "1600 x 800 x 750 mm",
    },
    {
      id: "shape-2",
      productId: "prod-1",
      productSlug: "alpha-desk",
      plannerSourceSlug: "alpha-desk",
      name: "Alpha Desk",
      category: "Desks",
      price: 45000,
      imageUrl: "/desk.png",
      dimensions: "1600 x 800 x 750 mm",
    },
    {
      id: "shape-3",
      productId: "prod-2",
      productSlug: "task-chair",
      plannerSourceSlug: "task-chair",
      name: "Task Chair",
      category: "Seating",
      price: 16000,
      imageUrl: "/chair.png",
      dimensions: "640 x 640 x 980 mm",
    },
  ];

  it("calculates the boq total from raw planner items", () => {
    expect(calculatePlannerBoqTotal(boqItems)).toBe(106000);
  });

  it("groups repeated planner items by stable product identity", () => {
    const grouped = groupPlannerBoqItems(boqItems);

    expect(Object.keys(grouped)).toEqual(["prod-1", "prod-2"]);
    expect(grouped["prod-1"]).toMatchObject({
      name: "Alpha Desk",
      qty: 2,
      dimensions: "1600 x 800 x 750 mm",
    });
    expect(grouped["prod-2"]).toMatchObject({
      name: "Task Chair",
      qty: 1,
      dimensions: "640 x 640 x 980 mm",
    });
  });

  it("builds quote-cart items with grouped quantities and planner dimensions", () => {
    const quoteItems = buildPlannerQuoteCartItems(boqItems);

    expect(quoteItems).toEqual([
      {
        id: "planner-prod-1",
        name: "Alpha Desk",
        qty: 2,
        image: "/desk.png",
        source: "planner",
        plannerFamily: "Desks",
        plannerDimensions: "1600 x 800 x 750 mm",
      },
      {
        id: "planner-prod-2",
        name: "Task Chair",
        qty: 1,
        image: "/chair.png",
        source: "planner",
        plannerFamily: "Seating",
        plannerDimensions: "640 x 640 x 980 mm",
      },
    ]);
  });
});

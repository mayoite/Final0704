import { describe, expect, it } from "vitest";

import {
  formatFeetAndInches,
  formatMeasurementInputValue,
  parseMeasurementInput,
} from "./measurements";

describe("planner measurements", () => {
  it("formats imperial values to the nearest inch", () => {
    expect(formatFeetAndInches(2032)).toBe(`6' 8"`);
  });

  it("round-trips displayed imperial values back to canonical millimeters", () => {
    const formatted = formatMeasurementInputValue(2438, "ft-in");

    expect(formatted).toBe(`8' 0"`);
    expect(parseMeasurementInput(formatted, "ft-in")).toBe(2438);
  });

  it("parses imperial inspector inputs in supported formats", () => {
    expect(parseMeasurementInput(`6' 8"`, "ft-in")).toBe(2032);
    expect(parseMeasurementInput("6 8", "ft-in")).toBe(2032);
    expect(parseMeasurementInput('80"', "ft-in")).toBe(2032);
  });

  it("parses metric inspector inputs and rejects invalid measurements", () => {
    expect(parseMeasurementInput("1,200 mm", "mm")).toBe(1200);
    expect(parseMeasurementInput("0", "mm")).toBeNull();
    expect(parseMeasurementInput("-40", "mm")).toBeNull();
    expect(parseMeasurementInput("desk", "ft-in")).toBeNull();
  });
});

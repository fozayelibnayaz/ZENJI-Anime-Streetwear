import { describe, expect, it } from "vitest";
import { recommendSize, clampMeasurement, cmFromInches, inchesFromCm, FIT_LIMITS } from "@/lib/fit";
import { sizeCharts } from "@/content/sizing";

describe("Fit Lab sizing", () => {
  it("matches a garment that is identical to one of our patterns", () => {
    const medium = sizeCharts.tee.find((spec) => spec.size === "M")!;
    const result = recommendSize({
      chest: medium.chest - 1.5, // "true to ZENJI" adds 1.5cm of room
      length: medium.length,
      preference: "true",
      category: "tee",
    });

    expect(result.recommended).toBe("M");
    expect(result.confidence).toBe("high");
  });

  it("sizes up when the shopper wants it boxier", () => {
    const base = { chest: 54, length: 71, category: "tee" as const };
    const close = recommendSize({ ...base, preference: "tailored" });
    const boxy = recommendSize({ ...base, preference: "oversized" });

    const order = sizeCharts.tee.map((spec) => spec.size);
    expect(order.indexOf(boxy.recommended)).toBeGreaterThan(order.indexOf(close.recommended));
  });

  it("ranks every available size exactly once, best first", () => {
    const result = recommendSize({ chest: 55, length: 70, preference: "true", category: "tee" });

    expect(result.ranked).toHaveLength(sizeCharts.tee.length);
    expect(new Set(result.ranked.map((match) => match.size)).size).toBe(sizeCharts.tee.length);
    for (let i = 1; i < result.ranked.length; i += 1) {
      expect(result.ranked[i].score).toBeGreaterThanOrEqual(result.ranked[i - 1].score);
    }
    expect(result.ranked[0].size).toBe(result.recommended);
  });

  it("uses the hoodie block when asked for a hoodie", () => {
    const result = recommendSize({ chest: 61, length: 70, preference: "true", category: "hoodie" });
    expect(sizeCharts.hoodie.map((spec) => spec.size)).toContain(result.recommended);
    expect(result.ranked).toHaveLength(sizeCharts.hoodie.length);
  });

  it("survives nonsense input instead of returning NaN", () => {
    const result = recommendSize({ chest: Number.NaN, length: 9999, preference: "true", category: "tee" });
    expect(result.recommended).toBeTruthy();
    expect(Number.isNaN(result.boxiness)).toBe(false);
    expect(result.boxiness).toBeGreaterThanOrEqual(0);
    expect(result.boxiness).toBeLessThanOrEqual(100);
  });

  it("clamps measurements to a physically sensible range", () => {
    expect(clampMeasurement(5, "chest")).toBe(FIT_LIMITS.chest.min);
    expect(clampMeasurement(500, "length")).toBe(FIT_LIMITS.length.max);
    expect(clampMeasurement(60, "chest")).toBe(60);
  });

  it("round-trips unit conversion", () => {
    expect(cmFromInches(inchesFromCm(57))).toBeCloseTo(57, 6);
    expect(inchesFromCm(2.54)).toBeCloseTo(1, 6);
  });

  it("describes the difference in plain language", () => {
    const result = recommendSize({ chest: 48, length: 66, preference: "oversized", category: "tee" });
    expect(result.summary).toMatch(/chest/);
    expect(result.summary).toMatch(/Size [A-Z0-9]+/);
  });
});

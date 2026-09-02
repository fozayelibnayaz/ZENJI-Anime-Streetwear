import { describe, expect, it } from "vitest";
import {
  bodyFor,
  frames,
  lookCoverage,
  lookForScenario,
  presentations,
  weatherScenarios,
  cmToPx,
  pxToPct,
  STAGE_W,
  STAGE_H,
} from "@/lib/wardrobe";
import { getProduct } from "@/lib/catalogue";
import type { Category } from "@/content/products";

describe("wardrobe bodies", () => {
  it("gives every frame a valid body with positive measurements", () => {
    for (const presentation of presentations) {
      for (const frame of frames) {
        const body = bodyFor(presentation.id, frame.id);
        expect(body.shoulderCm).toBeGreaterThan(30);
        expect(body.hipCm).toBeGreaterThan(30);
        expect(body.torsoCm).toBeGreaterThan(30);
      }
    }
  });

  it("boxy frames are wider than classic frames on the same presentation", () => {
    const classic = bodyFor("m", "classic");
    const boxy = bodyFor("m", "boxy");
    expect(boxy.shoulderCm).toBeGreaterThan(classic.shoulderCm);
    expect(boxy.hipCm).toBeGreaterThan(classic.hipCm);
  });

  it("feminine frames have narrower shoulders and a longer hip than masculine", () => {
    const f = bodyFor("f", "classic");
    const m = bodyFor("m", "classic");
    expect(f.shoulderCm).toBeLessThan(m.shoulderCm);
    expect(f.hipCm).toBeGreaterThan(m.hipCm);
  });

  it("keeps stage percentages inside the frame", () => {
    expect(pxToPct(150, "x")).toBe(50);
    expect(pxToPct(STAGE_H / 2, "y")).toBe(50);
    expect(pxToPct(0, "x")).toBe(0);
    expect(pxToPct(STAGE_W, "x")).toBe(100);
  });

  it("maps centimetres to pixels at a uniform scale", () => {
    expect(cmToPx(0)).toBe(0);
    expect(cmToPx(10)).toBe(23);
  });
});

describe("weather the drop", () => {
  it("gives every scenario a code, temperature and conditions", () => {
    for (const scenario of weatherScenarios) {
      expect(scenario.id.length).toBeGreaterThan(0);
      expect(scenario.code.length).toBeGreaterThan(0);
      expect(scenario.temp).toMatch(/°$/);
      expect(scenario.conditions.length).toBeGreaterThan(4);
    }
  });

  it("every scenario pick resolves to a real, stocked product", () => {
    for (const scenario of weatherScenarios) {
      for (const slug of scenario.picks) {
        const product = getProduct(slug);
        expect(product, `${scenario.id} → ${slug}`).toBeDefined();
        expect(product!.stock.some((s) => s.units > 0), `${scenario.id} → ${slug} has stock`).toBe(true);
      }
    }
  });

  it("resolves a scenario into worn layers in stack order", () => {
    const layers = lookForScenario(weatherScenarios[0].id);
    expect(layers.length).toBeGreaterThan(0);
    for (const layer of layers) {
      expect(layer.product).toBeDefined();
      expect(layer.size.length).toBeGreaterThan(0);
    }
  });

  it("reports which wardrobe slots a look fills", () => {
    const layers = lookForScenario("scorcher-32");
    const coverage = lookCoverage(layers);
    const tee = coverage.find((entry) => entry.slot === "tee")!;
    const hoodie = coverage.find((entry) => entry.slot === "hoodie")!;
    expect(tee.filled).toBe(true);
    expect(hoodie.filled).toBe(false);
  });

  it("covers at most one garment per slot when stacked", () => {
    const layers = lookForScenario("drizzle-11");
    const slots = new Set<Category>(layers.map((layer) => layer.product.category));
    expect(slots.size).toBe(layers.length);
  });
});

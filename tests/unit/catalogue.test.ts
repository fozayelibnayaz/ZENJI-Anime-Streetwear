import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import {
  availableSizes,
  isSoldOut,
  lowStockSizes,
  priceRange,
  queryCatalogue,
  relatedProducts,
  totalUnits,
  unitsFor,
} from "@/lib/catalogue";

describe("catalogue data", () => {
  it("has unique slugs", () => {
    const slugs = products.map((product) => product.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("never advertises a sale price above the original", () => {
    for (const product of products) {
      if (product.compareAt) expect(product.compareAt).toBeGreaterThan(product.price);
    }
  });

  it("points every product at an image path inside /media", () => {
    for (const product of products) {
      expect(product.images.front).toMatch(/^\/media\/.+\.webp$/);
      if (product.images.back) expect(product.images.back).toMatch(/^\/media\/.+\.webp$/);
    }
  });
});

describe("queryCatalogue", () => {
  it("filters by category", () => {
    const hoodies = queryCatalogue({ categories: ["hoodie"] });
    expect(hoodies.length).toBeGreaterThan(0);
    expect(hoodies.every((product) => product.category === "hoodie")).toBe(true);
  });

  it("filters by size availability, not by size existing", () => {
    const results = queryCatalogue({ sizes: ["2XL"] });
    expect(results.every((product) => availableSizes(product).includes("2XL"))).toBe(true);
  });

  it("combines filters with AND semantics", () => {
    const results = queryCatalogue({ categories: ["tee"], onSaleOnly: true, inStockOnly: true });
    expect(results.every((product) => product.category === "tee" && product.compareAt && !isSoldOut(product))).toBe(
      true,
    );
  });

  it("sorts by price in both directions", () => {
    const asc = queryCatalogue({ sort: "price-asc" }).map((product) => product.price);
    const desc = queryCatalogue({ sort: "price-desc" }).map((product) => product.price);
    expect([...asc].sort((a, b) => a - b)).toEqual(asc);
    expect(desc[0]).toBe(asc[asc.length - 1]);
  });

  it("searches across name, romaji and colourway, ignoring case", () => {
    expect(queryCatalogue({ search: "blue flame" }).map((p) => p.slug)).toContain("blue-flame-tee");
    expect(queryCatalogue({ search: "SOUEN" }).map((p) => p.slug)).toContain("blue-flame-tee");
    expect(queryCatalogue({ search: "cobalt" }).map((p) => p.slug)).toContain("blue-flame-tee");
  });

  it("requires every search word to match", () => {
    expect(queryCatalogue({ search: "blue flame hoodie" })).toHaveLength(0);
  });

  it("returns an empty array rather than throwing on an impossible combination", () => {
    expect(queryCatalogue({ categories: ["headwear"], sizes: ["2XL"] })).toEqual([]);
  });
});

describe("stock helpers", () => {
  const product = products.find((item) => item.slug === "blue-flame-tee")!;

  it("reports units per size", () => {
    expect(unitsFor(product, "M")).toBe(0);
    expect(unitsFor(product, "S")).toBeGreaterThan(0);
  });

  it("excludes sold-out sizes from availability", () => {
    expect(availableSizes(product)).not.toContain("M");
  });

  it("flags sizes with three or fewer units as low", () => {
    expect(lowStockSizes(product).every((size) => unitsFor(product, size) <= 3)).toBe(true);
  });

  it("totals stock across sizes", () => {
    expect(totalUnits(product)).toBe(product.stock.reduce((sum, level) => sum + level.units, 0));
  });
});

describe("related products", () => {
  it("never recommends the product you are already looking at", () => {
    for (const product of products) {
      expect(relatedProducts(product).some((item) => item.slug === product.slug)).toBe(false);
    }
  });

  it("returns at most the requested number", () => {
    expect(relatedProducts(products[0], 3)).toHaveLength(3);
  });
});

describe("price range", () => {
  it("spans the cheapest and dearest pieces", () => {
    const { min, max } = priceRange();
    expect(min).toBeLessThanOrEqual(max);
    expect(min).toBe(Math.min(...products.map((product) => product.price)));
  });
});

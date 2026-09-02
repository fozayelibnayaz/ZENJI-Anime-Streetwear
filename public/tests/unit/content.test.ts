import { describe, expect, it } from "vitest";
import { withBasePath } from "@/lib/asset";
import { looks } from "@/content/lookbook";
import { originPanels } from "@/content/origin";
import { faqs } from "@/content/faq";
import { nav } from "@/content/site";
import { sealRound, seals } from "@/content/seals";
import { getProduct } from "@/lib/catalogue";
import { sizeCharts } from "@/content/sizing";

describe("asset paths", () => {
  it("passes paths through untouched when the site is served from the root", () => {
    // NEXT_PUBLIC_BASE_PATH is unset in tests, which is the root-deploy case.
    expect(withBasePath("/media/products/blue-flame-front.webp")).toBe("/media/products/blue-flame-front.webp");
  });

  it("never rewrites an absolute URL", () => {
    expect(withBasePath("https://cdn.example.com/a.webp")).toBe("https://cdn.example.com/a.webp");
  });
});

describe("content integrity", () => {
  it("every lookbook hotspot points at a product that exists", () => {
    for (const look of looks) {
      for (const hotspot of look.hotspots) {
        expect(getProduct(hotspot.slug), `${look.id} → ${hotspot.slug}`).toBeDefined();
      }
    }
  });

  it("keeps hotspots inside the frame", () => {
    for (const look of looks) {
      for (const hotspot of look.hotspots) {
        expect(hotspot.x).toBeGreaterThan(0);
        expect(hotspot.x).toBeLessThan(100);
        expect(hotspot.y).toBeGreaterThan(0);
        expect(hotspot.y).toBeLessThan(100);
      }
    }
  });

  it("gives every look and panel alt text", () => {
    for (const look of looks) expect(look.alt.length).toBeGreaterThan(10);
    for (const panel of originPanels) {
      if (panel.image) expect(panel.alt?.length ?? 0).toBeGreaterThan(10);
    }
  });

  it("numbers the origin chapters in order", () => {
    expect(originPanels.map((panel) => panel.chapter)).toEqual(["01", "02", "03", "04", "05", "06"]);
  });

  it("uses unique ids for FAQ entries and nav links", () => {
    expect(new Set(faqs.map((entry) => entry.id)).size).toBe(faqs.length);
    expect(new Set(nav.map((item) => item.href)).size).toBe(nav.length);
    for (const item of nav) expect(item.href.startsWith("/")).toBe(true);
  });

  it("orders every size chart from smallest chest to largest", () => {
    for (const chart of Object.values(sizeCharts)) {
      for (let i = 1; i < chart.length; i += 1) {
        expect(chart[i].chest).toBeGreaterThan(chart[i - 1].chest);
      }
    }
  });
});

describe("seal test board", () => {
  it("deals the requested number of unique seals", () => {
    const round = sealRound(42, 4);
    expect(round).toHaveLength(4);
    expect(new Set(round.map((seal) => seal.kanji)).size).toBe(4);
  });

  it("is deterministic for a given seed, so SSR and hydration agree", () => {
    expect(sealRound(7)).toEqual(sealRound(7));
  });

  it("never asks for more seals than exist", () => {
    expect(sealRound(1, 99).length).toBe(seals.length);
  });
});

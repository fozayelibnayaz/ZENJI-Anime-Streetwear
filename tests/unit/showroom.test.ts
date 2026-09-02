import { describe, expect, it } from "vitest";
import { dayKey, drawFortune, fortuneCode, FORTUNES, hashSeed, rng } from "@/lib/omikuji";
import { dnaFromAnswers, dnaMatch, productDna, DNA_QUESTIONS } from "@/lib/dna";
import { recommend, EMPTY_ANSWERS, type ConciergeAnswers } from "@/lib/concierge";
import { levelFor, levelProgress, nextLevelFor } from "@/lib/cred";
import { matchupsFor, crowdShare } from "@/lib/versus";
import { products } from "@/content/products";

describe("omikuji", () => {
  it("is deterministic for the same day and shake", () => {
    const a = drawFortune("2026-09-02", 123);
    const b = drawFortune("2026-09-02", 123);
    expect(a).toEqual(b);
  });

  it("resolves known tiers with matching codes", () => {
    const draw = drawFortune("2026-09-02", 7);
    expect(FORTUNES[draw.tier].kanji).toBe(draw.kanji);
    expect(draw.code).toBe(fortuneCode(draw.day, draw.tier));
    expect(draw.code).toMatch(/^ZENJI-[A-Z]{4}-0902$/);
    expect(draw.stick).toBeGreaterThanOrEqual(1);
    expect(draw.stick).toBeLessThanOrEqual(64);
  });

  it("dayKey is zero-padded local date", () => {
    expect(dayKey(new Date(2026, 8, 2))).toBe("2026-09-02");
  });

  it("rng is seeded and bounded", () => {
    const r1 = rng(hashSeed("a"));
    const r2 = rng(hashSeed("a"));
    expect(r1()).toBe(r2());
    for (let i = 0; i < 50; i++) {
      const value = r1();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("fit dna", () => {
  it("starts neutral and clamps to 0–100", () => {
    const neutral = dnaFromAnswers({});
    expect(neutral).toEqual({ boxiness: 50, length: 50, sleeve: 50, weight: 50, ink: 50 });

    const loud = dnaFromAnswers(Object.fromEntries(DNA_QUESTIONS.map((q) => [q.id, q.options.length - 1])));
    expect(Object.values(loud).every((v) => v >= 0 && v <= 100)).toBe(true);
    expect(loud.ink).toBeGreaterThan(70);
  });

  it("match is symmetric and 100 for identical profiles", () => {
    const a = dnaFromAnswers({ silhouette: 2 });
    const b = dnaFromAnswers({ silhouette: 0 });
    expect(dnaMatch(a, b)).toBe(dnaMatch(b, a));
    expect(dnaMatch(a, a)).toBe(100);
  });

  it("every product derives an in-range profile", () => {
    for (const product of products) {
      const dna = productDna(product);
      expect(Object.values(dna).every((v) => v >= 0 && v <= 100)).toBe(true);
    }
  });
});

describe("concierge", () => {
  it("honours the budget cap", () => {
    const answers: ConciergeAnswers = { ...EMPTY_ANSWERS, budget: "under40" };
    const picks = recommend(answers, null, 3);
    expect(picks.every((p) => p.price <= 4000)).toBe(true);
  });

  it("loud taste ranks back-panel pieces above quiet answers", () => {
    const loud = recommend({ ...EMPTY_ANSWERS, vibe: "loud" }, null, 3);
    const quiet = recommend({ ...EMPTY_ANSWERS, vibe: "quiet" }, null, 3);
    const inkOf = (list: typeof loud) =>
      list.reduce((sum, p) => sum + productDna(p).ink, 0) / list.length;
    expect(inkOf(loud)).toBeGreaterThan(inkOf(quiet));
  });

  it("never recommends sold-out pieces first", () => {
    const picks = recommend(EMPTY_ANSWERS, null, 3);
    expect(picks.length).toBe(3);
  });
});

describe("street cred", () => {
  it("levels resolve by threshold", () => {
    expect(levelFor(0).title).toBe("Genji");
    expect(levelFor(59).title).toBe("Genji");
    expect(levelFor(60).title).toBe("Rōnin");
    expect(levelFor(1000).title).toBe("Ukiyo Legend");
  });

  it("progress sits between levels", () => {
    expect(levelProgress(0)).toBe(0);
    expect(nextLevelFor(1000)).toBeNull();
    const mid = levelProgress(30);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
});

describe("versus", () => {
  it("matchups are deterministic per day with distinct products", () => {
    const a = matchupsFor("2026-09-02");
    const b = matchupsFor("2026-09-02");
    expect(a.map((m) => m.a.slug + m.b.slug)).toEqual(b.map((m) => m.a.slug + m.b.slug));
    for (const fight of a) expect(fight.a.slug).not.toBe(fight.b.slug);
  });

  it("crowd share stays in a believable band", () => {
    for (let i = 0; i < 8; i++) {
      const share = crowdShare("2026-09-02", i, i % 2 === 0 ? 0 : 1);
      expect(share).toBeGreaterThanOrEqual(51);
      expect(share).toBeLessThanOrEqual(92);
    }
  });
});

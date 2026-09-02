import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import {
  MOVES,
  applyMove,
  credFor,
  dailyItems,
  discountPct,
  hash,
  mulberry,
  openDeal,
  shake,
} from "@/lib/counter";

const DAY = "2026-9-2";
const tee = products[0];

describe("seeded rng", () => {
  it("hash is stable and unsigned", () => {
    expect(hash("kage")).toBe(hash("kage"));
    expect(hash("kage")).toBeGreaterThanOrEqual(0);
    expect(hash("a")).not.toBe(hash("b"));
  });

  it("mulberry stays in [0,1)", () => {
    for (let i = 0; i < 200; i++) {
      const r = mulberry(i * 31 + 7);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1);
    }
  });
});

describe("daily stock", () => {
  it("picks three distinct pieces for a day, deterministically", () => {
    const a = dailyItems(DAY);
    const b = dailyItems(DAY);
    expect(a.map((p) => p.slug)).toEqual(b.map((p) => p.slug));
    expect(new Set(a.map((p) => p.slug)).size).toBe(3);
  });
});

describe("the deal", () => {
  it("opens at tag price with an 18% rumoured floor band", () => {
    const deal = openDeal(tee, DAY, 0);
    expect(deal.price).toBe(tee.price);
    expect(deal.ask).toBe(tee.price);
    expect(deal.floor).toBe(Math.round(tee.price * 0.82));
    expect(deal.maxRounds).toBe(4);
  });

  it("grants a fifth move from Rōnin rank up", () => {
    expect(openDeal(tee, DAY, 2).maxRounds).toBe(5);
    expect(openDeal(tee, DAY, 1).maxRounds).toBe(4);
  });

  it("every move sequence is deterministic", () => {
    const run = () => {
      let d = openDeal(tee, DAY, 0);
      for (const m of ["flatter", "bluff", "cash", "walk"] as const) d = applyMove(d, m);
      return d;
    };
    expect(run()).toEqual(run());
  });

  it("never prices below the floor and tracks rounds", () => {
    let d = openDeal(tee, DAY, 0);
    for (let i = 0; i < 6 && !d.done; i++) {
      d = applyMove(d, MOVES[i % MOVES.length].id);
      expect(d.price).toBeGreaterThanOrEqual(d.floor);
      expect(d.rounds).toBe(Math.min(i + 1, d.maxRounds));
    }
    expect(d.done).toBe(true);
  });

  it("flattering warms KAGE up", () => {
    const d = openDeal(tee, DAY, 0);
    expect(applyMove(d, "flatter").mood).toBeGreaterThan(d.mood);
  });

  it("walking either ends the deal or wins the biggest single cut", () => {
    for (const seedDay of ["2026-9-1", "2026-9-2", "2026-9-3", "x", "y"]) {
      const d = openDeal(tee, seedDay, 0);
      const after = applyMove(d, "walk");
      if (after.walked) expect(after.done).toBe(true);
      else expect(d.price - after.price).toBeGreaterThanOrEqual(Math.round((d.ask - d.floor) * 0.22) - 1);
    }
  });

  it("shake closes at the current price with a sane discount", () => {
    let d = openDeal(tee, DAY, 0);
    d = applyMove(d, "flatter");
    d = applyMove(d, "cash");
    const closed = shake(d);
    expect(closed.done).toBe(true);
    expect(closed.walked).toBe(false);
    expect(discountPct(closed)).toBeGreaterThanOrEqual(0);
    expect(discountPct(closed)).toBeLessThanOrEqual(18);
    expect(credFor(closed)).toBeGreaterThan(5);
  });

  it("walking away still pays a token", () => {
    let d = openDeal(tee, DAY, 0);
    while (!d.done) d = applyMove(d, "walk");
    if (d.walked) expect(credFor(d)).toBe(2);
  });
});

/**
 * OMIKUJI — the shrine's daily fortune draw.
 *
 * Pure and deterministic: a fortune is a function of the local date, so every
 * visitor who shakes the cylinder on the same day resolves the same tiers and
 * seal codes. The shake itself only chooses which numbered stick pops first —
 * flavour, not odds. No backend, no clock games.
 */

export type FortuneTier = "daikichi" | "kichi" | "chukichi" | "suekichi";

export interface FortuneSpec {
  tier: FortuneTier;
  kanji: string;
  romaji: string;
  label: string;
  poem: string;
  advice: string;
  /** The seal's gift: a percentage off, shown with the code. */
  discountPct: number;
}

export const FORTUNES: Record<FortuneTier, FortuneSpec> = {
  daikichi: {
    tier: "daikichi",
    kanji: "大吉",
    romaji: "daikichi",
    label: "Great blessing",
    poem: "The blue flame waits for no one — but today, it waits for you.",
    advice: "Buy the piece you keep re-opening. That is not browsing, that is destiny.",
    discountPct: 15,
  },
  kichi: {
    tier: "kichi",
    kanji: "吉",
    romaji: "kichi",
    label: "Blessing",
    poem: "A tram you did not plan for arrives exactly on time.",
    advice: "Stack one layer bolder than you meant to. Melbourne rewards it.",
    discountPct: 10,
  },
  chukichi: {
    tier: "chukichi",
    kanji: "中吉",
    romaji: "chūkichi",
    label: "Middle blessing",
    poem: "Half the street wears grey. You were given eyes for the oxide red.",
    advice: "Measure twice in the Fit Lab, then trust the first answer.",
    discountPct: 7,
  },
  suekichi: {
    tier: "suekichi",
    kanji: "末吉",
    romaji: "suekichi",
    label: "Future blessing",
    poem: "The seal is quiet this morning. Quiet seals burn longest.",
    advice: "Save the piece now; the drop console will remember you.",
    discountPct: 5,
  },
};

/** Local date as YYYY-MM-DD — the draw resets at your midnight, not the server's. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** FNV-1a — small, stable, good-enough string hash for seeding. */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 — tiny deterministic PRNG. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TIER_ORDER: FortuneTier[] = ["daikichi", "kichi", "chukichi", "suekichi"];
const TIER_WEIGHTS = [0.14, 0.34, 0.3, 0.22];

export interface DrawnFortune extends FortuneSpec {
  day: string;
  stick: number;
  code: string;
}

/** Resolve the day's fortune. `shake` (any integer) picks the stick number. */
export function drawFortune(day: string, shake: number): DrawnFortune {
  const rand = rng(hashSeed(`${day}//zenji`));
  const roll = rand();
  let acc = 0;
  let tier: FortuneTier = TIER_ORDER[TIER_ORDER.length - 1];
  for (let i = 0; i < TIER_ORDER.length; i++) {
    acc += TIER_WEIGHTS[i];
    if (roll < acc) {
      tier = TIER_ORDER[i];
      break;
    }
  }
  const stick = (hashSeed(`${day}//stick${shake}`) % 64) + 1;
  const spec = FORTUNES[tier];
  return {
    ...spec,
    day,
    stick,
    code: fortuneCode(day, tier),
  };
}

/** ZENJI-KICHI-0902 style seal code — readable, date-stamped, tier-stamped. */
export function fortuneCode(day: string, tier: FortuneTier): string {
  const [, m, d] = day.split("-");
  const stamp = tier === "chukichi" ? "CHUU" : tier.slice(0, 4).toUpperCase();
  return `ZENJI-${stamp}-${m}${d}`;
}

export interface StoredFortune {
  day: string;
  fortune: DrawnFortune;
}

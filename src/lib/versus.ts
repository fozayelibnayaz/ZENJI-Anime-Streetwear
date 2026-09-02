import { products, type Product } from "@/content/products";
import { dayKey, hashSeed, rng } from "@/lib/omikuji";

/**
 * THE VERSUS — deterministic daily matchup rotation.
 *
 * The pairing order is seeded by the local date so the whole street argues
 * about the same fights all day; the crowd share is seeded per fight so it
 * never changes on refresh. Your vote is remembered locally and nudges the
 * Floorwalker's pulls (see lib/concierge boost).
 */

export interface Matchup {
  a: Product;
  b: Product;
}

export function matchupsFor(day: string = dayKey(), count = 8): Matchup[] {
  const rand = rng(hashSeed(`${day}//versus`));
  const pool = [...products];
  // seeded shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const fights: Matchup[] = [];
  for (let i = 0; i + 1 < pool.length && fights.length < count; i += 2) {
    fights.push({ a: pool[i], b: pool[i + 1] });
  }
  return fights;
}

/** The crowd's share for the winner of a fight — stable per day + index. */
export function crowdShare(day: string, fightIndex: number, winner: 0 | 1): number {
  const rand = rng(hashSeed(`${day}//crowd${fightIndex}`));
  const base = 52 + Math.round(rand() * 33); // 52–85
  // your side of the ring occasionally runs behind the street
  const skew = winner === 0 ? 0 : Math.round((rand() - 0.5) * 6);
  return Math.min(92, Math.max(51, base + skew));
}

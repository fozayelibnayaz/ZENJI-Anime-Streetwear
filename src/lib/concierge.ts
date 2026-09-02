import { products, type Product } from "@/content/products";
import { availableSizes } from "@/lib/catalogue";
import { dnaMatch, productDna, type FitDna } from "@/lib/dna";

/**
 * THE FLOORWALKER'S BRAIN — pure recommendation scoring.
 *
 * The clerk asks three small questions, combines them with the shopper's Fit
 * DNA (if they have one), and ranks the live catalogue. Deterministic and
 * testable; the component only renders what this returns.
 */

export type Vibe = "loud" | "dark" | "quiet";
export type Climate = "hot" | "cold" | "rain";
export type Budget = "under40" | "under120" | "any";

export interface ConciergeAnswers {
  vibe: Vibe | null;
  climate: Climate | null;
  budget: Budget | null;
}

export const EMPTY_ANSWERS: ConciergeAnswers = { vibe: null, climate: null, budget: null };

const BUDGET_CAP: Record<Budget, number> = {
  under40: 4000,
  under120: 12000,
  any: Number.POSITIVE_INFINITY,
};

function vibeScore(product: Product, vibe: Vibe): number {
  const dna = productDna(product);
  if (vibe === "loud") return dna.ink;
  if (vibe === "dark") return product.swatch.toLowerCase().startsWith("#1") || /black|sumi/i.test(product.colourway) ? 80 : 45;
  // quiet — small seals, bone/neutral colourways
  return 100 - dna.ink;
}

function climateScore(product: Product, climate: Climate): number {
  if (climate === "hot") return product.category === "tee" ? 90 : product.category === "headwear" ? 70 : 20;
  if (climate === "cold") return product.gsm >= 400 ? 95 : product.category === "hoodie" ? 80 : product.category === "pant" ? 60 : 40;
  // rain — layers + headwear + cargo
  if (product.category === "headwear") return 85;
  if (product.category === "hoodie") return 80;
  if (product.category === "pant") return 65;
  return 45;
}

export function scoreProduct(
  product: Product,
  answers: ConciergeAnswers,
  dna: FitDna | null,
  crowned: string[] = [],
): number {
  let score = 50;
  if (answers.vibe) score += (vibeScore(product, answers.vibe) - 50) * 0.5;
  if (answers.climate) score += (climateScore(product, answers.climate) - 50) * 0.45;
  if (dna) score += (dnaMatch(dna, productDna(product)) - 50) * 0.4;
  if (crowned.includes(product.slug)) score += 8;
  if (answers.budget && product.price > BUDGET_CAP[answers.budget]) score -= 200;
  if (availableSizes(product).length === 0) score -= 300;
  if (product.featured) score += 4;
  return score;
}

export function recommend(
  answers: ConciergeAnswers,
  dna: FitDna | null,
  limit = 3,
  crowned: string[] = [],
  source: Product[] = products,
): Product[] {
  return [...source]
    .map((product) => ({ product, score: scoreProduct(product, answers, dna, crowned) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

/** One-line reason the clerk can say for a pick — copy, not maths. */
export function reasonFor(product: Product, answers: ConciergeAnswers): string {
  const bits: string[] = [];
  if (answers.vibe === "loud" && product.images.back) bits.push("the back panel carries the whole manga");
  if (answers.vibe === "quiet") bits.push("the seal stays quiet until someone stands close");
  if (answers.vibe === "dark") bits.push("the colourway drinks the light");
  if (answers.climate === "hot") bits.push(`${product.gsm}gsm survives a 32° walk`);
  if (answers.climate === "cold") bits.push(`${product.gsm}gsm holds the 2am tram`);
  if (answers.climate === "rain") bits.push("shrugs off drizzle on the 86 tram run");
  if (bits.length === 0) bits.push("the floor keeps pointing people towards it");
  return bits[0];
}

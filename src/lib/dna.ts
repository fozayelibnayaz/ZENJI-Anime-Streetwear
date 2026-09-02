import type { Product } from "@/content/products";

/**
 * FIT DNA — a five-axis taste profile.
 *
 * The quiz maps a shopper's instincts onto the same axes we can derive from
 * every product in the catalogue, so "match %" is a real distance between two
 * points in the same space — not a horoscope. All values are 0–100.
 */

export interface FitDna {
  /** Cropped → tent. */
  boxiness: number;
  /** Short → long silhouette. */
  length: number;
  /** How much arm coverage you live in. */
  sleeve: number;
  /** Featherweight → heavyweight fabric. */
  weight: number;
  /** Whisper → full-back manga panel. */
  ink: number;
}

export type DnaAxisId = keyof FitDna;

export const DNA_AXES: { id: DnaAxisId; label: string; kanji: string; low: string; high: string }[] = [
  { id: "boxiness", label: "Volume", kanji: "量", low: "close", high: "tent" },
  { id: "length", label: "Length", kanji: "丈", low: "cropped", high: "longline" },
  { id: "sleeve", label: "Coverage", kanji: "袖", low: "bare arms", high: "full fleece" },
  { id: "weight", label: "Weight", kanji: "重", low: "feather", high: "armour" },
  { id: "ink", label: "Ink", kanji: "墨", low: "quiet seal", high: "loud panel" },
];

export interface DnaOption {
  label: string;
  /** Additive effect on the profile, applied over a neutral 50. */
  effect: Partial<FitDna>;
}

export interface DnaQuestion {
  id: string;
  prompt: string;
  options: DnaOption[];
}

export const DNA_QUESTIONS: DnaQuestion[] = [
  {
    id: "silhouette",
    prompt: "Your ideal tee hangs…",
    options: [
      { label: "Close — follows the body", effect: { boxiness: -30, length: -12 } },
      { label: "Relaxed — skims, never clings", effect: { boxiness: 0 } },
      { label: "A tent with sleeves", effect: { boxiness: 32, length: 14 } },
    ],
  },
  {
    id: "season",
    prompt: "Melbourne throws 14°C at you in July. You reach for…",
    options: [
      { label: "Still a tee. Always a tee.", effect: { sleeve: -28, weight: -18 } },
      { label: "Tee now, hoodie in the bag", effect: { sleeve: 6, weight: 4 } },
      { label: "480gsm fleece or nothing", effect: { sleeve: 30, weight: 32 } },
    ],
  },
  {
    id: "graphic",
    prompt: "Someone across the tram should see…",
    options: [
      { label: "A single seal at the chest", effect: { ink: -30 } },
      { label: "A front mark, some story", effect: { ink: 2 } },
      { label: "A full back panel they can read", effect: { ink: 32 } },
    ],
  },
  {
    id: "hem",
    prompt: "Where should the hem land?",
    options: [
      { label: "Mid-hip, clean", effect: { length: -24 } },
      { label: "Below hip, covers the belt", effect: { length: 6 } },
      { label: "Longline — past the pockets", effect: { length: 30, boxiness: 8 } },
    ],
  },
  {
    id: "hand",
    prompt: "Pick a fabric hand-feel:",
    options: [
      { label: "Soft drape, moves when you do", effect: { weight: -26 } },
      { label: "Structured — holds the shoulder", effect: { weight: 8, boxiness: 6 } },
      { label: "Cardboard in the best way", effect: { weight: 30 } },
    ],
  },
];

const clamp = (value: number) => Math.round(Math.min(100, Math.max(0, value)));

/** Neutral 50s + the chosen options' effects, clamped to 0–100. */
export function dnaFromAnswers(answers: Record<string, number>): FitDna {
  const profile: FitDna = { boxiness: 50, length: 50, sleeve: 50, weight: 50, ink: 50 };
  for (const question of DNA_QUESTIONS) {
    const index = answers[question.id];
    const option = question.options[index];
    if (!option) continue;
    for (const [axis, delta] of Object.entries(option.effect) as [DnaAxisId, number][]) {
      profile[axis] = clamp(profile[axis] + delta);
    }
  }
  return profile;
}

/** Derive the same five axes from a product's real spec sheet. */
export function productDna(product: Product): FitDna {
  const weight = Math.min(100, Math.max(0, ((product.gsm - 160) / (480 - 160)) * 100));
  const boxiness = /boxy|oversized/i.test(product.fit) ? 78 : /tapered/i.test(product.fit) ? 38 : 55;
  const sleeve = product.category === "hoodie" ? 88 : product.category === "tee" ? 32 : product.category === "headwear" ? 12 : 50;
  const length = product.category === "pant" ? 82 : product.category === "hoodie" ? 66 : product.category === "headwear" ? 18 : 55;
  const ink = product.images.back ? 82 : 44;
  return {
    boxiness: clamp(boxiness),
    length: clamp(length),
    sleeve: clamp(sleeve),
    weight: clamp(weight),
    ink: clamp(ink),
  };
}

/** 0–100 similarity between two profiles; 100 = identical taste. */
export function dnaMatch(a: FitDna, b: FitDna): number {
  const axes = Object.keys(a) as DnaAxisId[];
  const diff = axes.reduce((sum, axis) => sum + Math.abs(a[axis] - b[axis]), 0) / axes.length;
  return Math.round(100 - diff);
}

export function matchLabel(score: number): string {
  if (score >= 85) return "twin flame";
  if (score >= 70) return "strong match";
  if (score >= 55) return "curious match";
  return "stretch piece";
}

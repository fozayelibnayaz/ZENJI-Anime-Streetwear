import { sizeCharts, fitPreferences, type FitPreference } from "@/content/sizing";
import type { Category, Size } from "@/content/products";

/**
 * FIT LAB
 *
 * Nobody knows what "oversized" means until they compare it to something they
 * already own. So instead of asking for body measurements (which people guess
 * badly) we ask for two flat-lay numbers off a garment in their wardrobe and
 * match those against the real ZENJI pattern.
 *
 * Pure functions, no React, no side effects — which is also what makes the
 * whole thing unit-testable.
 */

export interface FitInput {
  /** Pit-to-pit of the reference garment, in centimetres. */
  chest: number;
  /** High-point-shoulder to hem of the reference garment, in centimetres. */
  length: number;
  preference: FitPreference;
  category: Category;
}

export interface SizeMatch {
  size: Size;
  score: number;
  chestDelta: number;
  lengthDelta: number;
}

export interface FitResult {
  recommended: Size;
  /** Second-best size, offered as "if you want it roomier / closer". */
  alternative?: Size;
  confidence: "high" | "medium" | "low";
  /** 0–100. How boxy the recommendation is compared to the reference garment. */
  boxiness: number;
  ranked: SizeMatch[];
  summary: string;
}

export const FIT_LIMITS = {
  chest: { min: 35, max: 85 },
  length: { min: 50, max: 95 },
} as const;

export function cmFromInches(inches: number): number {
  return inches * 2.54;
}

export function inchesFromCm(cm: number): number {
  return cm / 2.54;
}

export function clampMeasurement(value: number, key: keyof typeof FIT_LIMITS): number {
  const { min, max } = FIT_LIMITS[key];
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Width matters roughly twice as much as length for how a boxy tee reads. */
const CHEST_WEIGHT = 1;
const LENGTH_WEIGHT = 0.45;

export function recommendSize(input: FitInput): FitResult {
  const chart = sizeCharts[input.category] ?? sizeCharts.tee;
  const preference = fitPreferences.find((p) => p.id === input.preference) ?? fitPreferences[1];

  const chest = clampMeasurement(input.chest, "chest");
  const length = clampMeasurement(input.length, "length");

  const targetChest = chest + preference.chestOffset;
  const targetLength = length + preference.lengthOffset;

  const ranked: SizeMatch[] = chart
    .map((spec) => ({
      size: spec.size,
      chestDelta: round(spec.chest - chest),
      lengthDelta: round(spec.length - length),
      score: round(
        Math.abs(spec.chest - targetChest) * CHEST_WEIGHT + Math.abs(spec.length - targetLength) * LENGTH_WEIGHT,
      ),
    }))
    .sort((a, b) => a.score - b.score);

  const best = ranked[0];
  const runnerUp = ranked[1];

  const recommendedSpec = chart.find((s) => s.size === best.size) ?? chart[0];
  const referenceRatio = (chest * 2) / Math.max(length, 1);
  const recommendedRatio = (recommendedSpec.chest * 2) / Math.max(recommendedSpec.length, 1);
  // 1.0 is a perfectly square garment; anything past ~1.6 is properly boxy.
  const boxiness = Math.round(Math.min(100, Math.max(0, ((recommendedRatio - 1.2) / 0.55) * 100)));

  const confidence: FitResult["confidence"] = best.score <= 1.6 ? "high" : best.score <= 3.6 ? "medium" : "low";

  return {
    recommended: best.size,
    alternative: runnerUp?.size,
    confidence,
    boxiness,
    ranked,
    summary: buildSummary(best, recommendedRatio - referenceRatio, preference.label),
  };
}

function buildSummary(best: SizeMatch, ratioDelta: number, preferenceLabel: string): string {
  const wider = best.chestDelta;
  const longer = best.lengthDelta;

  const widthPhrase =
    Math.abs(wider) < 0.6
      ? "the same width across the chest"
      : `${Math.abs(wider).toFixed(1)}cm ${wider > 0 ? "wider" : "narrower"} across the chest`;

  const lengthPhrase =
    Math.abs(longer) < 0.6
      ? "the same length"
      : `${Math.abs(longer).toFixed(1)}cm ${longer > 0 ? "longer" : "shorter"} in the body`;

  const shape = ratioDelta > 0.05 ? "so it will read boxier than your reference" : ratioDelta < -0.05 ? "so it will hang a little leaner" : "so the silhouette will read the same";

  return `Size ${best.size} lands ${widthPhrase} and ${lengthPhrase} than the garment you measured, ${shape}. Matched against your "${preferenceLabel}" preference.`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

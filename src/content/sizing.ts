import type { Category, Size } from "./products";

/**
 * Flat-lay measurements of the actual ZENJI patterns, in centimetres.
 * `chest` is pit-to-pit (half chest) and `length` is high-point-shoulder to hem —
 * the two numbers you can take yourself with a tape and a tee on a table.
 */
export interface SizeSpec {
  size: Size;
  chest: number;
  length: number;
  sleeve: number;
}

export const sizeCharts: Record<Category, SizeSpec[]> = {
  tee: [
    { size: "XS", chest: 51, length: 66, sleeve: 20 },
    { size: "S", chest: 54, length: 69, sleeve: 21 },
    { size: "M", chest: 57, length: 72, sleeve: 22 },
    { size: "L", chest: 60, length: 74, sleeve: 23 },
    { size: "XL", chest: 63, length: 76, sleeve: 24 },
    { size: "2XL", chest: 66, length: 78, sleeve: 25 },
  ],
  hoodie: [
    { size: "XS", chest: 55, length: 66, sleeve: 56 },
    { size: "S", chest: 58, length: 68, sleeve: 58 },
    { size: "M", chest: 61, length: 70, sleeve: 60 },
    { size: "L", chest: 64, length: 72, sleeve: 62 },
    { size: "XL", chest: 67, length: 74, sleeve: 63 },
    { size: "2XL", chest: 70, length: 76, sleeve: 64 },
  ],
  pant: [
    { size: "XS", chest: 36, length: 100, sleeve: 0 },
    { size: "S", chest: 38, length: 102, sleeve: 0 },
    { size: "M", chest: 41, length: 104, sleeve: 0 },
    { size: "L", chest: 44, length: 106, sleeve: 0 },
    { size: "XL", chest: 47, length: 107, sleeve: 0 },
    { size: "2XL", chest: 50, length: 108, sleeve: 0 },
  ],
  headwear: [{ size: "M", chest: 0, length: 0, sleeve: 0 }],
};

/**
 * Reference garments people are likely to already own, so nobody has to find a
 * tape measure to get a useful answer. Numbers are averages of the men's/unisex
 * size charts published by each label for an Australian size run.
 */
export interface ReferenceGarment {
  id: string;
  label: string;
  note: string;
  chest: number;
  length: number;
}

export const referenceGarments: ReferenceGarment[] = [
  { id: "au-s-slim", label: "Standard AU size S tee", note: "Regular fit, e.g. Cotton On", chest: 48, length: 68 },
  { id: "au-m-regular", label: "Standard AU size M tee", note: "Regular fit, most high street", chest: 51, length: 71 },
  { id: "au-l-regular", label: "Standard AU size L tee", note: "Regular fit", chest: 54, length: 74 },
  { id: "uniqlo-u-m", label: "Uniqlo U size M", note: "Relaxed boxy", chest: 55, length: 69 },
  { id: "boxy-osfa", label: "Oversized boxy tee (M)", note: "Streetwear cut you already own", chest: 58, length: 71 },
  { id: "hoodie-m", label: "Heavyweight hoodie (M)", note: "Fleece, relaxed", chest: 60, length: 69 },
];

export type FitPreference = "tailored" | "true" | "oversized";

export const fitPreferences: { id: FitPreference; label: string; note: string; chestOffset: number; lengthOffset: number }[] = [
  { id: "tailored", label: "Close", note: "Sits near the body", chestOffset: -2.5, lengthOffset: -1 },
  { id: "true", label: "True to ZENJI", note: "How the sample is cut", chestOffset: 1.5, lengthOffset: 0 },
  { id: "oversized", label: "Extra boxy", note: "Hangs off the shoulder", chestOffset: 5, lengthOffset: 2 },
];

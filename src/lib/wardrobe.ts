import { getProduct } from "@/lib/catalogue";
import type { Category, Product, Size } from "@/content/products";

/**
 * THE CLOSET — the data behind the digital fitting room.
 *
 * Everything here is pure: given a body frame and a product/size, it returns the
 * numbers a component can render. Keeping the maths in one module means the
 * figure on screen is literally the size chart, not an illustration of it.
 */

export type Presentation = "f" | "m" | "u";
export type Frame = "athletic" | "classic" | "boxy";

export interface Body {
  /** Shoulder width in cm — sets how the top of a garment sits. */
  shoulderCm: number;
  /** Hip width in cm — matters for the cargo hem. */
  hipCm: number;
  /** Shoulder-to-hip torso length in cm. */
  torsoCm: number;
}

/**
 * The user picks a *presentation* (how the frame is built — hips and shoulders)
 * and a *frame* (overall bulk). Both are deliberate and small; the point is that
 * the same garment reads differently on different bodies, and that is OK.
 */
export const presentations: { id: Presentation; label: string; note: string; shoulder: number; hip: number; torso: number }[] = [
  { id: "f", label: "F", note: "Feminine frame", shoulder: 38, hip: 46, torso: 40 },
  { id: "m", label: "M", note: "Masculine frame", shoulder: 45, hip: 43, torso: 44 },
  { id: "u", label: "U", note: "Unisex / true to pattern", shoulder: 42, hip: 44, torso: 43 },
];

export const frames: { id: Frame; label: string; note: string; shoulder: number; hip: number; torso: number }[] = [
  { id: "athletic", label: "Athletic", note: "Tapered, broad through the shoulder", shoulder: 2, hip: -1, torso: 0 },
  { id: "classic", label: "Classic", note: "Even, true to the block", shoulder: 0, hip: 0, torso: 0 },
  { id: "boxy", label: "Boxy", note: "Runs wide, extra room", shoulder: 3, hip: 2, torso: 2 },
];

export function bodyFor(presentation: Presentation, frame: Frame): Body {
  const p = presentations.find((entry) => entry.id === presentation)!;
  const f = frames.find((entry) => entry.id === frame)!;
  return {
    shoulderCm: p.shoulder + f.shoulder,
    hipCm: p.hip + f.hip,
    torsoCm: p.torso + f.torso,
  };
}

/**
 * The figure stage is a fixed 300×640 viewBox. A garment's flat-lay image is
 * overlaid on it, scaled so that one size chart centimetre = STAGE_SCALE px.
 * This is what lets an S and a 2XL genuinely render at different sizes.
 */
export const STAGE_W = 300;
export const STAGE_H = 640;
export const STAGE_SCALE = 2.3;

/** Convert a size-chart measurement (cm) into stage pixels on one axis. */
export function cmToPx(cm: number): number {
  return cm * STAGE_SCALE;
}

/** Convert stage pixels into a percentage of the container on the given axis. */
export function pxToPct(px: number, axis: "x" | "y"): number {
  const dim = axis === "x" ? STAGE_W : STAGE_H;
  return (px / dim) * 100;
}

/** Category → where on the figure the garment sits. */
export const CATEGORY_PLACEMENT: Record<Category, { zone: "torso" | "legs" | "head" }> = {
  tee: { zone: "torso" },
  hoodie: { zone: "torso" },
  pant: { zone: "legs" },
  headwear: { zone: "head" },
};

/** One garment to hang on the figure. */
export interface DressLayer {
  product: Product;
  size: Size;
}

/**
 * Weather the Drop — Melbourne's weather decides what you reach for. Each
 * scenario is a full "look" pulled from real catalogue products. This is the
 * closest a static site can come to a personal stylist without any backend.
 */
export interface WeatherScenario {
  id: string;
  code: string;
  label: string;
  temp: string;
  conditions: string;
  blurb: string;
  /** Slugs, in stacking order (base layer first). */
  picks: string[];
}

export const weatherScenarios: WeatherScenario[] = [
  {
    id: "drizzle-11",
    code: "AEST 06:30",
    label: "Melbourne drizzle",
    temp: "11°",
    conditions: "Intermittent rain, steady wind",
    blurb:
      "The classic. 480gsm fleece over a tee, cargo that shrugs off the gutters, and a cap to keep the drizzle off your glasses. This is the walk to the 86 tram.",
    picks: ["ronin-heavyweight-hoodie", "bushido-tee", "shadow-cargo-pant", "seal-cap"],
  },
  {
    id: "scorcher-32",
    code: "AEST 14:00",
    label: "Scorcher day",
    temp: "32°",
    conditions: "Hot, dry, no mercy",
    blurb:
      "Too hot for layers. One 240gsm tee that still keeps its shape when it is 32 degrees and you are walking from Fed Square to the river. The cap earns its keep.",
    picks: ["blue-flame-tee", "seal-cap"],
  },
  {
    id: "night-out-18",
    code: "AEST 21:00",
    label: "Night out",
    temp: "18°",
    conditions: "Clear, cooling off fast",
    blurb:
      "The show is over and the trams have thinned out. A light tee, a zip hoodie you can lose in a bag, and cargo with pockets for the phone and the ticket.",
    picks: ["demon-blood-tee", "void-zip-hoodie", "shadow-cargo-pant"],
  },
  {
    id: "2am-tram-8",
    code: "AEST 02:00",
    label: "The 2am tram home",
    temp: "8°",
    conditions: "Cold, quiet, wind off the bay",
    blurb:
      "Everything is closed and you are still out. This is the walk home in near-darkness — heavyweight fleece and cargo, nothing flashy, everything warm.",
    picks: ["ronin-heavyweight-hoodie", "shadow-cargo-pant"],
  },
  {
    id: "studio-21",
    code: "AEST 11:00",
    label: "Studio all-day",
    temp: "21°",
    conditions: "Mild, indoors, no rush",
    blurb:
      "The only bone-coloured tee we make. Designed for long days — it photographs under harsh light and still looks considered at 6pm when nothing else does.",
    picks: ["will-of-the-sun-tee", "shadow-cargo-pant"],
  },
];

/** Resolve a scenario's slugs into the products actually worn. */
export function lookForScenario(id: string): DressLayer[] {
  const scenario = weatherScenarios.find((entry) => entry.id === id);
  if (!scenario) return [];
  const layers: DressLayer[] = [];
  for (const slug of scenario.picks) {
    const product = getProduct(slug);
    if (!product) continue;
    // Default to the largest stocked size; the console lets the user change it.
    const size = product.stock.filter((s) => s.units > 0).map((s) => s.size).sort().at(-1) ?? "M";
    layers.push({ product, size });
  }
  return layers;
}

/** How many of the four slots a look fills, used to draw the mini rail. */
export function lookCoverage(layers: DressLayer[]): { slot: Category; filled: boolean }[] {
  const present = new Set(layers.map((layer) => layer.product.category));
  return (["tee", "hoodie", "pant", "headwear"] as Category[]).map((slot) => ({
    slot,
    filled: present.has(slot),
  }));
}

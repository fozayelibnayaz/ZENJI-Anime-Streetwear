/**
 * ZENJI catalogue.
 *
 * This is the single source of truth for everything the storefront sells.
 * To add a product: copy an entry, change the fields, drop the images into
 * /public/media/products. Nothing else in the codebase needs to change —
 * routes, filters, search, sitemap and JSON-LD are all derived from here.
 *
 * Prices are stored in cents to keep money arithmetic in integers.
 */

export type Size = "XS" | "S" | "M" | "L" | "XL" | "2XL";

export type Category = "tee" | "hoodie" | "pant" | "headwear";

export type DropId = "origin" | "shadow";

export interface StockLevel {
  size: Size;
  /** Units on hand. 0 renders as SOLD OUT and blocks add-to-loadout. */
  units: number;
}

export interface Product {
  slug: string;
  name: string;
  category: Category;
  drop: DropId;
  /** AUD cents. */
  price: number;
  /** Original AUD cents, when the item is on sale. */
  compareAt?: number;
  colourway: string;
  /** Swatch colour used by the filter chips. */
  swatch: string;
  kanji: string;
  romaji: string;
  /** One-line hook shown on cards and in search. */
  tagline: string;
  /** The meaning behind the graphic — the reason people buy these. */
  story: string;
  fabric: string;
  gsm: number;
  fit: string;
  care: string[];
  stock: StockLevel[];
  images: {
    front: string;
    back?: string;
  };
  /** Highlighted on the homepage marquee grid. */
  featured?: boolean;
  releasedAt: string;
}

const TEE_CARE = [
  "Cold machine wash, inside out, with like colours",
  "Do not tumble dry — hang in shade",
  "Warm iron on reverse, never directly on the print",
];

const HEAVY_CARE = [
  "Cold gentle wash, inside out",
  "Line dry flat to hold the shoulder",
  "Do not bleach or dry clean",
];

export const products: Product[] = [
  {
    slug: "blue-flame-tee",
    name: "Blue Flame Tee",
    category: "tee",
    drop: "origin",
    price: 3399,
    compareAt: 3999,
    colourway: "Sumi Black / Cobalt",
    swatch: "#1f4fd8",
    kanji: "蒼炎",
    romaji: "Souen",
    tagline: "The colder the flame, the hotter it burns.",
    story:
      "Drawn from the old idea that the hottest part of any fire is the blue at its base — the quiet part. The front carries a single seal; the back runs a full column of flame worked in halftone, the way it would be printed in a weekly manga.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 4 },
      { size: "S", units: 11 },
      { size: "M", units: 0 },
      { size: "L", units: 8 },
      { size: "XL", units: 6 },
      { size: "2XL", units: 2 },
    ],
    images: {
      front: "/media/products/blue-flame-front.webp",
      back: "/media/products/blue-flame-back.webp",
    },
    featured: true,
    releasedAt: "2026-07-18",
  },
  {
    slug: "demon-blood-tee",
    name: "Demon Blood Tee",
    category: "tee",
    drop: "origin",
    price: 3399,
    compareAt: 3999,
    colourway: "Sumi Black / Oxide",
    swatch: "#e23a2e",
    kanji: "鬼血",
    romaji: "Kiketsu",
    tagline: "Inherit the fight, not the curse.",
    story:
      "A study of the oni mask — the face people put on to survive a bad night. Printed with a deliberate ink bleed at the jaw so no two garments crop the mask in exactly the same place.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 2 },
      { size: "S", units: 5 },
      { size: "M", units: 9 },
      { size: "L", units: 3 },
      { size: "XL", units: 0 },
      { size: "2XL", units: 4 },
    ],
    images: {
      front: "/media/products/demon-blood-front.webp",
      back: "/media/products/demon-blood-back.webp",
    },
    featured: true,
    releasedAt: "2026-07-18",
  },
  {
    slug: "will-of-the-sun-tee",
    name: "Will Of The Sun Tee",
    category: "tee",
    drop: "origin",
    price: 3399,
    compareAt: 3999,
    colourway: "Bone / Rising Red",
    swatch: "#f2f0eb",
    kanji: "日輪",
    romaji: "Nichirin",
    tagline: "Show up before the sun does.",
    story:
      "Our only bone-coloured body. The sun disc is printed off-centre and slightly low, the way a rising sun sits when you are already awake and working before it clears the rooftops.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 6 },
      { size: "S", units: 7 },
      { size: "M", units: 12 },
      { size: "L", units: 10 },
      { size: "XL", units: 5 },
      { size: "2XL", units: 3 },
    ],
    images: {
      front: "/media/products/will-of-the-sun-front.webp",
      back: "/media/products/will-of-the-sun-back.webp",
    },
    featured: true,
    releasedAt: "2026-07-18",
  },
  {
    slug: "warrior-spirit-tee",
    name: "Warrior Spirit Tee",
    category: "tee",
    drop: "origin",
    price: 3399,
    compareAt: 3999,
    colourway: "Sumi Black / Bone",
    swatch: "#2a2d33",
    kanji: "武魂",
    romaji: "Bukon",
    tagline: "Discipline is a costume you never take off.",
    story:
      "The back print is a single continuous brush line — one stroke, no lift. We printed forty test pulls before the line held its weight from shoulder to hem.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 0 },
      { size: "S", units: 3 },
      { size: "M", units: 6 },
      { size: "L", units: 9 },
      { size: "XL", units: 4 },
      { size: "2XL", units: 1 },
    ],
    images: {
      front: "/media/products/warrior-spirit-front.webp",
      back: "/media/products/warrior-spirit-back.webp",
    },
    featured: true,
    releasedAt: "2026-07-18",
  },
  {
    slug: "bushido-tee",
    name: "Bushido Tee",
    category: "tee",
    drop: "origin",
    price: 3999,
    colourway: "Sumi Black / Steel",
    swatch: "#7c8895",
    kanji: "武士道",
    romaji: "Bushidō",
    tagline: "Seven virtues, one silhouette.",
    story:
      "The seven virtues run down the left seam in mono type, small enough that only the person wearing it knows they are there.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 3 },
      { size: "S", units: 8 },
      { size: "M", units: 14 },
      { size: "L", units: 11 },
      { size: "XL", units: 7 },
      { size: "2XL", units: 2 },
    ],
    images: { front: "/media/products/bushido-front.webp" },
    releasedAt: "2026-06-06",
  },
  {
    slug: "limitless-tee",
    name: "Limitless Tee",
    category: "tee",
    drop: "origin",
    price: 3999,
    colourway: "Sumi Black / Ultraviolet",
    swatch: "#6d4bd8",
    kanji: "無限",
    romaji: "Mugen",
    tagline: "The gap between you and it is infinite.",
    story:
      "An infinity mark rendered as a distance meter — the joke being that the closer you get, the more of the meter there is left.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 1 },
      { size: "S", units: 4 },
      { size: "M", units: 7 },
      { size: "L", units: 5 },
      { size: "XL", units: 3 },
      { size: "2XL", units: 0 },
    ],
    images: { front: "/media/products/limitless-front.webp" },
    releasedAt: "2026-06-06",
  },
  {
    slug: "water-breathing-tee",
    name: "Water Breathing Tee",
    category: "tee",
    drop: "origin",
    price: 3999,
    colourway: "Deep Navy / Foam",
    swatch: "#16304a",
    kanji: "水の呼吸",
    romaji: "Mizu no Kokyū",
    tagline: "Breathe like the tide: in, out, unbothered.",
    story:
      "Wave forms lifted from a Bondi swell chart, redrawn by hand until they read as brush strokes rather than data.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 5 },
      { size: "S", units: 9 },
      { size: "M", units: 8 },
      { size: "L", units: 6 },
      { size: "XL", units: 2 },
      { size: "2XL", units: 1 },
    ],
    images: { front: "/media/products/water-breathing-front.webp" },
    releasedAt: "2026-06-06",
  },
  {
    slug: "domain-expansion-tee",
    name: "Domain Expansion Tee",
    category: "tee",
    drop: "origin",
    price: 3999,
    colourway: "Sumi Black / Void",
    swatch: "#101114",
    kanji: "領域展開",
    romaji: "Ryōiki Tenkai",
    tagline: "Make the room yours before you walk in.",
    story:
      "A single expanding circle, printed in three passes of black on black so it only reveals itself when the light moves across you.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 0 },
      { size: "S", units: 2 },
      { size: "M", units: 4 },
      { size: "L", units: 7 },
      { size: "XL", units: 5 },
      { size: "2XL", units: 3 },
    ],
    images: { front: "/media/products/domain-expansion-front.webp" },
    releasedAt: "2026-06-06",
  },
  {
    slug: "free-soul-tee",
    name: "Free Soul Tee",
    category: "tee",
    drop: "shadow",
    price: 3999,
    colourway: "Washed Charcoal / Bone",
    swatch: "#3c3f45",
    kanji: "自由魂",
    romaji: "Jiyū Kon",
    tagline: "Nobody's protagonist but your own.",
    story:
      "Garment-dyed after printing so the graphic sits under the wash — it arrives already looking like your third-favourite tee.",
    fabric: "Garment-dyed heavyweight cotton",
    gsm: 260,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 2 },
      { size: "S", units: 6 },
      { size: "M", units: 10 },
      { size: "L", units: 8 },
      { size: "XL", units: 4 },
      { size: "2XL", units: 2 },
    ],
    images: { front: "/media/products/free-soul-front.webp" },
    releasedAt: "2026-08-22",
  },
  {
    slug: "paradise-spirit-tee",
    name: "Paradise Spirit Tee",
    category: "tee",
    drop: "shadow",
    price: 3999,
    colourway: "Sumi Black / Jade",
    swatch: "#3ba676",
    kanji: "楽園",
    romaji: "Rakuen",
    tagline: "Paradise is a place you build, badly, twice.",
    story:
      "Torii gates stacked into a skyline. Half Kyoto, half Melbourne laneway — which is roughly where this label lives.",
    fabric: "100% combed ring-spun cotton",
    gsm: 240,
    fit: "Boxy oversized, dropped shoulder",
    care: TEE_CARE,
    stock: [
      { size: "XS", units: 4 },
      { size: "S", units: 5 },
      { size: "M", units: 9 },
      { size: "L", units: 12 },
      { size: "XL", units: 6 },
      { size: "2XL", units: 3 },
    ],
    images: { front: "/media/products/paradise-spirit-front.webp" },
    releasedAt: "2026-08-22",
  },
  {
    slug: "ronin-heavyweight-hoodie",
    name: "Ronin Heavyweight Hoodie",
    category: "hoodie",
    drop: "shadow",
    price: 10999,
    colourway: "Sumi Black / Oxide",
    swatch: "#0a0a0b",
    kanji: "浪人",
    romaji: "Rōnin",
    tagline: "Masterless. Not directionless.",
    story:
      "480gsm brushed-back fleece with a double-layer hood that actually holds its shape, and a sleeve print that only reads when your arms are down.",
    fabric: "80% cotton / 20% recycled polyester fleece",
    gsm: 480,
    fit: "Oversized, ribbed hem, double-layer hood",
    care: HEAVY_CARE,
    stock: [
      { size: "XS", units: 0 },
      { size: "S", units: 3 },
      { size: "M", units: 5 },
      { size: "L", units: 6 },
      { size: "XL", units: 4 },
      { size: "2XL", units: 2 },
    ],
    images: {
      front: "/media/products/ronin-hoodie-front.webp",
      back: "/media/products/ronin-hoodie-back.webp",
    },
    featured: true,
    releasedAt: "2026-08-22",
  },
  {
    slug: "void-zip-hoodie",
    name: "Void Zip Hoodie",
    category: "hoodie",
    drop: "shadow",
    price: 11999,
    colourway: "Charcoal / Steel",
    swatch: "#2a2d33",
    kanji: "虚",
    romaji: "Kyo",
    tagline: "Zip up, disappear, keep moving.",
    story:
      "Full-zip with a storm placket and a single embroidered seal at the chest. Built for the fifteen minutes between the tram and the venue.",
    fabric: "80% cotton / 20% recycled polyester fleece",
    gsm: 450,
    fit: "Relaxed, dropped shoulder, full zip",
    care: HEAVY_CARE,
    stock: [
      { size: "XS", units: 2 },
      { size: "S", units: 4 },
      { size: "M", units: 7 },
      { size: "L", units: 5 },
      { size: "XL", units: 3 },
      { size: "2XL", units: 1 },
    ],
    images: { front: "/media/products/void-hoodie-front.webp" },
    releasedAt: "2026-08-22",
  },
  {
    slug: "shadow-cargo-pant",
    name: "Shadow Cargo Pant",
    category: "pant",
    drop: "shadow",
    price: 9999,
    colourway: "Sumi Black",
    swatch: "#17191d",
    kanji: "影",
    romaji: "Kage",
    tagline: "Six pockets. No excuses.",
    story:
      "Ripstop cargo with an adjustable hem cord, cut wide through the thigh and tapered just enough to sit on a chunky sole.",
    fabric: "Cotton ripstop with 2% elastane",
    gsm: 300,
    fit: "Wide leg, adjustable hem",
    care: HEAVY_CARE,
    stock: [
      { size: "XS", units: 1 },
      { size: "S", units: 5 },
      { size: "M", units: 8 },
      { size: "L", units: 6 },
      { size: "XL", units: 3 },
      { size: "2XL", units: 0 },
    ],
    images: { front: "/media/products/shadow-cargo-front.webp" },
    releasedAt: "2026-08-22",
  },
  {
    slug: "seal-cap",
    name: "Seal Cap",
    category: "headwear",
    drop: "origin",
    price: 3499,
    colourway: "Sumi Black / Bone stitch",
    swatch: "#0a0a0b",
    kanji: "印",
    romaji: "In",
    tagline: "The quietest way to wear the mark.",
    story:
      "Unstructured six-panel, cotton twill, with the ZENJI seal embroidered small enough to pass as a logo you invented yourself.",
    fabric: "Cotton twill, unstructured",
    gsm: 220,
    fit: "One size, adjustable strap",
    care: ["Spot clean only", "Air dry, keep the peak flat"],
    stock: [{ size: "M", units: 24 }],
    images: { front: "/media/products/seal-cap-front.webp" },
    releasedAt: "2026-06-06",
  },
];

export const drops: Record<DropId, { id: DropId; code: string; title: string; blurb: string }> = {
  origin: {
    id: "origin",
    code: "THE_ORIGIN_DROP",
    title: "The Origin Drop",
    blurb: "Ten graphics, one thesis: wear the thing you are still becoming.",
  },
  shadow: {
    id: "shadow",
    code: "SHADOW_PROTOCOL",
    title: "Shadow Protocol",
    blurb: "Heavyweight winter cuts for the walk home at 2am.",
  },
};

export const categoryLabels: Record<Category, string> = {
  tee: "Tees",
  hoodie: "Hoodies",
  pant: "Pants",
  headwear: "Headwear",
};

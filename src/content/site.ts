/** Brand-level copy and configuration. One file to rebrand the whole site. */

export const site = {
  name: "ZENJI",
  kanji: "禅時",
  tagline: "Anime streetwear, made in Naarm / Melbourne.",
  description:
    "ZENJI is an independent anime-inspired streetwear label from Melbourne. Oversized heavyweight tees and fleece, original hand-drawn graphics, limited drops, shipped Australia-wide.",
  url: "https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear",
  currency: "AUD",
  freeShippingThreshold: 10000, // cents
  studio: "Level 2, 61 Smith Street, Fitzroy VIC 3065",
  email: "hello@zenji.shop",
  socials: [
    { label: "Instagram", handle: "@zenji.au", href: "https://instagram.com" },
    { label: "TikTok", handle: "@zenji.au", href: "https://tiktok.com" },
    { label: "Discord", handle: "ZENJI // COUNCIL", href: "https://discord.com" },
  ],
} as const;

export const nav = [
  { href: "/drop", label: "Drop", note: "The full catalogue" },
  { href: "/lookbook", label: "Lookbook", note: "Shot in Fitzroy, 6am" },
  { href: "/drop-day", label: "Drop Day", note: "Live release console" },
  { href: "/fit-lab", label: "Fit Lab", note: "Find your size in 20 seconds" },
  { href: "/closet", label: "Closet", note: "Dress the figure" },
  { href: "/shrine", label: "Shrine", note: "One omikuji a day" },
  { href: "/studio", label: "Studio", note: "Cut your own card" },
  { href: "/arcade", label: "Arcade", note: "KOMA + three games" },
  { href: "/counter", label: "Counter", note: "Haggle with KAGE" },
  { href: "/origin", label: "Origin", note: "Why the label exists" },
  { href: "/support", label: "Support", note: "Shipping, returns, care" },
] as const;

export const tickerItems = [
  "NEW DROP // BLUE FLAME TEE LIVE",
  "FREE SHIPPING AU-WIDE OVER A$100",
  "SHADOW_PROTOCOL — HEAVYWEIGHT FLEECE IN STOCK",
  "PRINTED + PACKED IN NAARM / MELBOURNE",
  "AFTERPAY & ZIP AVAILABLE AT CHECKOUT",
];

/** Australian delivery promise, used on PDPs and the support page. */
export const shipping = [
  { zone: "Melbourne metro", speed: "1–2 business days", price: "A$9.95 · free over A$100" },
  { zone: "Sydney / Brisbane / Adelaide", speed: "2–4 business days", price: "A$9.95 · free over A$100" },
  { zone: "Perth / Hobart / Darwin", speed: "3–6 business days", price: "A$12.95 · free over A$100" },
  { zone: "Regional AU", speed: "4–8 business days", price: "A$12.95 · free over A$100" },
  { zone: "New Zealand", speed: "5–10 business days", price: "A$24.95 flat" },
];

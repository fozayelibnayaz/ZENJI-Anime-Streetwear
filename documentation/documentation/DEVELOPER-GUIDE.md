# Developer guide

Everything you need to change something without reading the whole codebase first.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run verify         # lint → types → unit tests → production build
```

Node 22+. No environment variables are required for local development.

## The shape of the thing

```
content  →  lib  →  components  →  app
 data      pure      presentation   routes
           logic
```

- **`src/content/*`** is plain typed data. No React, no imports from components.
- **`src/lib/*`** is pure functions over that data: filtering, sizing maths, money, dates. Unit tested.
- **`src/components/*`** renders. Anything with `useState` starts with `"use client"`.
- **`src/app/*`** is routing and metadata only — pages compose sections, they do not contain layout logic.

If you find yourself importing a component into `content` or `lib`, something has gone the wrong way round.

---

## Common tasks

### Add a product

Open `src/content/products.ts` and copy an existing entry:

```ts
{
  slug: "storm-caller-tee",        // becomes /drop/storm-caller-tee
  name: "Storm Caller Tee",
  category: "tee",                 // tee | hoodie | pant | headwear
  drop: "shadow",                  // origin | shadow
  price: 3999,                     // AUD *cents* — always integers
  compareAt: 4999,                 // optional; must be higher than price
  colourway: "Sumi Black / Storm",
  swatch: "#4a5568",
  kanji: "嵐",
  romaji: "Arashi",
  tagline: "One line that makes someone want it.",
  story: "Where the graphic came from.",
  fabric: "100% combed ring-spun cotton",
  gsm: 240,
  fit: "Boxy oversized, dropped shoulder",
  care: ["Cold wash inside out", "Hang dry", "Iron on the reverse"],
  stock: [ { size: "S", units: 6 }, { size: "M", units: 0 } ],
  images: { front: "/media/products/storm-caller-front.webp" },
  featured: false,
  releasedAt: "2026-10-02",
}
```

Drop the artwork into `art/raw/storm-caller-front.png`, run `npm run images`, and you are done:
the route, the sitemap entry, search, filters, related products and the JSON-LD are all derived.

A missing image is not fatal — the image script writes a branded placeholder so nothing ever renders
as a broken `<img>`.

### Change prices, stock or copy

All of it is in `src/content`. `products.ts` for the catalogue, `site.ts` for brand copy, nav,
shipping and the free-shipping threshold, `faq.ts`, `lookbook.ts`, `origin.ts`, `sizing.ts`, `seals.ts`.

### Change the look

Design tokens live at the top of `src/app/globals.css` inside `@theme`. Change `--color-oxide` and
every CTA, live dot and sale price in the site changes with it. The utilities `shell`, `gutter`,
`label`, `display` and `hairline` are defined in the same file.

Fonts are self-hosted variable `woff2` files in `src/fonts`, wired up with `next/font/local` in
`src/app/layout.tsx`. To swap a typeface, replace the file and the `localFont` call.

### Add a page

Create `src/app/<route>/page.tsx`, export `metadata`, add the route to `nav` in `src/content/site.ts`
and to the list in `src/app/sitemap.ts`. That is the whole checklist.

### Add an overlay

Extend the `Overlay` union in `src/providers/UIProvider.tsx`, then build the panel on top of
`components/ui/Sheet.tsx` — it already handles the backdrop, focus trap, `Esc`, scroll locking and
the entrance animation. Mount it once in `src/app/layout.tsx`.

### Extend the Closet

The Closet is data-driven the same way the catalogue is. Add new weather looks by appending to
`weatherScenarios` in `src/lib/wardrobe.ts` (a scenario is just a list of real product slugs in stack
order — the resolver checks they exist). Frames and presentations are declared in the same file and
only affect the figure's proportions; garment placement is derived from the size chart, never hardcoded.

The figure itself is `src/components/closet/DressStage.tsx`. It draws a 300×640 wireframe figure and
overlays each garment's flat-lay image, scaled so one size-chart centimetre equals `STAGE_SCALE`
pixels. That single invariant is why an S and a 2XL render at genuinely different sizes. The console
that drives it (`ClosetConsole.tsx`) has three modes — try on, stack, weather — all reusing the same
stage.

To add a new category, extend `CATEGORY_PLACEMENT` in `src/lib/wardrobe.ts` with a zone
(`torso` | `legs` | `head`), then make sure a size chart exists for it in `src/content/sizing.ts`.

---

## Conventions

- **TypeScript strict, no `any`.** Content shapes are exported interfaces; components take typed props.
- **Money is integer cents.** Format only at the edge with `formatPrice`.
- **Animation is `transform`, `opacity` and `clip-path` only.** Nothing that triggers layout.
- **No animation library.** `Reveal`, `usePointerSlash`, `useScrollProgress` and `useScrollVelocity`
  cover everything the site does, in a few hundred lines total.
- **Client state is derived, not duplicated.** Filters live in the URL; the selected size is derived
  from the Fit Lab result plus the user's explicit choice.
- **Images** always go through `components/ui/Img.tsx`, which applies the deployment base path.
- **Comments explain why, not what.**

## Testing

```bash
npm run test                        # Vitest — sizing algorithm, catalogue queries, money, dates, content integrity
npx playwright install chromium     # once
npm run test:e2e                    # Playwright — desktop + Pixel 7 projects against the built export
```

E2E covers: browse → quick view → add to cart → drawer, cart persistence across a reload, shareable
filter URLs, the empty-filter state, the Fit Lab saving a size and it appearing on a product page,
console search and navigation, `Esc` handling, keyboard control of the hero, one `h1` per route, no
console errors, the 404, the mobile menu and the sticky buy bar.

## Performance rules of thumb

- Keep the homepage first-load JS under ~110KB gzipped. Check with `npm run build`.
- Only the hero and the first two product cards are `priority`; everything else lazy loads.
- Long sections carry `.defer-paint` (`content-visibility: auto`) so offscreen work is skipped.
- New raw art goes through `npm run images` — never commit a PNG into `public`.

## Deployment

This repo publishes to GitHub Pages from the **`docs/` folder** on the working branch (Pages is
configured as "branch + /docs", not Actions — the token for this repo cannot push workflow files). The
one-command path is:

```bash
npm run deploy:pages   # lint → typecheck → unit tests → build with base path → republish /docs
```

`scripts/build-pages.mjs` runs `next build`, wiping and refilling `docs/`, and writes `.nojekyll`.
The base path is resolved in this order: the `NEXT_PUBLIC_BASE_PATH` env var if set, otherwise the
repository name from `git remote get-url origin` (so the project keeps working if it is renamed or
forked — e.g. `/ZENJI-Anime-Streetwear`), otherwise a hardcoded fallback. Everything in `docs/` is
generated — never hand-edit it.
A reference GitHub Actions workflow lives at `documentation/github-actions-deploy.yml.example` if you want
to move to Actions later (the token here is blocked from creating `.github/workflows/**`).

For a root-domain host (e.g. Vercel), build with `NEXT_PUBLIC_BASE_PATH` unset and serve `out/`.

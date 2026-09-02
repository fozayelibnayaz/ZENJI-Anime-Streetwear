# ZENJI — Developer Guide

Static Next.js 16 (App Router) + Tailwind v4 + vitest. No backend: all state is client-side via
`usePersistentState` (localStorage, SSR-safe hydration flags).

## State & providers

- `src/providers/` — LoadoutProvider (bag), PreferencesProvider (size/frame/motion), UIProvider
  (overlays, toasts).
- `src/lib/cred.ts` — street cred ledger + levels; `useCred().earn(why, pts)`.
- `src/hooks/usePersistentState.ts` — the single persistence primitive. Everything stored goes
  through it; keys are `zenji.*.v1`.
- `src/lib/members.ts` + `src/hooks/useMember.ts` — house list. `DATA_KEYS` lists the eight stores
  that snapshot/restore on sign-in/out; swap this module for a cloud provider later without
  touching UI.

## Money & sizes

- All prices are AUD **cents**; format once via `formatPrice`.
- `src/content/sizing.ts` — per-category charts (chest = pit-to-pit). `src/lib/wardrobe.ts` turns
  charts + body frame into stage geometry (`cmToPx`, `STAGE_W/H`).

## The fitting room (`src/components/closet/`)

- `DressStage.tsx` renders garments as **clip-path silhouettes** (`CLIPS` per category, % of the
  photo box) over a 300×640 wireframe; z-order pant < tee < hoodie < cap; placement derives from
  the size chart so sizes render truthfully. Tune `CLIPS` if new product photography needs it.
- `ClosetArcade.tsx` — the rail with spring physics (rAF, direct style writes, no re-renders),
  slots, and Style Roulette.

## The Counter (`src/lib/counter.ts`)

Pure + seeded: `hash`/`mulberry` derive everything from (day, slug, round) — no runtime RNG, so
tests and shoppers see the same KAGE. `openDeal → applyMove/shake → discountPct/credFor`.
UI: `src/components/counter/CounterGame.tsx` (mood-driven SVG portrait).

## Arcade

`src/content/arcade.ts` + `src/components/arcade/*`, scores in `zenji.arcade.*`. Versus logic in
`src/lib/versus.ts`.

## Adding a product

1. `src/content/products.ts` — slug, name, category, price, images, prints.
2. Drop WebP art in `public/media/products/` (`-front.webp` etc.).
3. Add a sizing row if the category chart needs it. Everything else (drop, closet, counter,
  arcade dress-up) picks it up automatically.

## Quality gates

```bash
npm test           # 88 vitest tests over every pure module
npm run lint       # eslint 9 flat config, 0 errors
npm run typecheck  # strict tsc
```

## Building the Pages export

```bash
NEXT_PUBLIC_BASE_PATH=/ZENJI-Anime-Streetwear npm run build
rm -rf docs && mkdir docs && cp -R out/. docs/ && touch docs/.nojekyll
```

`NEXT_PUBLIC_BASE_PATH` makes asset URLs work under the repo-name sub-path; `.nojekyll` stops
GitHub Pages from stripping `_next/`. Dev-only `allowedDevOrigins` in `next.config.ts` keeps the
sandbox preview's HMR alive; it does not affect the export.

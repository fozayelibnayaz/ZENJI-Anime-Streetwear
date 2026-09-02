# ZENJI 禅時 — Anime Streetwear, Melbourne

A frontend concept build for **ZENJI**, an independent anime-inspired streetwear label selling into
the Australian market. Static Next.js (App Router) + Tailwind, no backend, deployable to GitHub Pages.

**Concept storefront:** https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/ (after you deploy `docs/`)

---

## What is inside (Chapters 01–06)

| Area | Route | What it does |
|---|---|---|
| Showroom | `/` `/drop` `/lookbook` | catalogue, lookbook, hero |
| Drop Day | `/drop-day` | live release console with countdown |
| Fit Lab | `/fit-lab` | size finder from two measurements, per-product charts |
| Closet | `/closet` | digital fitting room: garments render as **worn silhouettes**, size-true XS–2XL, physical layering, outfit slots, **Style Roulette** |
| Shrine | `/shrine` | one omikuji fortune a day |
| Studio | `/studio` | member card designer + export |
| Arcade | `/arcade` | KOMA the street cat, Slash the Drop, Versus ring, Tag Wall |
| Counter | `/counter` | haggle with KAGE the salesman: mood, bluffs, walk-aways, rank leverage |
| House List | `/account` | **sign up / sign in** — per-member cred, loadout, slots, slips (browser-stored, salted+hashed passcodes) |
| Support/Origin | `/support` `/origin` | FAQ, care, story |

All characters (KOMA, KAGE, KIRA) are original — no licensed IP. The concierge clerk is opt-in only.

## Quick start

```bash
npm ci
npm run dev        # http://localhost:3000
npm test           # 88 unit tests
npm run lint       # eslint, 0 errors
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Project structure

```
src/app            routes (one folder per page)
src/components     per-feature components (closet/, counter/, members/, arcade/, …)
src/lib            pure logic: wardrobe, counter, cred, members, drop, dna, …
src/content        data: products, sizing charts, site copy, arcade, floorwalker
src/providers      loadout / preferences / UI state
public/media       product + hero photography (optimised WebP)
tests/unit         vitest suites for every pure module
docs/              BUILT static site (GitHub Pages source) — regenerated, do not edit
```

## Deploy

- **GitHub Pages:** push this repo with `docs/` present; Settings → Pages → branch `main`, folder `/docs`.
  `docs/` already contains `.nojekyll` (required, or Pages strips `_next/`).
  See `DEPLOYMENT-NOTES.md` for the exact copy/push recipe and failure checklist.
- **Vercel / any host:** deploy the *source* (not `docs/`); framework Next.js; optional
  `NEXT_PUBLIC_BASE_PATH` for sub-path installs. See `VERCEL-NOTES.md`… (inside earlier bundles) / `DEPLOYMENT-NOTES.md`.

Regenerate `docs/` from source:

```bash
NEXT_PUBLIC_BASE_PATH=/ZENJI-Anime-Streetwear npm run build
rm -rf docs && mkdir docs && cp -R out/. docs/ && touch docs/.nojekyll
```

## Documents

- `documentation/USER-MANUAL.md` — shopper walkthrough of every page.
- `documentation/DEVELOPER-GUIDE.md` — architecture, how to extend (products, sizes, games).
- `DEPLOYMENT-NOTES.md` — making the live site current on GitHub Pages.

## House rules baked into the code

1. Original characters and prints only.
2. Concierge is opt-in (the bell), never auto-opens.
3. Size honesty: the figure on `/closet` is literally the size chart, not an illustration.

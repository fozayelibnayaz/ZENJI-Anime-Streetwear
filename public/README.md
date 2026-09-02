# ZENJI — anime streetwear storefront

A frontend concept build for **ZENJI**, an independent anime-inspired streetwear label selling into
the Australian market. Static Next.js, no backend, deployed to GitHub Pages.

**Live:** https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/

---

## What is in here

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) · React 19 · TypeScript strict |
| **Styling** | Tailwind CSS v4 (CSS-first tokens) + a small amount of hand-written CSS for the print textures |
| **Animation** | None — no library. Hand-written hooks over `IntersectionObserver`, `requestAnimationFrame` and CSS `clip-path` |
| **State** | Three React contexts with `useSyncExternalStore`-backed persistence |
| **Data** | Typed content modules under `src/content` — a designer can change a product without touching a component |
| **Tests** | Vitest (45 unit tests) + Playwright (desktop and mobile e2e) |
| **Output** | `next build` → fully static `out/`, deployed by GitHub Actions |

## Features

- **Interactive hero** — drag a katana cut across the garment to reveal the back print. Mouse follows
  on hover, touch follows a drag, arrow keys move it in steps, and it animates itself until you touch it.
- **Fit Lab** — measure a tee you already own and get your ZENJI size, a boxiness score and the
  centimetre difference for every size. The answer follows you into product pages and the cart.
- **The Origin** — the brand story as vertical manga scrollytelling; degrades to a clean article
  when motion is reduced.
- **Drop Day console** — fortnightly countdown converted into the visitor's own timezone, a release
  queue simulation, a live stock board and a kanji "seal test" that unlocks early access.
- **SYSTEM console** — ⌘K / Ctrl+K (or `/`) opens one input that searches products, jumps between
  pages, opens the size guide, switches units and toggles animation.
- **Commerce** — loadout drawer with localStorage persistence and undo, quick view, URL-synced
  filters, saved items, shoppable lookbook hotspots, sticky mobile buy bar, size guide.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production static export into `out/` |
| `npm run lint` | ESLint (Next core-web-vitals + React Compiler rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit suite |
| `npm run test:e2e` | Playwright e2e against the built export (`npx playwright install chromium` first) |
| `npm run images` | Compress `art/raw/*.png` into WebP under `public/media` |
| `npm run verify` | lint → typecheck → unit tests → build |

## Project layout

```
src/
  app/            routes (App Router), metadata, sitemap, robots
  components/
    commerce/     product cards, gallery, purchase panel, cart, quick view, console
    dropday/      release queue, stock board, seal test
    fitlab/       sizing tool and SVG garment silhouettes
    home/         homepage sections
    layout/       header, footer, newsletter
    lookbook/     shoppable editorial
    origin/       manga scrollytelling
    support/      FAQ browser, contact form
    ui/           Reveal, Sheet, Marquee, Disclosure, Action, Img, Toaster
  content/        products, sizing, lookbook, origin, faq, seals, site copy
  hooks/          useInView, useScrollProgress, usePointerSlash, useFocusTrap, …
  lib/            catalogue queries, fit algorithm, money, drop schedule, asset paths
  providers/      LoadoutProvider, PreferencesProvider, UIProvider
art/raw/          uncompressed source art (git-ignored, never deployed)
documentation/  user manual, developer guide, design decisions
docs/           generated static build published by GitHub Pages (see Deployment)
tests/            unit (Vitest) and e2e (Playwright)
```

## Deployment

GitHub Pages serves this branch from the `/docs` folder, which holds the generated static build.
Regenerate it with:

```bash
npm run deploy:pages    # verify + build with the repo base path + copy out/ into docs/
```

> **⚠️ Pages must point at `/docs`, not the repository root.**
> In the repo: **Settings → Pages → Build and deployment → Source = "Deploy from a branch"**,
> then **Branch = `main`, Folder = `/docs`**, and Save. If the folder is left as `/ (root)`,
> Pages renders the `README.md` instead of the storefront.
>
> The base path is derived from the repository name automatically (here `/ZENJI-Anime-Streetwear`),
> so the same code deploys correctly if the repo is renamed or forked. To override, export
> `NEXT_PUBLIC_BASE_PATH` before building.

`documentation/github-actions-deploy.yml.example` contains the equivalent GitHub Actions workflow
(lint → typecheck → tests → export → deploy) for repositories where CI can publish Pages directly.

To host the site anywhere else, run `npm run build` with `NEXT_PUBLIC_BASE_PATH` unset and upload `out/`.

## Documentation

- [`documentation/USER-MANUAL.md`](documentation/USER-MANUAL.md) — illustrated walkthrough of every feature
- [`documentation/DEVELOPER-GUIDE.md`](documentation/DEVELOPER-GUIDE.md) — how to add a product, change tokens, extend the site
- [`documentation/DECISIONS.md`](documentation/DECISIONS.md) — why it is built this way

## Notes

Frontend only: there is no backend, database, auth or payment integration. Checkout, the newsletter
and the contact form are wired up to real validation and states but say plainly that nothing is sent.
Product photography is art-directed placeholder imagery produced for this concept build.
# ZENJI-Anime-Streetwear

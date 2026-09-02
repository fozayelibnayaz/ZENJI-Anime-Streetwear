# Deployment notes — ZENJI-Anime-Streetwear

## Why the site once showed the README instead of the storefront

Two bugs combined:

1. **GitHub Pages source folder was `/ (root)` instead of `/docs`** — no `index.html`
   at the root, so Pages rendered `README.md`.
2. **The static build was compiled for the wrong base path** — the old
   `build-pages.mjs` hardcoded `/ZENJI-Anime-Streetwear-Australia`, so every asset
   URL 404'd under `/ZENJI-Anime-Streetwear/`.

Both fixed: base path is now auto-derived from the repo name (`NEXT_PUBLIC_BASE_PATH`
env → `git remote` repo name → fallback), and this bundle's `docs/` is rebuilt for
`/ZENJI-Anime-Streetwear`.

## Publish to GitHub Pages (2 minutes)

1. Push this bundle to the `ZENJI-Anime-Streetwear` repo:
   ```bash
   bash PUSH-TO-GITHUB.sh
   ```
2. GitHub: **Settings → Pages → Deploy from a branch → `main` + `/docs` → Save**.
3. Open https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/ (~1 min build).

## Publish to Vercel (zero config)

1. vercel.com → **Add New… → Project** → import the repo.
2. Framework preset: **Next.js** (auto). **No env vars** — base path stays empty on
   a Vercel domain.
3. Deploy; every push redeploys. `vercel.json` keeps trailing-slash routing.

## The Showroom Update (this bundle)

New rooms, all static and stored on-device:

- **The Floorwalker** — opt-in clerk (ring the bell). Asks three questions + your
  Fit DNA, pulls three pieces, can hang them in your loadout.
- **The Shrine** (`/shrine`) — one omikuji a day: shake the cylinder, unroll the
  paper, get a seal code that rides in your loadout until midnight.
- **Card Studio** (`/studio`) — direct a 4:5 editorial card (backdrop, piece, seal,
  caption) and export a 1080×1350 PNG.
- **Inspect-360** (product pages) — drag-spin turntable with inertia, 2.5× fabric
  loupe, and a stitch X-ray drawn from the live size chart.
- **Fit DNA** (Fit Lab) — five-question taste pentagon; match % follows you across
  the store and feeds the Floorwalker.
- **Closet Arcade** (Closet) — physical hanger rail (spring physics), three outfit
  save slots, and **street cred** XP with ranks (Genji → Ukiyo Legend).

### Chapter 04 — The Arcade (`/arcade`)

- **KOMA** — original anime street cat mascot: cursor-tracking eyes, moods, and
  he wears any print from the catalogue (famous licensed characters are a no —
  rule 01, original art only).
- **Slash the Drop** — fruit-slicer mini-game: blade trail, combos, bootleg
  crates, 45s rounds; score converts to street cred.
- **The Versus** — two looks enter the ring; crowning one teaches the
  Floorwalker your taste.
- **The Wall** — spray + stencil tag wall with PNG export.

Quality gates at packaging time: lint 0 errors · `tsc --noEmit` clean · 67/67 unit
tests · every route 200 in the dev sandbox.

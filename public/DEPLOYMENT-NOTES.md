# Deployment notes — ZENJI-Anime-Streetwear

## Why the site showed the README instead of the storefront

Two separate bugs combined:

1. **GitHub Pages source folder was `/ (root)` instead of `/docs`.**
   There is no `index.html` at the repo root, so Pages fell back to rendering
   `README.md` — which is exactly what you saw.

2. **The static build in `docs/` was built for the wrong base path.**
   `scripts/build-pages.mjs` hardcoded `/ZENJI-Anime-Streetwear-Australia`, so
   every one of the ~180 asset URLs in the built pages pointed at the old repo's
   path and would have 404'd under `…/ZENJI-Anime-Streetwear/`.

## What was fixed in this bundle

- `scripts/build-pages.mjs` now resolves the base path automatically:
  `NEXT_PUBLIC_BASE_PATH` env var → else the repo name from `git remote get-url origin`
  → else a hardcoded fallback. The same code now deploys correctly to any repo name.
- `docs/` rebuilt from this repo's source with base path `/ZENJI-Anime-Streetwear`
  (verified: 0 references to the old path, all 27 routes + assets return 200).
- Canonical URL in `src/content/site.ts`, README and documentation updated to
  `https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/`.
- lint, `tsc --noEmit` and all 55 unit tests pass.

## How to publish (2 minutes)

1. Push this bundle to the `ZENJI-Anime-Streetwear` repo (replacing its contents).
2. On GitHub: **Settings → Pages → Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **`main`** — Folder: **`/docs`** — **Save**
3. Wait ~1 minute for the build, then open
   https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/

## Rebuilding later

```bash
npm install
npm run deploy:pages   # lint → typecheck → tests → build with the repo's base path → republish docs/
```

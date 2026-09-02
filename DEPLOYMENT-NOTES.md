# ZENJI — Deployment Notes (GitHub Pages)

The live concept site is the `docs/` folder of this repo, served by GitHub Pages from
**branch `main`, folder `/docs`**. The `docs/` shipped in this project is the exact build that
runs in the development sandbox — same pages, same build id (see the manifest / view-source).

## One-time Pages setting

Repo → **Settings → Pages → Build and deployment** → Source: *Deploy from a branch* →
Branch: `main` · Folder: `/docs` → Save.

## Making your live site current (exact recipe)

```bash
# 1. fresh clone
git clone https://github.com/fozayelibnayaz/ZENJI-Anime-Streetwear.git zenji-deploy
cd zenji-deploy

# 2. wipe everything except .git
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# 3. copy the CONTENTS of the unzipped project folder (trailing "/." = inside)
cp -R /path/to/unzipped-folder/. .

# 4. sanity check — all three must print, no errors
ls docs/index.html docs/.nojekyll src/app/account/page.tsx

# 5. commit + push
git add -A
git commit -m "ZENJI complete project"
git push origin main
```

Then wait ~1 minute and **hard-refresh** (Cmd/Ctrl+Shift+R). github.io is CDN-cached.

## Why a push can look like "nothing changed"

1. **Nested folder** — you copied the folder itself, so files landed at `ZENJI-…/docs/…` instead
   of `docs/…`. Steps 2–3 above prevent this.
2. **Old docs not deleted** — stale `_next` builds linger; index.html then points at chunks that
   may or may not exist. Wipe `docs/` first (step 2 does).
3. **Pages setting wrong** — anything other than `main` + `/docs` serves something else entirely.
4. **Missing `.nojekyll`** — without it Pages strips `_next/` and the site loads unstyled/old.
   This project ships `.nojekyll` inside `docs/`.
5. **Cache** — hard-refresh, or append `?v=2` once.

## Verify it landed

- View-source contains the build id printed in the downloads page / MANIFEST (`_next/static/<id>/`).
- Nav shows COUNTER and a Sign-in chip; `/account`, `/counter`, `/arcade` load.

## Vercel instead of Pages

Import the **source** (not `docs/`) into Vercel; preset Next.js; no env vars for a root domain.
Only set `NEXT_PUBLIC_BASE_PATH` for sub-path deploys. `docs/` is Pages-only.

#!/usr/bin/env bash
# Pushes this fixed project to your ZENJI-Anime-Streetwear repo.
# Run from inside the unzipped folder (next to this script):
#   bash PUSH-TO-GITHUB.sh
set -euo pipefail

REPO="https://github.com/fozayelibnayaz/ZENJI-Anime-Streetwear.git"

git init -q
git add -A
git commit -q -m "Fix Pages build: correct base path /ZENJI-Anime-Streetwear + rebuild docs"
git branch -M main
git remote add origin "$REPO" 2>/dev/null || git remote set-url origin "$REPO"
git push -f origin main

echo
echo "Pushed ✔"
echo "1) Repo → Settings → Pages → Source: Deploy from a branch → main + /docs (already set, keep it)"
echo "2) Open https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/ (allow ~1 min for the Pages build)"

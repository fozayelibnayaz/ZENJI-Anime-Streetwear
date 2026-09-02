/**
 * Publishes the static export into /docs, which is what GitHub Pages serves for
 * this repository (Pages is configured as "branch + /docs" rather than Actions).
 *
 *   npm run deploy:pages
 *
 * Base path resolution (first match wins):
 *   1. NEXT_PUBLIC_BASE_PATH env var — explicit override.
 *   2. The repository name from `git remote get-url origin`, so the same code
 *      keeps working if the project is renamed or forked (e.g. pushed to
 *      ZENJI-Anime-Streetwear instead of ZENJI-Anime-Streetwear-Australia).
 *   3. The hardcoded fallback below.
 */
import { cp, mkdir, rm, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "out");
const DOCS = path.join(ROOT, "docs");

function repoBasePath() {
  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .replace(/\/+$/, "");
    const name = url.split("/").pop()?.replace(/\.git$/, "");
    if (name) return `/${name}`;
  } catch {
    // Not inside a git checkout (e.g. a downloaded zip) — use the fallback.
  }
  return null;
}

const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ?? repoBasePath() ?? "/ZENJI-Anime-Streetwear-Australia";

execFileSync("npx", ["next", "build"], {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: BASE_PATH },
});

await rm(DOCS, { recursive: true, force: true });
await mkdir(DOCS, { recursive: true });
await cp(OUT, DOCS, { recursive: true });

// Without this, Pages runs the output through Jekyll and drops _next/.
await writeFile(path.join(DOCS, ".nojekyll"), "");

const entries = await readdir(DOCS);
process.stdout.write(`\nPublished ${entries.length} entries to /docs with base path "${BASE_PATH}".\n`);

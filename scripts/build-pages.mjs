/**
 * Publishes the static export into /docs, which is what GitHub Pages serves for
 * this repository (Pages is configured as "branch + /docs" rather than Actions).
 *
 *   npm run deploy:pages
 */
import { cp, mkdir, rm, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "out");
const DOCS = path.join(ROOT, "docs");
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/ZENJI-Anime-Streetwear-Australia";

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

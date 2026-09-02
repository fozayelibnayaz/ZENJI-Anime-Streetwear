/**
 * Image pipeline.
 *
 * Source art lives in /art/raw as PNG, outside the public folder so the
 * uncompressed originals are never deployed. this script compresses every source into a web-sized WebP under
 * public/media/<group>/ and, so the site never ships a broken <img>, writes a
 * branded placeholder for any path the catalogue expects but the art team has
 * not delivered yet.
 *
 *   npm run images
 */
import { mkdir, readdir, readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW = path.join(ROOT, "art/raw");
const OUT = path.join(ROOT, "public/media");

/** Where each raw file ends up, matched by filename prefix. */
const GROUPS = [
  { match: (name) => name.startsWith("hero-"), dir: "hero", rename: (name) => `slash-${name.replace("hero-", "")}` },
  { match: (name) => name.startsWith("look-"), dir: "lookbook", rename: (name) => name },
  { match: (name) => name.startsWith("panel-"), dir: "origin", rename: (name) => name },
  { match: () => true, dir: "products", rename: (name) => name },
];

const TARGET_WIDTH = 1200;
const QUALITY = 74;

async function exists(file) {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function optimise() {
  const files = (await readdir(RAW)).filter((name) => /\.(png|jpe?g)$/i.test(name));
  let written = 0;

  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const group = GROUPS.find((candidate) => candidate.match(base));
    const dir = path.join(OUT, group.dir);
    await mkdir(dir, { recursive: true });

    const target = path.join(dir, `${group.rename(base)}.webp`);
    await sharp(path.join(RAW, file))
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(target);

    written += 1;
    process.stdout.write(`  ✓ ${path.relative(ROOT, target)}\n`);
  }

  return written;
}

/** Dark, on-brand stand-in so a missing asset degrades instead of breaking. */
async function placeholder(target, label) {
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1250">
      <rect width="1000" height="1250" fill="#17191d"/>
      <g stroke="#2a2d33" stroke-width="1">
        ${Array.from({ length: 25 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="1000" y2="${i * 50}"/>`).join("")}
      </g>
      <rect x="60" y="60" width="880" height="1130" fill="none" stroke="#2f333a"/>
      <rect x="420" y="600" width="160" height="2" fill="#e23a2e"/>
      <text x="60" y="1220" fill="#7c8895" font-family="monospace" font-size="26" letter-spacing="4">${label}</text>
    </svg>`);

  await sharp(svg).webp({ quality: 70 }).toFile(target);
}

async function fillGaps() {
  // Read the paths straight out of the content modules rather than importing
  // TypeScript from Node — the source of truth stays in one place either way.
  const contentDir = path.join(ROOT, "src/content");
  const sources = await readdir(contentDir);
  const wanted = new Set();

  for (const file of sources) {
    const text = await readFile(path.join(contentDir, file), "utf8");
    for (const match of text.matchAll(/"(\/media\/[^"]+\.webp)"/g)) wanted.add(match[1]);
  }

  let made = 0;
  for (const relative of wanted) {
    const target = path.join(ROOT, "public", relative.replace(/^\//, ""));
    if (await exists(target)) continue;
    await mkdir(path.dirname(target), { recursive: true });
    await placeholder(target, path.basename(target, ".webp").toUpperCase());
    made += 1;
    process.stdout.write(`  · placeholder ${path.relative(ROOT, target)}\n`);
  }
  return made;
}

const optimised = await optimise();
const placeholders = await fillGaps();
process.stdout.write(`\n${optimised} images optimised, ${placeholders} placeholders generated.\n`);

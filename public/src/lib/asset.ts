/**
 * Static exports of a Next app can live under a sub-path (GitHub project pages
 * serve this repo from a project sub-path, e.g. /ZENJI-Anime-Streetwear/). `next/image` with
 * `unoptimized: true` passes the src through untouched, so anything we point at
 * /public has to be prefixed ourselves.
 *
 * The value is inlined at build time, which means zero runtime cost.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  if (!BASE_PATH) return path;
  // Leave absolute URLs and data URIs alone.
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${BASE_PATH}${path}`;
}

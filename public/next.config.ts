import type { NextConfig } from "next";

/**
 * The site ships as a fully static bundle so it can live on GitHub Pages (or any
 * CDN) with zero server cost. When it is served from a project page the whole app
 * sits under /<repo>, so the base path is injected by CI instead of hardcoded —
 * local dev then keeps clean "/" URLs.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // GitHub Pages resolves /drop/ to /drop/index.html; without this it 404s.
  trailingSlash: true,
  images: {
    // No Next image server exists in a static export — assets are pre-compressed
    // to AVIF/WebP at build time in scripts/optimise-images.mjs instead.
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // The sandbox preview is served from an *.e2b.app proxy host. Without this the
  // dev server blocks the page's HMR/client requests as "cross-origin", which
  // silently kills client-side interactivity (buttons stop responding). The
  // production static export is unaffected by this dev-only setting.
  allowedDevOrigins: ["3111-i7x2a91k6upp1qcexsfbu.e2b.app", "*.e2b.app"],
};

export default nextConfig;

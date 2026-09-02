"use client";

import { useMemo } from "react";
import { withBasePath } from "@/lib/asset";
import {
  bodyFor,
  cmToPx,
  pxToPct,
  CATEGORY_PLACEMENT,
  STAGE_W,
  STAGE_H,
  type Body,
  type DressLayer,
  type Frame,
  type Presentation,
} from "@/lib/wardrobe";
import { sizeCharts } from "@/content/sizing";
import type { Category } from "@/content/products";
import { cx } from "@/lib/cx";

/**
 * THE CLOSET — the dress figure.
 *
 * A fixed 300×640 wireframe figure with the garment photography draped on it.
 * Each photo is clipped to a garment-shaped silhouette (tee / hoodie / pant /
 * cap) sized from the live size chart, so the concrete backdrop of the
 * flat-lays disappears and the pieces hang on the body like real clothing —
 * an S and a 2XL genuinely sit differently. Layers stack physically:
 * pants under tees, tees under hoodies, cap on top.
 */

const HEAD_CY = 50;
const HEAD_RX = 30;
const HEAD_RY = 34;
const SHOULDER_Y = 94;
const HIPS_Y = 296;
const ANKLE_Y = 606;

/** Y (stage px) where each zone starts — used to anchor overlays. */
const ZONE_Y: Record<"torso" | "legs" | "head", number> = {
  head: 20,
  torso: 92,
  legs: 294,
};

/**
 * Garment silhouettes, in % of the flat-lay photo box. They trim the concrete
 * backdrop away and give each piece its worn shape on the figure.
 */
const CLIPS: Record<Category, string> = {
  tee: "polygon(40% 12%, 28% 16%, 8% 36%, 14% 52%, 30% 46%, 31% 90%, 35% 93%, 65% 93%, 69% 90%, 70% 46%, 86% 52%, 92% 36%, 72% 16%, 60% 12%, 50% 15%)",
  hoodie:
    "polygon(50% 5%, 40% 8%, 34% 12%, 26% 20%, 10% 32%, 12% 72%, 24% 74%, 28% 50%, 30% 92%, 36% 95%, 64% 95%, 70% 92%, 72% 50%, 76% 74%, 88% 72%, 90% 32%, 74% 20%, 66% 12%, 60% 8%)",
  pant: "polygon(33% 10%, 67% 10%, 71% 32%, 70% 52%, 66% 95%, 54% 96%, 51% 52%, 49% 52%, 46% 96%, 34% 95%, 30% 52%, 29% 32%)",
  headwear:
    "polygon(50% 10%, 68% 14%, 80% 26%, 84% 42%, 80% 54%, 68% 62%, 56% 66%, 44% 66%, 32% 62%, 20% 54%, 16% 42%, 20% 26%, 32% 14%)",
};

/** Draw order so outer layers win: pants < tee < hoodie < cap. */
const Z_ORDER: Record<Category, number> = {
  pant: 10,
  tee: 20,
  hoodie: 30,
  headwear: 40,
};

interface Placed {
  left: number;
  top: number;
  width: number;
  height: number;
  z: number;
  clip: string;
}

/** Photo-box geometry per category, derived from the size chart. */
function placement(layer: DressLayer): Placed {
  const { product, size } = layer;
  const chart = sizeCharts[product.category];
  const spec = chart.find((entry) => entry.size === size) ?? chart[0];
  const zone = CATEGORY_PLACEMENT[product.category].zone;

  if (zone === "head") {
    const width = 132;
    const height = 116;
    return { left: 150 - width / 2, top: 8, width, height, z: Z_ORDER.headwear, clip: CLIPS.headwear };
  }

  if (zone === "legs") {
    const waist = cmToPx(spec.chest); // pants chart stores waist in `chest`
    const width = waist * 1.7;
    const height = cmToPx(spec.length) * 1.12;
    return {
      left: 150 - width / 2,
      top: ZONE_Y.legs - height * 0.06,
      width,
      height,
      z: Z_ORDER.pant,
      clip: CLIPS.pant,
    };
  }

  // torso (tee / hoodie) — anchored at the shoulder line
  const chest = cmToPx(spec.chest);
  const width = chest * (product.category === "hoodie" ? 1.75 : 1.7);
  const height = cmToPx(spec.length) * (product.category === "hoodie" ? 1.3 : 1.25);
  return {
    left: 150 - width / 2,
    top: ZONE_Y.torso - height * 0.1,
    width,
    height,
    z: product.category === "hoodie" ? Z_ORDER.hoodie : Z_ORDER.tee,
    clip: product.category === "hoodie" ? CLIPS.hoodie : CLIPS.tee,
  };
}

function FigureSvg({ body }: { body: Body }) {
  const shoulderHalf = cmToPx(body.shoulderCm) / 2;
  const hipHalf = cmToPx(body.hipCm) / 2;

  return (
    <svg
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full text-bone/70"
      fill="none"
      stroke="currentColor"
    >
      {/* head */}
      <ellipse cx="150" cy={HEAD_CY} rx={HEAD_RX} ry={HEAD_RY} strokeWidth="1.5" className="text-bone/80" />
      {/* neck */}
      <line x1="145" y1={SHOULDER_Y - 14} x2="155" y2={SHOULDER_Y - 14} strokeWidth="1" className="text-bone/40" />
      <line x1="150" y1="74" x2="150" y2={SHOULDER_Y} strokeWidth="1.4" />
      {/* torso */}
      <polygon
        points={`${150 - shoulderHalf},${SHOULDER_Y} ${150 + shoulderHalf},${SHOULDER_Y} ${150 + hipHalf},${HIPS_Y} ${
          150 - hipHalf
        },${HIPS_Y}`}
        strokeWidth="1.4"
      />
      {/* arms */}
      <line
        x1={150 - shoulderHalf}
        y1={SHOULDER_Y + 2}
        x2={150 - shoulderHalf - 10}
        y2={ANKLE_Y - 320}
        strokeWidth="15"
        strokeLinecap="round"
        className="text-bone/60"
      />
      <line
        x1={150 + shoulderHalf}
        y1={SHOULDER_Y + 2}
        x2={150 + shoulderHalf + 10}
        y2={ANKLE_Y - 320}
        strokeWidth="15"
        strokeLinecap="round"
        className="text-bone/60"
      />
      {/* legs */}
      <line x1={150 - 15} y1={HIPS_Y + 2} x2={150 - 15} y2={ANKLE_Y - 8} strokeWidth="26" strokeLinecap="round" />
      <line x1={150 + 15} y1={HIPS_Y + 2} x2={150 + 15} y2={ANKLE_Y - 8} strokeWidth="26" strokeLinecap="round" />
      {/* feet */}
      <rect x="118" y={ANKLE_Y - 4} width="34" height="12" rx="5" />
      <rect x="148" y={ANKLE_Y - 4} width="34" height="12" rx="5" />
    </svg>
  );
}

interface DressStageProps {
  layers: DressLayer[];
  presentation: Presentation;
  frame: Frame;
  className?: string;
  /**
   * Optional second size to ghost behind the worn one. Lets a shopper see the
   * same garment at, say, M and 2XL on the figure without leaving the tool.
   * Only renders for torso/legs garments (not caps).
   */
  compare?: DressLayer | null;
}

export function DressStage({ layers, presentation, frame, className, compare }: DressStageProps) {
  const body = useMemo(() => bodyFor(presentation, frame), [presentation, frame]);

  // Render each category's garment once; a later layer for the same category
  // replaces the earlier one so the look stays physically plausible.
  const worn = useMemo(() => {
    const map = new Map<string, DressLayer>();
    for (const layer of layers) map.set(layer.product.category, layer);
    return [...map.values()].sort(
      (a, b) => Z_ORDER[a.product.category] - Z_ORDER[b.product.category],
    );
  }, [layers]);

  return (
    <div
      className={cx("relative aspect-[300/640] w-full max-h-[620px] overflow-hidden bg-slate", className)}
      aria-label={worn.map((layer) => `${layer.product.name} in ${layer.size}`).join(", ")}
    >
      {/* grid backdrop */}
      <div aria-hidden="true" className="absolute inset-0 grid-rail opacity-40" />

      {/* floor line */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sumi/70 to-transparent" />
      <span
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 h-px w-3/4 -translate-x-1/2 bg-bone/15"
      />

      <div className="absolute inset-0 animate-[closet-breathe_7s_ease-in-out_infinite]">
        <FigureSvg body={body} />

        {/* optional ghost: the same garment in a second size, drawn underneath */}
        {compare && compare.product.category !== "headwear" ? (
          <Ghost layer={compare} />
        ) : null}

        {/* garments, silhouette-clipped and stacked like real clothing */}
        {worn.map((layer) => {
          const p = placement(layer);
          return (
            <div
              key={`${layer.product.slug}-${layer.size}-${presentation}-${frame}`}
              className="absolute animate-[closet-dress_0.6s_var(--ease-slash)_both] will-change-transform"
              style={{
                left: `${pxToPct(p.left, "x")}%`,
                top: `${pxToPct(p.top, "y")}%`,
                width: `${pxToPct(p.width, "x")}%`,
                height: `${pxToPct(p.height, "y")}%`,
                zIndex: p.z,
                filter: "drop-shadow(0 14px 22px rgb(0 0 0 / 0.55))",
              }}
            >
              <div
                className="absolute inset-0 bg-cover"
                style={{
                  clipPath: p.clip,
                  backgroundImage: `url(${withBasePath(layer.product.images.front)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 8%",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* frame tag */}
      <div className="pointer-events-none absolute left-3 top-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel">
        frame // {presentation} · {frame}
      </div>

      {/* compare legend */}
      {compare ? (
        <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-3 bg-sumi/80 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] backdrop-blur">
          <span className="flex items-center gap-1.5 text-fog">
            <span className="inline-block h-3 w-3 border border-dashed border-oxide/80 bg-bone/20" />
            {compare.product.name} {compare.size}
          </span>
          <span className="text-steel">vs</span>
          <span className="flex items-center gap-1.5 text-bone">
            <span className="inline-block h-3 w-3 border border-bone/40 bg-bone/50" />
            {compare.product.name} {layers.find((l) => l.product.slug === compare.product.slug)?.size ?? "?"}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** Dashed-outline ghost of a second size, behind the worn garment. */
function Ghost({ layer }: { layer: DressLayer }) {
  const p = placement(layer);
  return (
    <div
      key={`compare-${layer.product.slug}-${layer.size}`}
      className="absolute animate-[closet-dress_0.6s_var(--ease-slash)_0.1s_both] opacity-45 grayscale-[0.4] will-change-transform"
      style={{
        left: `${pxToPct(p.left, "x")}%`,
        top: `${pxToPct(p.top, "y")}%`,
        width: `${pxToPct(p.width, "x")}%`,
        height: `${pxToPct(p.height, "y")}%`,
        zIndex: Math.max(1, p.z - 5),
        filter: "drop-shadow(0 0 6px rgb(226 58 46 / 0.8))",
      }}
    >
      <div
        className="absolute inset-0 bg-cover"
        style={{
          clipPath: p.clip,
          backgroundImage: `url(${withBasePath(layer.product.images.front)})`,
          backgroundSize: "cover",
          backgroundPosition: "center 8%",
        }}
      />
    </div>
  );
}

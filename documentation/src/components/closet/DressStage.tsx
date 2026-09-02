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
import { cx } from "@/lib/cx";

/**
 * THE CLOSET — the dress figure.
 *
 * A fixed 300×640 wireframe figure (proportions shift subtly with the chosen
 * frame) with the flat-lay garment photography overlaid on top, scaled so that
 * one size-chart centimetre is STAGE_SCALE pixels. Picking a bigger size
 * literally makes the garment render bigger on the body.
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

/** Coordinates (stage px) for one garment overlay. */
function placement(layer: DressLayer) {
  const { product, size } = layer;
  const chart = sizeCharts[product.category];
  const spec = chart.find((entry) => entry.size === size) ?? chart[0];
  const zone = CATEGORY_PLACEMENT[product.category].zone;

  if (zone === "head") {
    const w = 96;
    const h = 88;
    return {
      left: 150 - w / 2,
      top: 22,
      width: w,
      height: h,
      round: "50% 50% 46% 46% / 60% 60% 40% 40%",
      bgPos: "center 30%",
    };
  }

  if (zone === "legs") {
    const width = cmToPx(spec.chest); // pants chart stores waist in `chest`
    const height = cmToPx(spec.length);
    return {
      left: 150 - width / 2,
      top: ZONE_Y.legs,
      width,
      height,
      round: "10px 10px 2px 2px",
      bgPos: "center 12%",
    };
  }

  // torso (tee / hoodie) — anchored at the shoulder, sized by the actual pattern
  const width = cmToPx(spec.chest);
  const height = cmToPx(spec.length);
  return {
    left: 150 - width / 2,
    top: ZONE_Y.torso,
    width,
    height,
    round: "10px 10px 6px 6px",
    bgPos: "center 6%",
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

export function DressStage({ layers, presentation, frame, className, compare }: DressStageProps) {
  const body = useMemo(() => bodyFor(presentation, frame), [presentation, frame]);

  // Render each category's garment once; a later layer for the same category
  // replaces the earlier one so the look stays physically plausible.
  const worn = useMemo(() => {
    const map = new Map<string, DressLayer>();
    for (const layer of layers) map.set(layer.product.category, layer);
    return [...map.values()];
  }, [layers]);

  const comparePlacement = compare ? placement(compare) : null;

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
        {compare && comparePlacement && compare.product.category !== "headwear" ? (
          <div
            key={`compare-${compare.product.slug}-${compare.size}`}
            className="absolute animate-[closet-dress_0.6s_var(--ease-slash)_0.1s_both] bg-cover opacity-45 grayscale-[0.4] will-change-transform"
            style={{
              left: `${pxToPct(comparePlacement.left, "x")}%`,
              top: `${pxToPct(comparePlacement.top, "y")}%`,
              width: `${pxToPct(comparePlacement.width, "x")}%`,
              height: `${pxToPct(comparePlacement.height, "y")}%`,
              borderRadius: comparePlacement.round,
              backgroundImage: `url(${withBasePath(compare.product.images.front)})`,
              backgroundSize: "cover",
              backgroundPosition: comparePlacement.bgPos,
              border: "1px dashed rgb(226 58 46 / 0.7)",
              boxShadow: "0 18px 40px -18px rgb(0 0 0 / 0.8)",
            }}
          />
        ) : null}

        {/* garments, top layer first so the outer piece wins */}
        {worn.map((layer) => {
          const p = placement(layer);
          return (
            <div
              key={`${layer.product.slug}-${layer.size}-${presentation}-${frame}`}
              className="absolute animate-[closet-dress_0.6s_var(--ease-slash)_both] bg-cover will-change-transform"
              style={{
                left: `${pxToPct(p.left, "x")}%`,
                top: `${pxToPct(p.top, "y")}%`,
                width: `${pxToPct(p.width, "x")}%`,
                height: `${pxToPct(p.height, "y")}%`,
                borderRadius: p.round,
                backgroundImage: `url(${withBasePath(layer.product.images.front)})`,
                backgroundSize: "cover",
                backgroundPosition: p.bgPos,
                boxShadow: "0 18px 40px -18px rgb(0 0 0 / 0.8)",
              }}
            />
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

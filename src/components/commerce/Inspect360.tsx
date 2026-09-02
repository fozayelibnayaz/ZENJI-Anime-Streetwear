"use client";

import { useEffect, useRef, useState } from "react";
import type { Product, Size } from "@/content/products";
import { sizeCharts } from "@/content/sizing";
import { availableSizes } from "@/lib/catalogue";
import { withBasePath } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { useCred } from "@/lib/cred";

/**
 * INSPECT-360 — pick the garment up.
 *
 * Drag to spin it on a turntable (front/back cards in preserve-3d with real
 * inertia), hover for the fabric loupe, or flip to X-RAY: a stitch diagram
 * drawn from the actual size chart, with the centimetre callouts a maker
 * would check. One full revolution earns a little street cred.
 */
export function Inspect360({ product }: { product: Product }) {
  const sizes = availableSizes(product);
  const [size, setSize] = useState<Size>(sizes.includes("M") ? "M" : (sizes[0] ?? "M"));
  const [mode, setMode] = useState<"spin" | "xray">("spin");
  const [angle, setAngle] = useState(-18);
  const [loupe, setLoupe] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const frame = useRef(0);
  const spun = useRef(0);
  const lastAngle = useRef(-18);
  const { earn } = useCred();

  // Inertia loop after release.
  useEffect(() => {
    const tick = () => {
      if (dragging.current || Math.abs(velocity.current) < 0.05) {
        frame.current = 0;
        return;
      }
      velocity.current *= 0.94;
      setAngle((current) => current + velocity.current);
      frame.current = requestAnimationFrame(tick);
    };
    if (!frame.current && !dragging.current) frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [angle, mode]);

  // Full-revolution cred, once per session per product.
  useEffect(() => {
    const delta = angle - lastAngle.current;
    lastAngle.current = angle;
    spun.current += Math.abs(delta);
    if (spun.current >= 360) {
      spun.current = -Number.POSITIVE_INFINITY; // armed once
      earn("spun a full 360", 5);
    }
  }, [angle, earn]);

  const onDown = (event: React.PointerEvent) => {
    dragging.current = true;
    setIsDragging(true);
    lastX.current = event.clientX;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  };
  const onMove = (event: React.PointerEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (!dragging.current) {
      setLoupe({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
      return;
    }
    const dx = event.clientX - lastX.current;
    lastX.current = event.clientX;
    velocity.current = dx * 0.55;
    setAngle((current) => current + dx * 0.55);
  };
  const onUp = () => {
    dragging.current = false;
    setIsDragging(false);
  };

  const chart = sizeCharts[product.category];
  const spec = chart.find((entry) => entry.size === size) ?? chart[0];

  return (
    <section aria-label="Inspect 360 — spin, loupe and stitch x-ray" className="mt-8 border border-bone/12 bg-ink p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label">Inspect_360 // pick it up</p>
        <div className="flex gap-2">
          {(["spin", "xray"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cx(
                "h-8 border px-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors",
                mode === m ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:text-bone",
              )}
            >
              {m === "spin" ? "Turntable" : "Stitch x-ray"}
            </button>
          ))}
        </div>
      </div>

      {mode === "spin" ? (
        <div
          className="relative mt-4 aspect-[4/5] cursor-grab touch-pan-y select-none active:cursor-grabbing"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={() => {
            onUp();
            setLoupe(null);
          }}
          style={{ perspective: "1100px" }}
        >
          <div
            className="absolute inset-0 transition-transform duration-75"
            style={{ transformStyle: "preserve-3d", transform: `rotateY(${angle}deg)` }}
          >
            <img
              src={withBasePath(product.images.front)}
              alt={`${product.name} front, spinning`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ backfaceVisibility: "hidden" }}
            />
            <img
              src={withBasePath(product.images.back ?? product.images.front)}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            />
          </div>

          {/* dial */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-bone/70">
            {String(((Math.round(angle) % 360) + 360) % 360).padStart(3, "0")}° · drag to spin
          </div>

          {/* loupe */}
          {loupe && !isDragging ? (
            <div
              className="pointer-events-none absolute z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-oxide shadow-xl"
              style={{
                left: `${loupe.x}%`,
                top: `${loupe.y}%`,
                backgroundImage: `url(${withBasePath(product.images.front)})`,
                backgroundSize: "260%",
                backgroundPosition: `${loupe.x}% ${loupe.y}%`,
                backgroundColor: "#0c0c0e",
              }}
              aria-hidden
            />
          ) : null}
        </div>
      ) : (
        <XRay product={product} chest={spec.chest} length={spec.length} sleeve={spec.sleeve} size={size} />
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
          {mode === "spin" ? "Hover for the 2.5× fabric loupe" : "Seams drawn from the live size chart"}
        </p>
        <div className="flex gap-1.5" role="group" aria-label="Inspect size">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === size}
              onClick={() => setSize(s)}
              className={cx(
                "h-7 min-w-8 border px-1.5 font-mono text-[0.62rem] transition-colors",
                s === size ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:text-bone",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Stitch diagram with real centimetre callouts for the selected size. */
function XRay({
  product,
  chest,
  length,
  sleeve,
  size,
}: {
  product: Product;
  chest: number;
  length: number;
  sleeve?: number;
  size: Size;
}) {
  const w = chest * 2.1;
  const h = length * 2.1;
  const shoulder = w * 0.86;
  const sleeveW = (sleeve ?? chest * 0.28) * 1.4;
  const cx0 = 160;
  const top = 30;

  return (
    <div className="relative mt-4 aspect-[4/5] bg-sumi">
      <svg viewBox="0 0 320 400" className="h-full w-full" role="img" aria-label={`Stitch diagram, size ${size}`}>
        <defs>
          <pattern id="xraygrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke="#202027" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="320" height="400" fill="url(#xraygrid)" />
        {/* silhouette */}
        <path
          d={`M ${cx0 - shoulder / 2} ${top + 12}
              Q ${cx0} ${top - 6} ${cx0 + shoulder / 2} ${top + 12}
              L ${cx0 + shoulder / 2 + sleeveW} ${top + 34}
              L ${cx0 + shoulder / 2 + sleeveW - 10} ${top + 34 + sleeveW}
              L ${cx0 + w / 2} ${top + 60}
              L ${cx0 + w / 2} ${top + h}
              L ${cx0 - w / 2} ${top + h}
              L ${cx0 - w / 2} ${top + 60}
              L ${cx0 - shoulder / 2 - sleeveW + 10} ${top + 34 + sleeveW}
              L ${cx0 - shoulder / 2 - sleeveW} ${top + 34}
              Z`}
          fill="#101014"
          stroke="#e23a2e"
          strokeWidth="1.6"
          strokeDasharray="5 4"
        />
        {/* seams */}
        <path d={`M ${cx0 - w / 2 + 8} ${top + 62} V ${top + h - 6}`} stroke="#3d3d46" strokeDasharray="2 3" fill="none" />
        <path d={`M ${cx0 + w / 2 - 8} ${top + 62} V ${top + h - 6}`} stroke="#3d3d46" strokeDasharray="2 3" fill="none" />
        <path d={`M ${cx0 - w / 2} ${top + h - 8} H ${cx0 + w / 2}`} stroke="#3d3d46" strokeDasharray="2 3" fill="none" />
        <path d={`M ${cx0 - shoulder / 2} ${top + 14} Q ${cx0} ${top + 26} ${cx0 + shoulder / 2} ${top + 14}`} stroke="#3d3d46" strokeDasharray="2 3" fill="none" />
        {/* callouts */}
        <g fontFamily="ui-monospace, monospace" fontSize="9" fill="#f2f2f0">
          <line x1={cx0 - w / 2} y1={top + 70} x2={cx0 + w / 2} y2={top + 70} stroke="#e23a2e" strokeWidth="0.8" />
          <text x={cx0 + w / 2 + 6} y={top + 73} fill="#e23a2e">
            chest {chest}
          </text>
          <line x1={cx0 - w / 2 - 14} y1={top} x2={cx0 - w / 2 - 14} y2={top + h} stroke="#e23a2e" strokeWidth="0.8" />
          <text x={cx0 - w / 2 - 10} y={top + h / 2} fill="#e23a2e" transform={`rotate(-90 ${cx0 - w / 2 - 10} ${top + h / 2})`}>
            length {length}
          </text>
          {sleeve ? (
            <text x={cx0 + shoulder / 2 + sleeveW - 4} y={top + 26} fill="#9a9aa0">
              sleeve {sleeve}
            </text>
          ) : null}
        </g>
      </svg>
      <p className="absolute left-2 top-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel">
        {product.name} · size {size} · cm
      </p>
    </div>
  );
}

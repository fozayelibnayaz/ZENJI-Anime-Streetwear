import { cx } from "@/lib/cx";

export interface Silhouette {
  chest: number;
  length: number;
  label: string;
  tone: "reference" | "zenji";
}

const SLEEVE_OUT = 13;
const SLEEVE_DROP = 21;

/**
 * Builds a tee outline directly from the two measurements, in centimetre units —
 * so the drawing on screen is literally the pattern, not an illustration of it.
 */
function teePath(chest: number, length: number, offsetX: number, offsetY: number): string {
  const l = offsetX + SLEEVE_OUT;
  const r = l + chest;
  const neckL = l + chest * 0.36;
  const neckR = l + chest * 0.64;
  const y = (value: number) => offsetY + value;

  return [
    `M ${neckL} ${y(0)}`,
    `Q ${l + chest * 0.5} ${y(chest * 0.11)} ${neckR} ${y(0)}`,
    `L ${r} ${y(0)}`,
    `L ${r + SLEEVE_OUT} ${y(SLEEVE_DROP * 0.55)}`,
    `L ${r + SLEEVE_OUT * 0.86} ${y(SLEEVE_DROP)}`,
    `L ${r} ${y(SLEEVE_DROP * 0.72)}`,
    `L ${r} ${y(length)}`,
    `L ${l} ${y(length)}`,
    `L ${l} ${y(SLEEVE_DROP * 0.72)}`,
    `L ${l - SLEEVE_OUT * 0.86} ${y(SLEEVE_DROP)}`,
    `L ${l - SLEEVE_OUT} ${y(SLEEVE_DROP * 0.55)}`,
    `L ${l} ${y(0)}`,
    "Z",
  ].join(" ");
}

interface GarmentSilhouetteProps {
  garments: Silhouette[];
  className?: string;
}

/** Overlays the garment you measured against the ZENJI pattern, to scale. */
export function GarmentSilhouette({ garments, className }: GarmentSilhouetteProps) {
  const maxChest = Math.max(...garments.map((g) => g.chest));
  const maxLength = Math.max(...garments.map((g) => g.length));
  const width = maxChest + SLEEVE_OUT * 2 + 4;
  const height = maxLength + 6;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={garments.map((g) => `${g.label}: ${g.chest}cm chest by ${g.length}cm length`).join(". ")}
      className={cx("h-full w-full", className)}
    >
      <defs>
        <pattern id="fit-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
        </pattern>
      </defs>

      {garments.map((garment) => {
        const offsetX = (width - (garment.chest + SLEEVE_OUT * 2)) / 2;
        const zenji = garment.tone === "zenji";
        return (
          <path
            key={garment.label}
            d={teePath(garment.chest, garment.length, offsetX, 3)}
            className={zenji ? "text-oxide" : "text-steel"}
            fill={zenji ? "url(#fit-hatch)" : "none"}
            stroke="currentColor"
            strokeWidth={zenji ? 1.1 : 0.9}
            strokeDasharray={zenji ? undefined : "3 2.5"}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

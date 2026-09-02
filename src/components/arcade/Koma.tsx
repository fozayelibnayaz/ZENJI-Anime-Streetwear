"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";

export type KomaMood = "idle" | "cheer" | "sulk";

/**
 * KOMA — the label's original anime street cat.
 *
 * Pure SVG, no assets: the pupils follow your cursor, the ears and arms react
 * to mood, and the tee under the open hoodie wears whichever print you hang on
 * him. He is the arcade's host and its loudest critic.
 */
export function Koma({
  mood = "idle",
  print = "禅",
  printColor = "#e23a2e",
  className,
}: {
  mood?: KomaMood;
  print?: string;
  printColor?: string;
  className?: string;
}) {
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const x = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2));
      setGaze({ x, y });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const pupilX = gaze.x * 2.6;
  const pupilY = gaze.y * 1.8;

  return (
    <svg
      viewBox="0 0 200 240"
      className={cx("koma", mood === "cheer" && "koma-cheer", mood === "sulk" && "koma-sulk", className)}
      role="img"
      aria-label="KOMA, the ZENJI street cat mascot"
    >
      {/* shadow */}
      <ellipse cx="100" cy="230" rx="52" ry="8" fill="#000" opacity="0.45" />

      {/* legs + sneakers */}
      <rect x="76" y="176" width="18" height="44" rx="6" fill="#101014" />
      <rect x="106" y="176" width="18" height="44" rx="6" fill="#101014" />
      <path d="M70 218 h30 v10 q0 4 -6 4 h-26 q-5 0 -5 -5 z" fill="#f2f2f0" />
      <path d="M100 218 h30 v9 q0 5 -6 5 h-24 q-4 0 -4 -5 z" fill="#e5e5e0" />
      <path d="M70 224 h30 M100 224 h30" stroke="#e23a2e" strokeWidth="2.4" />

      {/* tee with the hung print */}
      <path d="M74 118 q26 -10 52 0 l6 62 q-32 10 -64 0 z" fill="#17171b" stroke="#2c2c33" />
      <text x="100" y="158" textAnchor="middle" fontSize="30" fill={printColor} fontFamily="serif">
        {print}
      </text>

      {/* open hoodie */}
      <path d="M62 116 q-8 40 -2 70 l16 4 -4 -70 z" fill="#232329" />
      <path d="M138 116 q8 40 2 70 l-16 4 4 -70 z" fill="#232329" />
      <path d="M62 116 q38 -18 76 0 l-6 12 q-32 -12 -64 0 z" fill="#2b2b32" />
      {/* drawstrings */}
      <path d="M90 122 v20 M110 122 v20" stroke="#f2f2f0" strokeWidth="2.4" strokeLinecap="round" />

      {/* arms */}
      <g className="koma-arm-l">
        <path d="M64 122 q-16 26 -8 48" stroke="#232329" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="56" cy="172" r="8" fill="#e8d5c4" />
      </g>
      <g className="koma-arm-r">
        <path d="M136 122 q16 26 8 48" stroke="#232329" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="144" cy="172" r="8" fill="#e8d5c4" />
      </g>

      {/* head */}
      <g className="koma-head">
        <g className="koma-ear-l">
          <path d="M62 46 L74 16 L92 38 Z" fill="#101014" />
          <path d="M70 40 L76 26 L85 36 Z" fill="#e23a2e" opacity="0.7" />
        </g>
        <g className="koma-ear-r">
          <path d="M138 46 L126 16 L108 38 Z" fill="#101014" />
          <path d="M130 40 L124 26 L115 36 Z" fill="#e23a2e" opacity="0.7" />
        </g>
        <circle cx="100" cy="66" r="40" fill="#101014" />
        {/* muzzle */}
        <path d="M84 78 q16 12 32 0 q-4 16 -16 16 q-12 0 -16 -16z" fill="#e8d5c4" />
        <path d="M97 80 h6 l-3 5 z" fill="#e23a2e" />
        {/* eyes */}
        <g className="koma-eyes">
          <ellipse cx="84" cy="64" rx="8" ry="9" fill="#f2f2f0" />
          <ellipse cx="116" cy="64" rx="8" ry="9" fill="#f2f2f0" />
          <circle cx={84 + pupilX} cy={64 + pupilY} r="3.6" fill="#101013" />
          <circle cx={116 + pupilX} cy={64 + pupilY} r="3.6" fill="#101013" />
        </g>
        {/* whiskers */}
        <path d="M60 70 h-16 M62 78 l-15 4 M140 70 h16 M138 78 l15 4" stroke="#3a3a41" strokeWidth="1.6" />
        {/* headband */}
        <path d="M62 52 q38 -14 76 0" stroke="#e23a2e" strokeWidth="6" fill="none" />
      </g>
    </svg>
  );
}

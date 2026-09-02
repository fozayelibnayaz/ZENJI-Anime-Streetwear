"use client";

import { Img } from "@/components/ui/Img";
import { useState } from "react";
import type { Product } from "@/content/products";
import { cx } from "@/lib/cx";

interface ProductGalleryProps {
  product: Product;
}

/**
 * Product gallery. Desktop gets thumbnails and arrow keys; touch gets a
 * scroll-snap track, because a carousel that fights the thumb is worse than no
 * carousel at all.
 */
export function ProductGallery({ product }: ProductGalleryProps) {
  const shots = [
    { src: product.images.front, label: "Front" },
    ...(product.images.back ? [{ src: product.images.back, label: "Back" }] : []),
  ];

  // Each product page is its own route, so the component remounts and the index
  // resets naturally — no effect needed to keep them in sync.
  const [index, setIndex] = useState(0);

  const step = (delta: number) => setIndex((current) => (current + delta + shots.length) % shots.length);

  return (
    <div
      className="flex flex-col gap-3"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") step(-1);
        if (event.key === "ArrowRight") step(1);
      }}
    >
      {/* Touch: one swipeable track. */}
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shots.map((shot) => (
          <li key={shot.label} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-slate">
            <Img
              src={shot.src}
              alt={`${product.name}, ${shot.label.toLowerCase()}`}
              fill
              priority={shot.label === "Front"}
              sizes="100vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      {/* Pointer: a single frame with thumbnails. */}
      <div className="relative hidden aspect-[4/5] overflow-hidden bg-slate sm:block">
        {shots.map((shot, shotIndex) => (
          <Img
            key={shot.label}
            src={shot.src}
            alt={`${product.name}, ${shot.label.toLowerCase()}`}
            fill
            priority={shotIndex === 0}
            sizes="(min-width: 1024px) 45vw, 92vw"
            className={cx(
              "object-cover transition-opacity duration-500 ease-[var(--ease-slash)]",
              shotIndex === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        <span className="jp pointer-events-none absolute bottom-4 left-4 text-4xl text-bone/60">{product.kanji}</span>
      </div>

      {shots.length > 1 ? (
        <div className="hidden gap-2 sm:flex">
          {shots.map((shot, shotIndex) => (
            <button
              key={shot.label}
              type="button"
              onClick={() => setIndex(shotIndex)}
              aria-label={`Show ${shot.label.toLowerCase()} view`}
              aria-pressed={shotIndex === index}
              className={cx(
                "relative h-24 w-20 overflow-hidden border bg-slate transition-colors",
                shotIndex === index ? "border-oxide" : "border-transparent hover:border-bone/40",
              )}
            >
              <Img src={shot.src} alt="" fill sizes="80px" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-sumi/80 py-0.5 text-center font-mono text-[0.55rem] uppercase tracking-[0.12em] text-fog">
                {shot.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

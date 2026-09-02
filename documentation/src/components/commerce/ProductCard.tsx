"use client";

import { Img } from "@/components/ui/Img";
import Link from "next/link";
import type { Product } from "@/content/products";
import { availableSizes, isSoldOut, lowStockSizes } from "@/lib/catalogue";
import { discountPercent } from "@/lib/money";
import { cx } from "@/lib/cx";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useUI } from "@/providers/UIProvider";
import { PriceTag } from "./PriceTag";

interface ProductCardProps {
  product: Product;
  /** Priority-load the first row on the homepage so the LCP image is not lazy. */
  priority?: boolean;
  index?: number;
}

export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const { openQuickView } = useUI();
  const { isSaved, toggleSaved, fit } = usePreferences();

  const soldOut = isSoldOut(product);
  const off = discountPercent(product.price, product.compareAt);
  const low = lowStockSizes(product);
  const sizes = availableSizes(product);
  const fitAvailable = fit ? sizes.includes(fit.size) : false;
  const saved = isSaved(product.slug);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate">
        <Link href={`/drop/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}>
          <span className="sr-only">{product.name}</span>
        </Link>

        <Img
          src={product.images.front}
          alt={`${product.name} — ${product.colourway}, front`}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
          className={cx(
            "object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-slash)]",
            product.images.back && "group-hover:opacity-0 group-focus-within:opacity-0",
            soldOut && "opacity-45 grayscale",
          )}
        />

        {product.images.back ? (
          <Img
            src={product.images.back}
            alt=""
            aria-hidden="true"
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className="scale-105 object-cover opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-slash)] group-hover:scale-100 group-hover:opacity-100 group-focus-within:opacity-100"
          />
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-1">
            {off ? (
              <span className="bg-oxide px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-bone">
                Sale {off}% off
              </span>
            ) : null}
            {!soldOut && low.length > 0 ? (
              <span className="bg-sumi/85 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-fog">
                Low: {low.join(" · ")}
              </span>
            ) : null}
            {fitAvailable ? (
              <span className="bg-jade/90 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sumi">
                Your size {fit?.size} in stock
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => toggleSaved(product.slug)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
            className="pointer-events-auto grid h-8 w-8 place-items-center border border-bone/20 bg-sumi/70 text-sm text-bone backdrop-blur transition-colors hover:border-oxide hover:text-oxide"
          >
            {saved ? "★" : "☆"}
          </button>
        </div>

        {soldOut ? (
          <span className="absolute inset-x-0 bottom-0 bg-sumi/85 py-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.2em] text-steel">
            Sold out — no restock
          </span>
        ) : (
          <button
            type="button"
            onClick={() => openQuickView(product.slug)}
            className="absolute inset-x-0 bottom-0 z-20 translate-y-full bg-bone py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-sumi transition-transform duration-300 ease-[var(--ease-slash)] group-hover:translate-y-0 group-focus-within:translate-y-0 focus-visible:translate-y-0"
          >
            Quick view →
          </button>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="label">
            {String(index + 1).padStart(2, "0")} / <span className="jp">{product.kanji}</span> {product.romaji}
          </p>
          <h3 className="display mt-1 text-lg sm:text-xl">
            <Link href={`/drop/${product.slug}`} className="hover:text-oxide">
              {product.name}
            </Link>
          </h3>
        </div>
        <PriceTag price={product.price} compareAt={product.compareAt} className="mt-1 shrink-0" />
      </div>
    </article>
  );
}

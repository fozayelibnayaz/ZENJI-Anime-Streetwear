"use client";

import { Img } from "@/components/ui/Img";
import Link from "next/link";
import { getProduct } from "@/lib/catalogue";
import { useUI } from "@/providers/UIProvider";
import { Sheet } from "@/components/ui/Sheet";
import { PurchasePanel } from "./PurchasePanel";
import { PriceTag } from "./PriceTag";

/** Buy without leaving the grid. Mounted once, at the app root. */
export function QuickView() {
  const { quickView, closeQuickView } = useUI();
  const product = quickView ? getProduct(quickView) : undefined;

  if (!product) return null;

  return (
    <Sheet
      open
      onClose={closeQuickView}
      placement="center"
      label={`Quick view: ${product.name}`}
      className="max-h-[84dvh] overflow-y-auto"
    >
      <div className="grid gap-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="relative aspect-[4/5] bg-slate">
          <Img
            src={product.images.front}
            alt={`${product.name}, front`}
            fill
            sizes="(min-width: 640px) 22rem, 92vw"
            className="object-cover"
          />
          <span className="jp absolute bottom-3 left-3 text-3xl text-bone/70">{product.kanji}</span>
        </div>

        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label">Quick view</p>
              <h2 className="display mt-2 text-3xl">{product.name}</h2>
              <PriceTag price={product.price} compareAt={product.compareAt} size="lg" className="mt-2" />
            </div>
            <button
              type="button"
              onClick={closeQuickView}
              aria-label="Close quick view"
              className="grid h-9 w-9 shrink-0 place-items-center border border-bone/20 text-steel transition-colors hover:border-oxide hover:text-oxide"
            >
              ✕
            </button>
          </div>

          <p className="text-sm leading-relaxed text-fog">{product.tagline}</p>

          <PurchasePanel product={product} compact />

          <Link
            href={`/drop/${product.slug}`}
            onClick={closeQuickView}
            className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel underline underline-offset-4 hover:text-oxide"
          >
            Full details, story and measurements →
          </Link>
        </div>
      </div>
    </Sheet>
  );
}

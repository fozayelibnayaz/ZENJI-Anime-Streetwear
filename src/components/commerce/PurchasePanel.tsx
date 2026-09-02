"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, Size } from "@/content/products";
import { availableSizes, unitsFor } from "@/lib/catalogue";
import { formatPrice } from "@/lib/money";
import { site } from "@/content/site";
import { cx } from "@/lib/cx";
import { useLoadout } from "@/providers/LoadoutProvider";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useUI } from "@/providers/UIProvider";
import { Action } from "@/components/ui/Action";

interface PurchasePanelProps {
  product: Product;
  /** Compact layout for the quick-view overlay. */
  compact?: boolean;
}

export function PurchasePanel({ product, compact = false }: PurchasePanelProps) {
  const { add } = useLoadout();
  const { fit } = usePreferences();
  const { openOverlay, toast } = useUI();

  const inStock = useMemo(() => availableSizes(product), [product]);
  const [chosen, setChosen] = useState<Size | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * The selected size is derived, not stored: an explicit choice wins, otherwise
   * we fall back to the Fit Lab result (when that size is actually on the shelf),
   * and finally to the only option if there is just one.
   */
  const size: Size | null =
    chosen && inStock.includes(chosen)
      ? chosen
      : fit && inStock.includes(fit.size)
        ? fit.size
        : inStock.length === 1
          ? inStock[0]
          : null;

  const units = size ? unitsFor(product, size) : 0;
  const soldOut = inStock.length === 0;

  const onAdd = () => {
    if (soldOut) return;
    if (!size) {
      setError("Pick a size first.");
      return;
    }
    setError(null);
    add(product.slug, size, 1);
    toast(`${product.name} · ${size} added`, { label: "View loadout", run: () => openOverlay("loadout") });
  };

  return (
    <div className={cx("flex flex-col", compact ? "gap-4" : "gap-6")}>
      <div>
        <div className="flex items-center justify-between">
          <p className="label">Size — flat measurements in cm</p>
          <button
            type="button"
            onClick={() => openOverlay("size-guide")}
            className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel underline underline-offset-4 hover:text-oxide"
          >
            Size guide
          </button>
        </div>

        <div role="radiogroup" aria-label="Select a size" className="mt-3 flex flex-wrap gap-2">
          {product.stock.map((level) => {
            const disabled = level.units === 0;
            const active = size === level.size;
            return (
              <button
                key={level.size}
                type="button"
                role="radio"
                aria-checked={active}
                aria-disabled={disabled}
                disabled={disabled}
                onClick={() => {
                  setChosen(level.size);
                  setError(null);
                }}
                className={cx(
                  "relative h-11 min-w-14 border px-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors",
                  active ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-bone hover:border-bone/60",
                  disabled && "cursor-not-allowed border-bone/10 text-steel/50 line-through hover:border-bone/10",
                )}
              >
                {level.size}
                {fit?.size === level.size && !disabled ? (
                  <span
                    aria-hidden="true"
                    className={cx("absolute -top-1 -right-1 h-2 w-2 rotate-45", active ? "bg-bone" : "bg-jade")}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="mt-2 min-h-5 font-mono text-[0.68rem] uppercase tracking-[0.14em]">
          {error ? (
            <span className="text-oxide">{error}</span>
          ) : fit ? (
            <span className="text-jade">
              Fit Lab says {fit.size}
              {size && size !== fit.size ? ` — you picked ${size}` : ""}
            </span>
          ) : (
            <Link href="/fit-lab" className="text-steel underline underline-offset-4 hover:text-oxide">
              Not sure? Match it to a tee you own →
            </Link>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Action onClick={onAdd} disabled={soldOut} className="h-14 w-full text-sm">
          {soldOut ? "Sold out" : `Add to loadout — ${formatPrice(product.price)}`}
        </Action>

        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel">
          {soldOut
            ? "This run is finished. Sold out sizes never restock."
            : size
              ? units <= 3
                ? `Only ${units} left in ${size}`
                : `${units} in stock · ships from Fitzroy`
              : `Free AU shipping over ${formatPrice(site.freeShippingThreshold)}`}
        </p>
      </div>
    </div>
  );
}

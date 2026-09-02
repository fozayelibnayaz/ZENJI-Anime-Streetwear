"use client";

import { Img } from "@/components/ui/Img";
import Link from "next/link";
import { useRef } from "react";
import { formatPrice } from "@/lib/money";
import { site } from "@/content/site";
import { useLoadout, type LoadoutItem } from "@/providers/LoadoutProvider";
import { useUI } from "@/providers/UIProvider";
import { Sheet } from "@/components/ui/Sheet";
import { Action, ActionLink } from "@/components/ui/Action";

/** The cart. Called a loadout because that is what the customer calls it. */
export function LoadoutDrawer() {
  const { overlay, closeOverlay, toast } = useUI();
  const { lines, subtotal, count, shippingProgress, remainingForFreeShipping, setQty, remove, restore, items } =
    useLoadout();

  // Snapshot for undo, so removing an item is never destructive.
  const lastRemoved = useRef<LoadoutItem[] | null>(null);

  const open = overlay === "loadout";

  const removeLine = (slug: string, size: LoadoutItem["size"], name: string) => {
    lastRemoved.current = items;
    remove(slug, size);
    toast(`${name} removed`, {
      label: "Undo",
      run: () => lastRemoved.current && restore(lastRemoved.current),
    });
  };

  return (
    <Sheet open={open} onClose={closeOverlay} placement="right" label="Your loadout">
      <header className="flex items-center justify-between border-b border-bone/10 px-5 py-4">
        <div>
          <p className="label">Loadout</p>
          <p className="display mt-1 text-2xl">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          type="button"
          onClick={closeOverlay}
          aria-label="Close loadout"
          className="grid h-9 w-9 place-items-center border border-bone/20 text-steel transition-colors hover:border-oxide hover:text-oxide"
        >
          ✕
        </button>
      </header>

      <div className="border-b border-bone/10 px-5 py-3">
        <div className="h-1 w-full bg-ash">
          <div
            className="h-full bg-oxide transition-[width] duration-500 ease-[var(--ease-slash)]"
            style={{ width: `${Math.round(shippingProgress * 100)}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
          {remainingForFreeShipping === 0
            ? "Free Australia-wide shipping unlocked"
            : `${formatPrice(remainingForFreeShipping)} away from free AU shipping`}
        </p>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <span className="jp text-5xl text-ash">空</span>
          <p className="text-sm text-fog">Nothing loaded yet. The Origin Drop is still live.</p>
          <ActionLink href="/drop" onClick={closeOverlay} variant="outline">
            Browse the drop
          </ActionLink>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-bone/10 overflow-y-auto">
          {lines.map((line) => (
            <li key={`${line.slug}-${line.size}`} className="flex gap-4 p-5">
              <Link
                href={`/drop/${line.slug}`}
                onClick={closeOverlay}
                className="relative h-24 w-20 shrink-0 overflow-hidden bg-slate"
              >
                <Img
                  src={line.product.images.front}
                  alt={line.product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="display text-base">{line.product.name}</p>
                  <p className="label mt-1">
                    {line.size} · {line.product.colourway}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center border border-bone/20">
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                      aria-label={`Decrease quantity of ${line.product.name}`}
                      className="h-9 w-9 text-steel transition-colors hover:text-bone"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="w-8 text-center font-mono text-xs">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                      disabled={line.qty >= line.maxQty}
                      aria-label={`Increase quantity of ${line.product.name}`}
                      className="h-9 w-9 text-steel transition-colors hover:text-bone disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-mono text-xs">{formatPrice(line.lineTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeLine(line.slug, line.size, line.product.name)}
                aria-label={`Remove ${line.product.name} size ${line.size}`}
                className="self-start text-steel transition-colors hover:text-oxide"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="border-t border-bone/10 px-5 py-5">
        <div className="flex items-baseline justify-between">
          <span className="label">Subtotal</span>
          <span className="display text-2xl">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
          GST included · {site.currency}
        </p>
        <Action
          className="mt-4 h-13 w-full py-4"
          disabled={lines.length === 0}
          onClick={() => toast("Checkout is disabled in this build — frontend demo")}
        >
          Checkout
        </Action>
        <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
          Afterpay · Zip · Apple Pay
        </p>
      </footer>
    </Sheet>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/content/products";
import { isSoldOut } from "@/lib/catalogue";
import { formatPrice } from "@/lib/money";
import { cx } from "@/lib/cx";
import { useUI } from "@/providers/UIProvider";

/**
 * Mobile-only buy bar. On a phone the purchase panel scrolls away long before
 * someone has finished reading the story, and asking them to scroll back is how
 * you lose the sale.
 */
export function StickyBuyBar({ product }: { product: Product }) {
  const { openQuickView, quickView } = useUI();
  const [visible, setVisible] = useState(false);
  const soldOut = isSoldOut(product);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setVisible(window.scrollY > 560);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={cx(
        "fixed inset-x-0 bottom-0 z-[70] border-t border-bone/12 bg-sumi/95 backdrop-blur transition-transform duration-300 ease-[var(--ease-slash)] lg:hidden",
        visible && !quickView ? "translate-y-0" : "translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!visible}
    >
      <div className="gutter flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">{product.name}</p>
          <p className="font-mono text-sm text-bone">{formatPrice(product.price)}</p>
        </div>
        <button
          type="button"
          disabled={soldOut}
          tabIndex={visible ? 0 : -1}
          onClick={() => openQuickView(product.slug)}
          className="h-11 shrink-0 bg-oxide px-6 font-mono text-xs uppercase tracking-[0.16em] text-bone transition-colors hover:bg-oxide-deep disabled:opacity-40"
        >
          {soldOut ? "Sold out" : "Pick size"}
        </button>
      </div>
    </div>
  );
}

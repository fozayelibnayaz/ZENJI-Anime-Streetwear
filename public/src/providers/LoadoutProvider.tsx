"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { getProduct, unitsFor } from "@/lib/catalogue";
import { site } from "@/content/site";
import type { Product, Size } from "@/content/products";
import { usePersistentState } from "@/hooks/usePersistentState";

/** A line in the loadout (our word for the cart). */
export interface LoadoutItem {
  slug: string;
  size: Size;
  qty: number;
}

export interface LoadoutLine extends LoadoutItem {
  product: Product;
  lineTotal: number;
  maxQty: number;
}

interface LoadoutContextValue {
  items: LoadoutItem[];
  lines: LoadoutLine[];
  count: number;
  subtotal: number;
  /** 0–1 progress towards free shipping. */
  shippingProgress: number;
  remainingForFreeShipping: number;
  hydrated: boolean;
  add: (slug: string, size: Size, qty?: number) => void;
  setQty: (slug: string, size: Size, qty: number) => void;
  remove: (slug: string, size: Size) => void;
  clear: () => void;
  restore: (items: LoadoutItem[]) => void;
}

const LoadoutContext = createContext<LoadoutContextValue | null>(null);

const STORAGE_KEY = "zenji.loadout.v1";

export function LoadoutProvider({ children }: { children: ReactNode }) {
  const [items, setItems, hydrated] = usePersistentState<LoadoutItem[]>(STORAGE_KEY, []);

  const add = useCallback(
    (slug: string, size: Size, qty = 1) => {
      const product = getProduct(slug);
      if (!product) return;
      const stock = unitsFor(product, size);
      if (stock <= 0) return;

      setItems((current) => {
        const existing = current.find((item) => item.slug === slug && item.size === size);
        if (!existing) return [...current, { slug, size, qty: Math.min(qty, stock) }];
        return current.map((item) =>
          item.slug === slug && item.size === size ? { ...item, qty: Math.min(item.qty + qty, stock) } : item,
        );
      });
    },
    [setItems],
  );

  const setQty = useCallback(
    (slug: string, size: Size, qty: number) => {
      setItems((current) => {
        if (qty <= 0) return current.filter((item) => !(item.slug === slug && item.size === size));
        const product = getProduct(slug);
        const max = product ? unitsFor(product, size) : qty;
        return current.map((item) =>
          item.slug === slug && item.size === size ? { ...item, qty: Math.min(qty, max) } : item,
        );
      });
    },
    [setItems],
  );

  const remove = useCallback(
    (slug: string, size: Size) => {
      setItems((current) => current.filter((item) => !(item.slug === slug && item.size === size)));
    },
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);
  const restore = useCallback((next: LoadoutItem[]) => setItems(next), [setItems]);

  const value = useMemo<LoadoutContextValue>(() => {
    // Products can disappear between deploys; drop orphaned lines silently.
    const lines: LoadoutLine[] = items.flatMap((item) => {
      const product = getProduct(item.slug);
      if (!product) return [];
      return [
        {
          ...item,
          product,
          lineTotal: product.price * item.qty,
          maxQty: unitsFor(product, item.size),
        },
      ];
    });

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const remaining = Math.max(0, site.freeShippingThreshold - subtotal);

    return {
      items,
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      subtotal,
      shippingProgress: Math.min(1, subtotal / site.freeShippingThreshold),
      remainingForFreeShipping: remaining,
      hydrated,
      add,
      setQty,
      remove,
      clear,
      restore,
    };
  }, [items, hydrated, add, setQty, remove, clear, restore]);

  return <LoadoutContext.Provider value={value}>{children}</LoadoutContext.Provider>;
}

export function useLoadout(): LoadoutContextValue {
  const context = useContext(LoadoutContext);
  if (!context) throw new Error("useLoadout must be used inside <LoadoutProvider>");
  return context;
}

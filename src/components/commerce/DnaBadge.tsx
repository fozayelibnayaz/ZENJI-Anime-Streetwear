"use client";

import type { Product } from "@/content/products";
import { dnaMatch, matchLabel, productDna } from "@/lib/dna";
import { usePreferences } from "@/providers/PreferencesProvider";

/** Match % between the shopper's sequenced Fit DNA and this piece. */
export function DnaBadge({ product }: { product: Product }) {
  const { dna, hydrated } = usePreferences();
  if (!hydrated || !dna) return null;
  const score = dnaMatch(dna, productDna(product));
  return (
    <p className="mt-3 inline-flex items-center gap-2 border border-oxide/40 bg-oxide/10 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-oxide">
      <span aria-hidden="true">◈</span>
      DNA match {score}% · {matchLabel(score)}
    </p>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { drops } from "@/content/products";
import { CollectionBrowser } from "@/components/commerce/CollectionBrowser";

export const metadata: Metadata = {
  title: "The Drop — every piece in stock",
  description:
    "Browse the full ZENJI catalogue: oversized 240gsm anime graphic tees, 480gsm fleece and cargo, filtered by size and availability. Free shipping Australia-wide over A$100.",
};

export default function DropPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Collection // {drops.origin.code} + {drops.shadow.code}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">The drop</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          Fifteen pieces across two chapters. Sizes shown are what is physically on the shelf in Fitzroy — when a size
          disappears from a filter, it is genuinely gone.
        </p>
      </header>

      <div className="mt-8">
        {/* useSearchParams needs a boundary in a statically exported app. */}
        <Suspense fallback={<p className="label py-20 text-center">Loading the drop…</p>}>
          <CollectionBrowser />
        </Suspense>
      </div>
    </div>
  );
}

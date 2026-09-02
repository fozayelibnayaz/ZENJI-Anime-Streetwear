"use client";

import Link from "next/link";
import { useState } from "react";
import { DressStage } from "@/components/closet/DressStage";
import { Reveal } from "@/components/ui/Reveal";
import { getProduct } from "@/lib/catalogue";
import { availableSizes } from "@/lib/catalogue";
import { cx } from "@/lib/cx";

const SWATCHES = [
  { slug: "blue-flame-tee", label: "Blue Flame" },
  { slug: "ronin-heavyweight-hoodie", label: "Ronin Hoodie" },
  { slug: "shadow-cargo-pant", label: "Shadow Cargo" },
  { slug: "seal-cap", label: "Seal Cap" },
];

/**
 * Homepage teaser for THE CLOSET. It embeds the real dress figure so the visitor
 * can play before they click — the mini stage below is not a screenshot, it is
 * the actual component the tool page uses.
 */
export function ClosetTeaser() {
  const [slug, setSlug] = useState(SWATCHES[0].slug);
  const product = getProduct(slug)!;
  const size = availableSizes(product)[0] ?? "M";

  return (
    <section className="defer-paint border-b border-bone/10" aria-labelledby="closet-heading">
      <div className="shell grid items-center gap-12 py-20 lg:grid-cols-[1fr_0.72fr]">
        <Reveal>
          <p className="label">Console // the rack</p>
          <h2 id="closet-heading" className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
            See it on a body,
            <br />
            <span className="text-oxide">not a hanger</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-fog sm:text-base">
            Flat-lay tells you nothing about how a boxy tee hangs on you. Pick a frame, pick your size, and watch the
            piece render on the figure in real time — then stack a whole outfit or let the Melbourne weather decide.
          </p>

          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Preview a garment">
            {SWATCHES.map((item) => (
              <button
                key={item.slug}
                type="button"
                aria-pressed={slug === item.slug}
                onClick={() => setSlug(item.slug)}
                className={cx(
                  "h-10 border px-4 font-mono text-[0.66rem] uppercase tracking-[0.12em] transition-colors",
                  slug === item.slug ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:text-bone",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/closet"
              className="inline-flex h-13 items-center bg-bone px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-sumi transition-colors hover:bg-oxide hover:text-bone"
            >
              Open the Closet →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120} className="mx-auto w-full max-w-[300px]">
          <DressStage
            layers={[{ product, size }]}
            presentation="m"
            frame="boxy"
            className="border border-bone/10 shadow-panel"
          />
        </Reveal>
      </div>
    </section>
  );
}

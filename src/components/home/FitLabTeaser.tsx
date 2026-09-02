"use client";

import Link from "next/link";
import { sizeCharts } from "@/content/sizing";
import { GarmentSilhouette } from "@/components/fitlab/GarmentSilhouette";
import { Reveal } from "@/components/ui/Reveal";
import { usePreferences } from "@/providers/PreferencesProvider";

const STEPS = [
  "Lay a tee you already own flat on a table",
  "Measure armpit to armpit, then shoulder to hem",
  "We overlay it on our pattern and name your size",
];

/**
 * Homepage teaser for the Fit Lab. If the visitor has already used the tool it
 * stops selling and starts reporting — nobody needs to be pitched twice.
 */
export function FitLabTeaser() {
  const { fit } = usePreferences();
  const spec = sizeCharts.tee.find((entry) => entry.size === (fit?.size ?? "M"))!;

  return (
    <section className="border-y border-bone/10 bg-ink defer-paint" aria-labelledby="fitlab-heading">
      <div className="shell grid items-center gap-10 py-20 lg:grid-cols-[1fr_0.8fr]">
        <Reveal>
          <p className="label">Tool_001 — Fit Lab</p>
          <h2 id="fitlab-heading" className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
            Stop guessing what
            <br />
            <span className="text-oxide">oversized</span> means
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-fog sm:text-base">
            Every brand cuts &ldquo;oversized&rdquo; differently, which is why half of all streetwear gets returned. Measure a
            garment you already like and we will tell you exactly how ours compares — in centimetres, not adjectives.
          </p>

          <ol className="mt-8 space-y-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="font-mono text-xs text-oxide">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-sm text-fog">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/fit-lab"
              className="inline-flex h-13 items-center bg-bone px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-sumi transition-colors hover:bg-oxide hover:text-bone"
            >
              {fit ? "Recalculate my fit" : "Open the Fit Lab"} →
            </Link>
            {fit ? (
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-jade">
                Saved size: {fit.size} · confidence {fit.confidence}
              </p>
            ) : (
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel">Takes about 20 seconds</p>
            )}
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mx-auto h-72 w-full max-w-sm sm:h-96">
          <GarmentSilhouette
            garments={[
              { chest: fit?.chest ?? 51, length: fit?.length ?? 71, label: "Your garment", tone: "reference" },
              { chest: spec.chest, length: spec.length, label: `ZENJI ${spec.size}`, tone: "zenji" },
            ]}
          />
          <div className="mt-4 flex justify-center gap-6 font-mono text-[0.62rem] uppercase tracking-[0.14em]">
            <span className="flex items-center gap-2 text-steel">
              <span className="inline-block h-px w-6 border-t border-dashed border-steel" /> Your garment
            </span>
            <span className="flex items-center gap-2 text-oxide">
              <span className="inline-block h-px w-6 bg-oxide" /> ZENJI {spec.size}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

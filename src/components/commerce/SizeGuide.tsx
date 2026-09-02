"use client";

import { useState } from "react";
import Link from "next/link";
import { sizeCharts } from "@/content/sizing";
import { categoryLabels, type Category } from "@/content/products";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useUI } from "@/providers/UIProvider";
import { Sheet } from "@/components/ui/Sheet";
import { cx } from "@/lib/cx";

const TABS: Category[] = ["tee", "hoodie", "pant"];

export function SizeGuide() {
  const { overlay, closeOverlay } = useUI();
  const { unit, setUnit } = usePreferences();
  const [tab, setTab] = useState<Category>("tee");

  const convert = (cm: number) => (unit === "cm" ? cm.toFixed(0) : (cm / 2.54).toFixed(1));

  return (
    <Sheet
      open={overlay === "size-guide"}
      onClose={closeOverlay}
      placement="center"
      label="Size guide"
      className="max-h-[84dvh] overflow-y-auto p-5 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">Measured off the pattern, not estimated</p>
          <h2 className="display mt-2 text-3xl">Size guide</h2>
        </div>
        <button
          type="button"
          onClick={closeOverlay}
          aria-label="Close size guide"
          className="grid h-9 w-9 shrink-0 place-items-center border border-bone/20 text-steel transition-colors hover:border-oxide hover:text-oxide"
        >
          ✕
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Garment type" className="flex gap-2">
          {TABS.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={tab === category}
              onClick={() => setTab(category)}
              className={cx(
                "h-9 border px-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                tab === category ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:text-bone",
              )}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setUnit(unit === "cm" ? "in" : "cm")}
          className="h-9 border border-bone/20 px-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel transition-colors hover:border-bone/60 hover:text-bone"
        >
          {unit === "cm" ? "Switch to inches" : "Switch to cm"}
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[26rem] border-collapse text-left">
          <caption className="sr-only">
            {categoryLabels[tab]} flat measurements in {unit}
          </caption>
          <thead>
            <tr className="border-b border-bone/15">
              {["Size", `Chest (${unit})`, `Length (${unit})`, `Sleeve (${unit})`].map((heading) => (
                <th key={heading} scope="col" className="label py-3 font-normal">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {sizeCharts[tab].map((spec) => (
              <tr key={spec.size} className="border-b border-bone/8">
                <th scope="row" className="py-3 pr-4 font-mono text-sm font-normal text-bone">
                  {spec.size}
                </th>
                <td className="py-3 pr-4 text-fog">{convert(spec.chest)}</td>
                <td className="py-3 pr-4 text-fog">{convert(spec.length)}</td>
                <td className="py-3 text-fog">{spec.sleeve ? convert(spec.sleeve) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-fog">
        Chest is measured flat, armpit to armpit. Length runs from the highest point of the shoulder to the hem. Lay
        a garment you own on a table and compare — or let the Fit Lab do the maths.
      </p>

      <Link
        href="/fit-lab"
        onClick={closeOverlay}
        className="mt-4 inline-block font-mono text-[0.7rem] uppercase tracking-[0.16em] text-oxide underline underline-offset-4"
      >
        Open the Fit Lab →
      </Link>
    </Sheet>
  );
}

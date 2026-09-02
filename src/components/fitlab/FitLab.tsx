"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fitPreferences, referenceGarments, type FitPreference } from "@/content/sizing";
import { categoryLabels, type Category } from "@/content/products";
import { clampMeasurement, cmFromInches, inchesFromCm, recommendSize, FIT_LIMITS } from "@/lib/fit";
import { cx } from "@/lib/cx";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useUI } from "@/providers/UIProvider";
import { Action } from "@/components/ui/Action";
import { GarmentSilhouette } from "./GarmentSilhouette";
import { sizeCharts } from "@/content/sizing";

const CATEGORIES: Category[] = ["tee", "hoodie"];

const confidenceCopy: Record<"high" | "medium" | "low", string> = {
  high: "Strong match — this is your size.",
  medium: "Good match. Check the runner-up if you are fussy about length.",
  low: "Loose match. Your reference garment sits outside our usual range, so read the numbers below.",
};

/**
 * FIT LAB
 *
 * The whole tool is a controlled form over two numbers. Everything else —
 * ranking, silhouettes, copy — is derived, so there is no state to get out of sync.
 */
export function FitLab({ compact = false }: { compact?: boolean }) {
  const { unit, setUnit, fit, setFit } = usePreferences();
  const { toast } = useUI();

  const [category, setCategory] = useState<Category>("tee");
  const [preference, setPreference] = useState<FitPreference>(fit?.preference ?? "true");
  const [chest, setChest] = useState<number>(fit?.chest ?? 52);
  const [length, setLength] = useState<number>(fit?.length ?? 70);
  const [reference, setReference] = useState<string>("");

  const result = useMemo(
    () => recommendSize({ chest, length, preference, category }),
    [chest, length, preference, category],
  );

  const recommendedSpec = sizeCharts[category].find((spec) => spec.size === result.recommended)!;

  const display = (cm: number) => (unit === "cm" ? Math.round(cm) : Math.round(inchesFromCm(cm) * 10) / 10);
  const toCm = (value: number) => (unit === "cm" ? value : cmFromInches(value));

  const applyPreset = (id: string) => {
    setReference(id);
    const preset = referenceGarments.find((garment) => garment.id === id);
    if (!preset) return;
    setChest(preset.chest);
    setLength(preset.length);
  };

  const save = () => {
    setFit({
      size: result.recommended,
      chest,
      length,
      preference,
      confidence: result.confidence,
      savedAt: Date.now(),
    });
    toast(`Size ${result.recommended} saved — we'll preselect it for you`);
  };

  return (
    <div className={cx("grid gap-8 lg:grid-cols-[1.05fr_1fr]", compact && "lg:grid-cols-1")}>
      {/* ---------------- Controls ---------------- */}
      <div className="border border-bone/12 bg-ink p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label">Step 01 — what are we matching?</p>
          <button
            type="button"
            onClick={() => setUnit(unit === "cm" ? "in" : "cm")}
            className="h-8 border border-bone/20 px-3 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel transition-colors hover:border-bone/60 hover:text-bone"
          >
            {unit === "cm" ? "cm" : "inches"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={cx(
                "h-10 border px-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
                category === item ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:text-bone",
              )}
            >
              {categoryLabels[item]}
            </button>
          ))}
        </div>

        <hr className="my-6 border-bone/10" />

        <label htmlFor="fit-reference" className="label">
          Step 02 — pick something you already own
        </label>
        <select
          id="fit-reference"
          value={reference}
          onChange={(event) => applyPreset(event.target.value)}
          className="mt-3 h-12 w-full border border-bone/20 bg-sumi px-3 font-mono text-sm text-bone outline-none transition-colors focus:border-oxide"
        >
          <option value="">Custom — I measured it myself</option>
          {referenceGarments.map((garment) => (
            <option key={garment.id} value={garment.id}>
              {garment.label} — {garment.note}
            </option>
          ))}
        </select>

        <div className="mt-6 space-y-6">
          <Measurement
            id="fit-chest"
            label="Chest, armpit to armpit (flat)"
            unit={unit}
            value={display(chest)}
            min={display(FIT_LIMITS.chest.min)}
            max={display(FIT_LIMITS.chest.max)}
            onChange={(value) => {
              setReference("");
              setChest(clampMeasurement(toCm(value), "chest"));
            }}
          />
          <Measurement
            id="fit-length"
            label="Length, shoulder seam to hem"
            unit={unit}
            value={display(length)}
            min={display(FIT_LIMITS.length.min)}
            max={display(FIT_LIMITS.length.max)}
            onChange={(value) => {
              setReference("");
              setLength(clampMeasurement(toCm(value), "length"));
            }}
          />
        </div>

        <hr className="my-6 border-bone/10" />

        <p className="label">Step 03 — how do you want it to sit?</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {fitPreferences.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={preference === option.id}
              onClick={() => setPreference(option.id)}
              className={cx(
                "border p-3 text-left transition-colors",
                preference === option.id ? "border-oxide bg-oxide/10" : "border-bone/15 hover:border-bone/40",
              )}
            >
              <span className="display block text-lg">{option.label}</span>
              <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-steel">
                {option.note}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Result ---------------- */}
      <div className="flex flex-col gap-4">
        <div className="border border-bone/12 bg-ink p-5 sm:p-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="label">Your ZENJI size</p>
              <p className="display mt-2 text-7xl text-oxide sm:text-8xl" aria-live="polite">
                {result.recommended}
              </p>
              <p className="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
                Confidence: {result.confidence}
                {result.alternative ? ` · runner-up ${result.alternative}` : ""}
              </p>
            </div>

            <div className="h-36 w-28 shrink-0 sm:h-44 sm:w-36">
              <GarmentSilhouette
                garments={[
                  { chest, length, label: "Your garment", tone: "reference" },
                  {
                    chest: recommendedSpec.chest,
                    length: recommendedSpec.length,
                    label: `ZENJI ${result.recommended}`,
                    tone: "zenji",
                  },
                ]}
              />
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-fog">{confidenceCopy[result.confidence]}</p>
          <p className="mt-2 text-sm leading-relaxed text-fog">{result.summary}</p>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="label">Boxiness</span>
              <span className="font-mono text-xs text-bone">{result.boxiness}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-ash">
              <div
                className="h-full bg-oxide transition-[width] duration-500 ease-[var(--ease-slash)]"
                style={{ width: `${result.boxiness}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.12em] text-steel">
              <span>Lean</span>
              <span>Properly boxy</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Action onClick={save} className="h-12 px-6">
              Save my size
            </Action>
            <Link
              href={`/drop?size=${result.recommended}`}
              className="inline-flex h-12 items-center border border-bone/25 px-6 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors hover:border-oxide hover:text-oxide"
            >
              Shop {result.recommended} in stock →
            </Link>
          </div>

          {fit ? (
            <p className="mt-3 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-jade">
              Saved: {fit.size}. We preselect it on every product page.
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto border border-bone/12 bg-ink p-5 sm:p-7">
          <p className="label">Every size against your garment</p>
          <table className="mt-4 w-full min-w-[22rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-bone/15">
                {["Size", "Chest", "Length", "Match"].map((heading) => (
                  <th key={heading} scope="col" className="label py-2 font-normal">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {result.ranked.map((match) => (
                <tr
                  key={match.size}
                  className={cx("border-b border-bone/8", match.size === result.recommended && "bg-oxide/10")}
                >
                  <th scope="row" className="py-2.5 pr-4 font-mono text-sm font-normal text-bone">
                    {match.size}
                  </th>
                  <td className="py-2.5 pr-4 text-fog">
                    {match.chestDelta > 0 ? "+" : ""}
                    {match.chestDelta} cm
                  </td>
                  <td className="py-2.5 pr-4 text-fog">
                    {match.lengthDelta > 0 ? "+" : ""}
                    {match.lengthDelta} cm
                  </td>
                  <td className="py-2.5 text-fog">
                    <span className="inline-block h-1.5 w-16 bg-ash align-middle">
                      <span
                        className="block h-full bg-steel"
                        style={{ width: `${Math.max(4, 100 - Math.min(100, match.score * 12))}%` }}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface MeasurementProps {
  id: string;
  label: string;
  unit: "cm" | "in";
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** Slider and number input bound to the same value — drag on a phone, type on a desktop. */
function Measurement({ id, label, unit, value, min, max, onChange }: MeasurementProps) {
  const step = unit === "cm" ? 1 : 0.5;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={id} className="label max-w-[60%] leading-relaxed">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`${id}-number`}
            type="number"
            inputMode="decimal"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isNaN(next)) onChange(next);
            }}
            aria-label={`${label} in ${unit}`}
            className="h-10 w-20 border border-bone/20 bg-sumi px-2 text-right font-mono text-sm text-bone outline-none transition-colors focus:border-oxide"
          />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">{unit}</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none bg-ash accent-[var(--color-oxide)]"
      />
    </div>
  );
}

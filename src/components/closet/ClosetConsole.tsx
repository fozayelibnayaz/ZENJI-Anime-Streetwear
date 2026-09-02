"use client";

import { useMemo, useState } from "react";
import { Img } from "@/components/ui/Img";
import { DressStage } from "./DressStage";
import { availableSizes, getProduct } from "@/lib/catalogue";
import { categoryLabels, products, type Category, type Product, type Size } from "@/content/products";
import { sizeCharts } from "@/content/sizing";
import { formatPrice } from "@/lib/money";
import { cx } from "@/lib/cx";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useLoadout } from "@/providers/LoadoutProvider";
import { useUI } from "@/providers/UIProvider";
import {
  bodyFor,
  frames,
  lookForScenario,
  presentations,
  weatherScenarios,
  type DressLayer,
  type Frame,
  type Presentation,
} from "@/lib/wardrobe";

type Mode = "tryon" | "stack" | "weather";
const SLOTS: Category[] = ["tee", "hoodie", "pant", "headwear"];

function defaultSize(product: Product, saved?: Size | null): Size {
  const avail = availableSizes(product);
  if (saved && avail.includes(saved)) return saved;
  return avail[0] ?? "M";
}

function ProductPick({
  product,
  active,
  onPick,
}: {
  product: Product;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={cx(
        "group relative flex flex-col border text-left transition-colors",
        active ? "border-oxide" : "border-bone/10 hover:border-bone/50",
      )}
    >
      <span className="relative aspect-[4/5] w-full overflow-hidden bg-slate">
        <Img
          src={product.images.front}
          alt={`${product.name} — ${product.colourway}`}
          fill
          sizes="(min-width: 1024px) 9vw, 46vw"
          className="object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-slash)] group-hover:scale-[1.04]"
        />
        {product.images.back ? (
          <Img
            src={product.images.back}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 9vw, 46vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : null}
        {active ? (
          <span className="absolute right-1.5 top-1.5 bg-oxide px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-widest text-bone">
            On
          </span>
        ) : null}
      </span>
      <span className="flex items-center justify-between gap-2 p-2">
        <span className="min-w-0">
          <span className="block truncate text-xs text-bone">{product.name}</span>
          <span className="block font-mono text-[0.58rem] uppercase tracking-[0.12em] text-steel">
            {formatPrice(product.price)}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={cx(
            "font-mono text-xs transition-colors",
            active ? "text-oxide" : "text-steel group-hover:text-bone",
          )}
        >
          +
        </span>
      </span>
    </button>
  );
}

function SizeChips({ sizes, value, onChange }: { sizes: Size[]; value: Size; onChange: (s: Size) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          aria-pressed={size === value}
          onClick={() => onChange(size)}
          className={cx(
            "h-9 min-w-11 border px-2 font-mono text-xs transition-colors",
            size === value ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-fog hover:border-bone/60 hover:text-bone",
          )}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

function FramePicker({
  presentation,
  setPresentation,
  frame,
  setFrame,
}: {
  presentation: Presentation;
  setPresentation: (p: Presentation) => void;
  frame: Frame;
  setFrame: (f: Frame) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <p className="label">Presentation</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {presentations.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.note}
              aria-pressed={presentation === item.id}
              onClick={() => setPresentation(item.id)}
              className={cx(
                "h-10 min-w-12 border px-3 font-mono text-xs transition-colors",
                presentation === item.id ? "border-bone bg-bone text-sumi" : "border-bone/20 text-fog hover:text-bone",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Frame</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {frames.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.note}
              aria-pressed={frame === item.id}
              onClick={() => setFrame(item.id)}
              className={cx(
                "h-10 border px-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] transition-colors",
                frame === item.id ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-fog hover:text-bone",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClosetConsole() {
  const { fit } = usePreferences();
  const { add: addToLoadout } = useLoadout();
  const { toast } = useUI();
  const [mode, setMode] = useState<Mode>("tryon");
  const [presentation, setPresentation] = useState<Presentation>("m");
  const [frame, setFrame] = useState<Frame>("classic");

  // TRY ON state
  const [category, setCategory] = useState<Category>("tee");
  const [slug, setSlug] = useState<string>(products[0].slug);
  const [trySize, setTrySize] = useState<Size>(defaultSize(products[0], fit?.size));
  const [compareSize, setCompareSize] = useState<Size | null>(null);

  // STACK state
  const [stack, setStack] = useState<Partial<Record<Category, { slug: string; size: Size }>>>({});

  // WEATHER state
  const [scenarioId, setScenarioId] = useState(weatherScenarios[0].id);
  const [lookSizes, setLookSizes] = useState<Record<string, Size>>({});

  const byCategory = useMemo(() => {
    const map = new Map<Category, Product[]>();
    for (const slot of SLOTS) map.set(slot, products.filter((p) => p.category === slot));
    return map;
  }, []);

  const activeProduct = getProduct(slug)!;
  const categoryProducts = byCategory.get(category) ?? [];

  const switchProduct = (nextSlug: string) => {
    setSlug(nextSlug);
    const product = getProduct(nextSlug)!;
    setTrySize(defaultSize(product, fit?.size));
  };

  const switchCategory = (next: Category) => {
    setCategory(next);
    const first = byCategory.get(next)?.[0];
    if (first) switchProduct(first.slug);
  };

  // ---- TRY ON layer ----
  const tryLayers: DressLayer[] = useMemo(
    () => [{ product: activeProduct, size: trySize }],
    [activeProduct, trySize],
  );
  const trySpec =
    sizeCharts[activeProduct.category].find((s) => s.size === trySize) ?? sizeCharts[activeProduct.category][0];

  // ---- STACK layers ----
  const stackLayers: DressLayer[] = useMemo(() => {
    const layers: DressLayer[] = [];
    for (const slot of SLOTS) {
      const pick = stack[slot];
      if (!pick) continue;
      const product = getProduct(pick.slug);
      if (product) layers.push({ product, size: pick.size });
    }
    return layers;
  }, [stack]);
  const stackTotal = stackLayers.reduce((sum, layer) => sum + layer.product.price, 0);

  // ---- WEATHER layers ----
  const weatherLayers = useMemo(
    () =>
      lookForScenario(scenarioId).map((layer) =>
        lookSizes[layer.product.slug] ? { ...layer, size: lookSizes[layer.product.slug] } : layer,
      ),
    [scenarioId, lookSizes],
  );
  const scenario = weatherScenarios.find((entry) => entry.id === scenarioId)!;
  const body = bodyFor(presentation, frame);

  return (
    <div>
      {/* mode switch */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Closet modes">
        {(
          [
            ["tryon", "Try on"],
            ["stack", "Stack a look"],
            ["weather", "Weather the drop"],
          ] as [Mode, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={cx(
              "h-11 border px-5 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
              mode === id ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:text-bone",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-bone/12 bg-ink p-4 sm:p-6">
        <FramePicker presentation={presentation} setPresentation={setPresentation} frame={frame} setFrame={setFrame} />
      </div>

      {/* ---- TRY ON ---- */}
      {mode === "tryon" ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <div>
              <p className="label">01 — pick a category</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SLOTS.filter((slot) => byCategory.get(slot)!.length).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={category === slot}
                    onClick={() => switchCategory(slot)}
                    className={cx(
                      "h-10 border px-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
                      category === slot ? "border-bone bg-bone text-sumi" : "border-bone/20 text-steel hover:text-bone",
                    )}
                  >
                    {categoryLabels[slot]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="label">02 — choose a piece</p>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-steel">
                  {categoryProducts.length} in {categoryLabels[category]}
                </p>
              </div>
              <div className="mt-3 grid max-h-[420px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                {categoryProducts.map((product) => (
                  <ProductPick
                    key={product.slug}
                    product={product}
                    active={product.slug === slug}
                    onPick={() => switchProduct(product.slug)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="label">03 — size</p>
                <button
                  type="button"
                  aria-pressed={!!compareSize}
                  onClick={() => setCompareSize(compareSize ? null : trySize)}
                  className={cx(
                    "h-8 border px-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-colors",
                    compareSize
                      ? "border-oxide bg-oxide text-bone"
                      : "border-bone/20 text-steel hover:text-bone",
                  )}
                >
                  {compareSize ? "Clear size compare" : "Compare a size"}
                </button>
              </div>
              <div className="mt-3">
                <SizeChips sizes={availableSizes(activeProduct)} value={trySize} onChange={setTrySize} />
              </div>
              {compareSize ? (
                <div className="mt-3">
                  <p className="label mb-2">Ghost second size — how does {trySize} differ?</p>
                  <SizeChips
                    sizes={availableSizes(activeProduct)}
                    value={compareSize}
                    onChange={(s) => {
                      if (s === trySize) {
                        // pick the next-largest available so they never overlap
                        const next = availableSizes(activeProduct).find((c) => c !== trySize);
                        if (next) setCompareSize(next);
                      } else {
                        setCompareSize(s);
                      }
                    }}
                  />
                </div>
              ) : null}
              <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
                Flat: chest {trySpec.chest}cm · length {trySpec.length}cm
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <DressStage
              layers={tryLayers}
              presentation={presentation}
              frame={frame}
              compare={
                compareSize && compareSize !== trySize
                  ? { product: activeProduct, size: compareSize }
                  : null
              }
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-bone">{activeProduct.name}</p>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
                  {activeProduct.colourway} · size {trySize}
                </p>
              </div>
              <p className="font-mono text-sm text-bone">
                {formatPrice(activeProduct.price)}
                {activeProduct.compareAt ? (
                  <span className="ml-2 text-steel line-through">{formatPrice(activeProduct.compareAt)}</span>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---- STACK ---- */}
      {mode === "stack" ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <p className="label">Build a full outfit — one slot per layer</p>
            <div className="space-y-4">
              {SLOTS.map((slot) => {
                const options = byCategory.get(slot) ?? [];
                const pick = stack[slot];
                return (
                  <div key={slot} className="border border-bone/12 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel">
                        {categoryLabels[slot]} slot
                      </p>
                      {pick ? (
                        <button
                          type="button"
                          onClick={() =>
                            setStack((prev) => {
                              const next = { ...prev };
                              delete next[slot];
                              return next;
                            })
                          }
                          className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel hover:text-oxide"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {options.map((product) => (
                        <button
                          key={product.slug}
                          type="button"
                          aria-pressed={pick?.slug === product.slug}
                          onClick={() =>
                            setStack((prev) => ({ ...prev, [slot]: { slug: product.slug, size: defaultSize(product, fit?.size) } }))
                          }
                          className={cx(
                            "border px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] transition-colors",
                            pick?.slug === product.slug
                              ? "border-oxide bg-oxide text-bone"
                              : "border-bone/20 text-fog hover:border-bone/60 hover:text-bone",
                          )}
                        >
                          {product.name}
                        </button>
                      ))}
                    </div>
                    {pick ? (
                      <div className="mt-3 flex items-center gap-3">
                        <span className="label">Size</span>
                        <SizeChips sizes={availableSizes(getProduct(pick.slug)!)} value={pick.size} onChange={(s) => setStack((prev) => ({ ...prev, [slot]: { ...prev[slot]!, size: s } }))} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-bone/10 pt-4">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel">
                {stackLayers.length}/4 pieces · {stackLayers.length ? formatPrice(stackTotal) : "—"}
              </p>
              <button
                type="button"
                disabled={stackLayers.length === 0}
                onClick={() => {
                  stackLayers.forEach((layer) => addToLoadout(layer.product.slug, layer.size));
                  toast(`Added ${stackLayers.length} piece${stackLayers.length === 1 ? "" : "s"} to your loadout`);
                }}
                className="h-11 bg-oxide px-5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-bone transition-colors hover:bg-oxide-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add look to loadout
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <DressStage layers={stackLayers} presentation={presentation} frame={frame} />
            <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
              {stackLayers.length
                ? `Worn: ${stackLayers.map((l) => `${l.product.name} (${l.size})`).join(" · ")}`
                : "Pick at least one piece to dress the figure."}
            </p>
          </div>
        </div>
      ) : null}

      {/* ---- WEATHER ---- */}
      {mode === "weather" ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <p className="label">Melbourne, today — what do you reach for?</p>
            <div className="flex flex-wrap gap-2">
              {weatherScenarios.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={scenarioId === entry.id}
                  onClick={() => setScenarioId(entry.id)}
                  className={cx(
                    "flex flex-col border px-4 py-3 text-left transition-colors",
                    scenarioId === entry.id ? "border-oxide bg-slate" : "border-bone/12 hover:border-bone/40",
                  )}
                >
                  <span className="font-mono text-xl text-bone">{entry.temp}</span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">{entry.label}</span>
                </button>
              ))}
            </div>

            <div className="border border-bone/12 bg-slate p-5">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-oxide">
                {scenario.code} · {scenario.temp} · {scenario.conditions}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-fog">{scenario.blurb}</p>
            </div>

            <div className="space-y-3">
              {weatherLayers.map((layer, index) => (
                <div key={layer.product.slug} className="flex items-center justify-between border border-bone/12 p-3">
                  <div>
                    <p className="text-sm text-bone">
                      {index + 1}. {layer.product.name}
                    </p>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
                      {categoryLabels[layer.product.category]} · {formatPrice(layer.product.price)}
                    </p>
                  </div>
                  <SizeChips
                    sizes={availableSizes(layer.product)}
                    value={layer.size}
                    onChange={(s) => setLookSizes((prev) => ({ ...prev, [layer.product.slug]: s }))}
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-bone/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  weatherLayers.forEach((layer) => addToLoadout(layer.product.slug, layer.size));
                  toast(`Dressed for ${scenario.label} — added ${weatherLayers.length} piece${weatherLayers.length === 1 ? "" : "s"}`);
                }}
                className="h-11 bg-oxide px-5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-bone transition-colors hover:bg-oxide-deep"
              >
                Add the {scenario.label} look to loadout
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <DressStage layers={weatherLayers} presentation={presentation} frame={frame} />
            <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
              Dressed for {scenario.temp} on a {body.torsoCm}cm torso
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

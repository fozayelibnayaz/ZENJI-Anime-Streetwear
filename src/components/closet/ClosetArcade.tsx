"use client";

import { useEffect, useRef, useState } from "react";
import { products, type Category, type Size } from "@/content/products";
import { availableSizes, getProduct } from "@/lib/catalogue";
import { usePersistentState } from "@/hooks/usePersistentState";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useUI } from "@/providers/UIProvider";
import { useCred } from "@/lib/cred";
import { withBasePath } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { DressStage } from "./DressStage";
import type { DressLayer } from "@/lib/wardrobe";

const SLOTS: Category[] = ["tee", "hoodie", "pant", "headwear"];

interface Picked {
  slug: string;
  size: Size;
}

interface SlotStore {
  slots: (Partial<Record<Category, Picked>> | null)[];
}

/**
 * CLOSET ARCADE — the rail as a physics toy.
 *
 * Every piece hangs on a spring-damped hanger: hover flicks it, hanging or
 * removing a piece kicks its neighbours, and the whole rack settles like a
 * real rail. Stack a look on the figure, save it to one of three slots, and
 * watch street cred tick up. Runs on requestAnimationFrame with direct DOM
 * writes — zero React re-renders in the physics loop.
 */
export function ClosetArcade() {
  const { fit } = usePreferences();
  const { toast } = useUI();
  const { points, level, next, progress, hydrated, earn } = useCred();
  const [stack, setStack] = useState<Partial<Record<Category, Picked>>>({});
  const [slotStore, setSlotStore] = usePersistentState<SlotStore>("zenji.closet.slots.v1", {
    slots: [null, null, null],
  });
  const { motion } = usePreferences();

  const physics = useRef(new Map<string, { theta: number; omega: number; node: HTMLElement | null }>());

  // Spring-damped pendulum per hanger; direct style writes, no re-render.
  useEffect(() => {
    if (motion === "off") return;
    let frame = 0;
    const tick = () => {
      physics.current.forEach((entry) => {
        if (!entry.node) return;
        entry.omega += -0.018 * entry.theta - 0.055 * entry.omega;
        entry.theta += entry.omega;
        if (Math.abs(entry.theta) + Math.abs(entry.omega) < 0.02) {
          entry.theta = 0;
          entry.omega = 0;
          return;
        }
        entry.node.style.transform = `rotate(${entry.theta}deg)`;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [motion]);

  const entryFor = (slug: string) => {
    let entry = physics.current.get(slug);
    if (!entry) {
      entry = { theta: 0, omega: 0, node: null };
      physics.current.set(slug, entry);
    }
    return entry;
  };

  const kick = (slug: string, force: number) => {
    const index = products.findIndex((p) => p.slug === slug);
    for (let offset = -2; offset <= 2; offset++) {
      const neighbour = products[index + offset];
      if (!neighbour) continue;
      entryFor(neighbour.slug).omega += force * (offset === 0 ? 1.6 : 1 / Math.abs(offset));
    }
  };

  const toggle = (slug: string) => {
    const product = getProduct(slug);
    if (!product) return;
    const current = stack[product.category];
    const hanging = current?.slug !== slug;
    kick(slug, hanging ? 3.2 : -3);
    setStack((existing) => {
      const nextStack = { ...existing };
      if (!hanging) {
        delete nextStack[product.category];
      } else {
        const size = availableSizes(product).includes(fit?.size ?? "M")
          ? (fit?.size as Size)
          : (availableSizes(product)[0] ?? "M");
        nextStack[product.category] = { slug, size };
      }
      return nextStack;
    });
    if (hanging) earn("hung a piece on the rail", 5);
  };

  // STYLE ROULETTE — the rack spins and dresses the figure for you.
  const [spinning, setSpinning] = useState(false);
  const roulette = () => {
    if (spinning) return;
    setSpinning(true);
    let ticks = 0;
    const id = window.setInterval(() => {
      ticks += 1;
      const next: Partial<Record<Category, Picked>> = {};
      for (const cat of SLOTS) {
        const pool = products.filter((p) => p.category === cat);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (!pick) continue;
        const size =
          fit?.size && availableSizes(pick).includes(fit.size)
            ? (fit.size as Size)
            : (availableSizes(pick)[0] ?? "M");
        next[cat] = { slug: pick.slug, size };
      }
      setStack(next);
      if (ticks % 3 === 0) kick(next.tee?.slug ?? products[0].slug, 2.6);
      if (ticks >= 12) {
        window.clearInterval(id);
        setSpinning(false);
        earn("let the roulette dress the figure", 4);
      }
    }, 110);
  };

  const layers: DressLayer[] = SLOTS.flatMap((slot) => {
    const pick = stack[slot];
    if (!pick) return [];
    const product = getProduct(pick.slug);
    return product ? [{ product, size: pick.size }] : [];
  });
  const total = layers.reduce((sum, layer) => sum + layer.product.price, 0);

  const saveSlot = (index: number) => {
    setSlotStore((current) => {
      const slots = [...current.slots];
      slots[index] = { ...stack };
      return { slots };
    });
    earn("saved a look to a slot", 15);
    toast(`Look saved to slot ${index + 1}`);
  };

  const loadSlot = (index: number) => {
    const saved = slotStore.slots[index];
    if (!saved) return;
    setStack(saved);
    products.forEach((p) => kick(p.slug, 1.4));
  };

  return (
    <section aria-label="Closet arcade — the physical rail" className="mb-10 border border-bone/12 bg-ink p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label">Arcade // {`{ RAIL : PHYSICAL }`}</p>
          <h2 className="display mt-2 text-2xl sm:text-3xl">Work the rail</h2>
        </div>
        {/* street cred badge */}
        <div className="min-w-44 border border-bone/15 bg-sumi px-3 py-2" aria-label={`Street cred: ${points} points, rank ${level.title}`}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">
              cred <span className="jp text-oxide">{level.kanji}</span>
            </p>
            <p className="display text-sm text-bone">
              {level.title} · {hydrated ? points : 0}
            </p>
          </div>
          <div className="mt-2 h-1 bg-bone/10">
            <div className="h-full bg-oxide transition-[width] duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-steel">
            {next ? `next: ${next.title} at ${next.min}` : "max rank — legend"}
          </p>
        </div>
      </div>

      {/* the physical rail */}
      <div className="relative mt-6 overflow-x-auto pb-2" role="group" aria-label="Garment rail — click a hanger to dress the figure">
        <div className="pointer-events-none absolute inset-x-0 top-3 h-1 bg-bone/25" aria-hidden />
        <div className="flex min-w-max gap-1 px-1 pt-1">
          {products.map((product) => {
            const worn = stack[product.category]?.slug === product.slug;
            return (
              <button
                key={product.slug}
                type="button"
                aria-pressed={worn}
                title={`${product.name} — hang / unhang`}
                onClick={() => toggle(product.slug)}
                onPointerEnter={() => {
                  if (motion !== "off") entryFor(product.slug).omega += (Math.random() - 0.5) * 2.6;
                }}
                className="group relative flex w-20 shrink-0 flex-col items-center pt-3"
              >
                <span
                  ref={(node) => {
                    entryFor(product.slug).node = node;
                  }}
                  className="flex w-full origin-top flex-col items-center transition-colors"
                  style={{ transform: "rotate(0deg)" }}
                >
                  <svg viewBox="0 0 60 26" className="h-6 w-14" aria-hidden>
                    <path d="M30 2 q6 0 6 6 q0 5 -6 6" fill="none" stroke={worn ? "#e23a2e" : "#6d6d74"} strokeWidth="2.4" />
                    <path d="M30 14 L4 25 H56 Z" fill="none" stroke={worn ? "#e23a2e" : "#6d6d74"} strokeWidth="2.4" />
                  </svg>
                  <img
                    src={withBasePath(product.images.front)}
                    alt={product.name}
                    loading="lazy"
                    draggable={false}
                    className={cx(
                      "aspect-[4/5] w-16 border object-cover transition-all",
                      worn ? "border-oxide opacity-100" : "border-bone/10 opacity-80 group-hover:opacity-100",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="border border-bone/10 bg-sumi p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="label">The figure</p>
            <button
              type="button"
              onClick={roulette}
              disabled={spinning}
              className={cx(
                "border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] transition-colors",
                spinning
                  ? "border-oxide bg-oxide/20 text-oxide"
                  : "border-oxide/60 text-oxide hover:bg-oxide hover:text-bone",
              )}
            >
              {spinning ? "Spinning…" : "Style roulette"}
            </button>
          </div>
          <DressStage layers={layers} presentation="u" frame="boxy" />
          <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">
            {layers.length} on the figure · {total > 0 ? `A$${(total / 100).toFixed(2)}` : "empty rail"}
          </p>
        </div>

        <div className="space-y-4">
          <p className="label">Outfit slots</p>
          {[0, 1, 2].map((index) => {
            const saved = slotStore.slots[index];
            const count = saved ? Object.values(saved).filter(Boolean).length : 0;
            return (
              <div key={index} className="flex items-center gap-3 border border-bone/10 bg-sumi p-3">
                <span className="display text-lg text-steel">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-fog">
                  {saved ? `${count} pieces hung` : "empty slot"}
                </span>
                <button
                  type="button"
                  onClick={() => saveSlot(index)}
                  className="border border-bone/20 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog hover:border-oxide hover:text-oxide"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => loadSlot(index)}
                  disabled={!saved}
                  className="border border-bone/20 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog hover:border-bone/60 hover:text-bone disabled:opacity-40"
                >
                  Wear
                </button>
              </div>
            );
          })}
          <p className="text-[0.68rem] leading-relaxed text-steel">
            Hangers are live — flick them, hang pieces, save the look. Every bit of play earns street cred:{" "}
            <span className="text-fog">hang +5 · save +15 · omikuji +10 · DNA +10 · card +20</span>.
          </p>
        </div>
      </div>
    </section>
  );
}

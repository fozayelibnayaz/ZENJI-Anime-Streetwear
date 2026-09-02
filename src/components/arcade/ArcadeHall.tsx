"use client";

import { useEffect, useRef, useState } from "react";
import { koma } from "@/content/arcade";
import { products } from "@/content/products";
import { withBasePath } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { useCred } from "@/lib/cred";
import { useUI } from "@/providers/UIProvider";
import { Koma, type KomaMood } from "./Koma";
import { SlashGame } from "./SlashGame";
import { Versus } from "./Versus";
import { TagWall } from "./TagWall";

type Room = "slash" | "versus" | "wall";

const ROOMS: { id: Room; label: string }[] = [
  { id: "slash", label: "Slash the drop" },
  { id: "versus", label: "The versus" },
  { id: "wall", label: "The wall" },
];

/**
 * THE ARCADE — KOMA hosts three rooms.
 * Dress the cat in any print from the catalogue; he comments. His moods are
 * driven by how you play.
 */
export function ArcadeHall() {
  const [room, setRoom] = useState<Room>("slash");
  const [mood, setMood] = useState<KomaMood>("idle");
  const [dressed, setDressed] = useState(products[0]);
  const [line, setLine] = useState<string>(koma.idle[0]);
  const { earn } = useCred();
  const { toast } = useUI();
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // idle chatter
  useEffect(() => {
    const timer = setInterval(() => {
      if (mood === "idle") setLine(koma.idle[Math.floor(Math.random() * koma.idle.length)]);
    }, 9000);
    return () => clearInterval(timer);
  }, [mood]);

  const react = (next: KomaMood, said: string) => {
    setMood(next);
    setLine(said);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood("idle"), 2600);
  };

  const dress = (slug: string) => {
    const product = products.find((p) => p.slug === slug);
    if (!product) return;
    setDressed(product);
    setLine(koma.dressed(product.name));
    earn("dressed KOMA", 2);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
      {/* KOMA corner */}
      <div className="relative flex flex-col items-center border border-bone/12 bg-ink p-6">
        <p className="label self-start">
          Mascot_001 // {koma.species}
        </p>
        <div className="relative mt-2 w-52 sm:w-60">
          <Koma mood={mood} print={dressed.kanji} printColor={dressed.swatch} />
        </div>
        <p className="display mt-2 text-2xl tracking-[0.2em]">{koma.name}</p>
        <p className="relative mt-3 min-h-16 max-w-64 border border-bone/15 bg-sumi p-3 text-center text-xs leading-relaxed text-fog">
          <span aria-hidden className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-bone/15 bg-sumi" />
          {line}
        </p>

        <p className="label mt-6 self-start">Hang a print on him</p>
        <div className="mt-2 grid max-h-36 w-full grid-cols-4 gap-1.5 overflow-y-auto pr-1">
          {products.map((product) => (
            <button
              key={product.slug}
              type="button"
              title={product.name}
              aria-pressed={dressed.slug === product.slug}
              onClick={() => dress(product.slug)}
              className={cx(
                "border p-1 transition-colors",
                dressed.slug === product.slug ? "border-oxide" : "border-bone/10 hover:border-bone/40",
              )}
            >
              <img src={withBasePath(product.images.front)} alt={product.name} className="aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {/* rooms */}
      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Arcade rooms">
          {ROOMS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={room === r.id}
              onClick={() => setRoom(r.id)}
              className={cx(
                "h-11 border px-5 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                room === r.id ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:text-bone",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {room === "slash" ? (
            <SlashGame
              onMood={(m) =>
                react(m, m === "cheer" ? koma.cheer[Math.floor(Math.random() * koma.cheer.length)] : koma.sulk[Math.floor(Math.random() * koma.sulk.length)])
              }
            />
          ) : room === "versus" ? (
            <Versus />
          ) : (
            <TagWall />
          )}
        </div>

        <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
          cred: dress +2 · slice combos · crown +5 · tag +5 · wall export +10
          <button type="button" className="ml-3 text-fog underline-offset-2 hover:text-bone hover:underline" onClick={() => toast("Original characters only — rule 01. KOMA is ours; famous cats belong to their studios.")}>
            why no famous characters?
          </button>
        </p>
      </div>
    </div>
  );
}

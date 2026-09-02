"use client";

import { useMemo, useState } from "react";
import { withBasePath } from "@/lib/asset";
import { formatPrice } from "@/lib/money";
import { CRED_LEVELS, useCred } from "@/lib/cred";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  MOVES,
  applyMove,
  credFor,
  dailyItems,
  discountPct,
  openDeal,
  shake,
  todayKey,
  type CounterMove,
  type DealState,
} from "@/lib/counter";
import { cx } from "@/lib/cx";

interface CounterStore {
  best: Record<string, number>;
  deals: number;
}

/** KAGE — the shopkeeper. His face tracks his mood. */
function Kage({ mood, talking }: { mood: number; talking: boolean }) {
  const brow = (mood - 50) / 6; // degrees of lift
  const mouth =
    mood > 66
      ? "M 42 66 Q 50 74 58 66" // smile
      : mood > 40
        ? "M 42 68 Q 50 70 58 68" // flat-ish
        : "M 42 71 Q 50 64 58 71"; // frown
  return (
    <svg viewBox="0 0 100 110" aria-hidden="true" className="h-44 w-40 shrink-0">
      {/* shoulders + apron */}
      <path d="M18 110 Q 20 84 34 80 L 66 80 Q 80 84 82 110 Z" className="fill-sumi stroke-bone/40" strokeWidth="1.5" />
      <path d="M38 82 L 40 108 L 60 108 L 62 82" className="fill-none stroke-oxide/70" strokeWidth="1.5" />
      {/* neck + head */}
      <rect x="44" y="70" width="12" height="10" className="fill-bone/70" />
      <circle cx="50" cy="50" r="24" className="fill-bone/85" />
      {/* beanie */}
      <path d="M26 46 Q 28 22 50 22 Q 72 22 74 46 L 74 40 Q 70 18 50 18 Q 30 18 26 40 Z" className="fill-oxide" />
      <rect x="25" y="40" width="50" height="7" rx="3" className="fill-oxide" />
      {/* brows */}
      <line x1="36" y1={44 - brow} x2="46" y2={44 + brow / 2} className="stroke-sumi" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="54" y1={44 + brow / 2} x2="64" y2={44 - brow} className="stroke-sumi" strokeWidth="2.4" strokeLinecap="round" />
      {/* eyes (blink via CSS) */}
      <g className={talking ? "kage-blink" : undefined}>
        <circle cx="41" cy="50" r="2.6" className="fill-sumi" />
        <circle cx="59" cy="50" r="2.6" className="fill-sumi" />
      </g>
      {/* nose + mouth */}
      <path d="M50 52 L 48 58 L 52 58" className="fill-none stroke-sumi/60" strokeWidth="1.4" />
      <path d={mouth} className="fill-none stroke-sumi" strokeWidth="2.2" strokeLinecap="round" />
      {/* tape measure around neck */}
      <path d="M38 80 L 42 96 M 62 80 L 58 96" className="stroke-bone/60" strokeWidth="3" strokeDasharray="3 2" />
    </svg>
  );
}

export function CounterGame() {
  const day = todayKey();
  const items = useMemo(() => dailyItems(day), [day]);
  const { level, earn } = useCred();
  const levelIndex = CRED_LEVELS.indexOf(level);
  const [store, setStore] = usePersistentState<CounterStore>("zenji.counter.v1", { best: {}, deals: 0 });
  const [deal, setDeal] = useState<DealState | null>(null);
  const [talking, setTalking] = useState(false);

  const say = (next: DealState) => {
    setTalking(true);
    window.setTimeout(() => setTalking(false), 900);
    setDeal(next);
  };

  const closeOut = (next: DealState) => {
    if (next.walked) earn("tried to walk on KAGE", credFor(next));
    else {
      earn(`haggled ${next.name} down ${discountPct(next)}%`, credFor(next));
      setStore((s) => ({
        best: { ...s.best, [next.slug]: Math.max(s.best[next.slug] ?? 0, discountPct(next)) },
        deals: s.deals + 1,
      }));
    }
  };

  const play = (move: CounterMove) => {
    if (!deal || deal.done) return;
    const next = applyMove(deal, move);
    say(next);
    if (next.done) closeOut(next);
  };

  const shakeOn = () => {
    if (!deal || deal.done || deal.walked) return;
    const next = shake(deal);
    say(next);
    closeOut(next);
  };

  const pct = deal ? discountPct(deal) : 0;
  const span = deal ? deal.ask - deal.floor : 1;
  const marker = deal ? ((deal.ask - deal.price) / span) * 100 : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
      {/* KAGE + his line */}
      <div className="flex flex-col items-center gap-4">
        <Kage mood={deal?.mood ?? 55} talking={talking} />
        <div className="min-h-24 w-full max-w-xs border border-bone/15 bg-sumi/70 p-4 font-mono text-xs leading-relaxed text-fog">
          <span className="mb-1 block text-[0.6rem] uppercase tracking-[0.2em] text-oxide">KAGE // counter</span>
          {deal ? deal.line : "Three pieces under the counter today. Pick one, and mind your manners."}
        </div>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-steel">
          deals closed: {store.deals} · rank: {level.title}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* stock picker */}
        {!deal && (
          <div className="grid gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => say(openDeal(item, day, levelIndex))}
                className="group border border-bone/15 bg-slate/60 p-3 text-left transition-colors hover:border-oxide/70"
              >
                <div
                  className="mb-3 aspect-square w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${withBasePath(item.images.front)})` }}
                />
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone">{item.name}</p>
                <p className="mt-1 font-mono text-xs text-steel">{formatPrice(item.price)}</p>
                {store.best[item.slug] ? (
                  <p className="mt-1 font-mono text-[0.6rem] text-oxide">best cut: {store.best[item.slug]}%</p>
                ) : null}
              </button>
            ))}
          </div>
        )}

        {/* the deal */}
        {deal && (
          <div className="border border-bone/15 bg-slate/50 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-black uppercase tracking-tight text-bone">{deal.name}</h3>
              <p className="font-mono text-2xl tabular-nums text-oxide" aria-live="polite">
                {formatPrice(deal.price)}
              </p>
            </div>

            {/* price bar: ask → floor */}
            <div className="mt-4">
              <div className="relative h-2 w-full bg-sumi">
                <div className="absolute inset-y-0 left-0 bg-oxide/70" style={{ width: `${marker}%` }} />
                <div
                  className="absolute -top-1 h-4 w-1 bg-bone transition-[left] duration-500"
                  style={{ left: `calc(${marker}% - 2px)` }}
                />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel">
                <span>tag {formatPrice(deal.ask)}</span>
                <span>rumoured floor {formatPrice(deal.floor)}</span>
              </div>
            </div>

            {/* rounds */}
            <div className="mt-3 flex items-center gap-1.5" aria-label={`${deal.rounds} of ${deal.maxRounds} moves used`}>
              {Array.from({ length: deal.maxRounds }).map((_, i) => (
                <span key={i} className={cx("h-1.5 w-6", i < deal.rounds ? "bg-oxide" : "bg-bone/20")} />
              ))}
              <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel">
                {Math.max(0, deal.maxRounds - deal.rounds)} moves left
              </span>
            </div>

            {/* moves */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MOVES.map((move) => (
                <button
                  key={move.id}
                  type="button"
                  disabled={deal.done}
                  onClick={() => play(move.id)}
                  title={move.hint}
                  className="border border-bone/20 bg-sumi/60 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-fog transition-colors hover:border-oxide/70 hover:text-bone disabled:opacity-40"
                >
                  {move.label}
                  <span className="block text-[0.55rem] text-steel">{deal.uses[move.id]} used</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!deal.done && (
                <button
                  type="button"
                  onClick={shakeOn}
                  className="bg-oxide px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-bone transition-transform hover:-translate-y-0.5"
                >
                  Shake on {formatPrice(deal.price)}
                </button>
              )}
              {deal.done && !deal.walked && (
                <p className="border border-oxide/60 bg-oxide/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-bone">
                  Counter slip — {pct}% off · +{credFor(deal)} cred
                </p>
              )}
              {deal.walked && (
                <p className="border border-bone/20 bg-sumi/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-steel">
                  You walked. +2 cred for the attempt.
                </p>
              )}
              <button
                type="button"
                onClick={() => setDeal(null)}
                className="px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-steel underline-offset-4 hover:text-bone hover:underline"
              >
                Back to the counter
              </button>
            </div>
          </div>
        )}

        <p className="max-w-prose font-mono text-[0.65rem] leading-relaxed text-steel">
          KAGE restocks daily. Bluffs land when his mood is high; walking is a gamble — sometimes he calls you back
          with the real price. Rōnin rank and up earn a fifth move. Concept play only: slips are bragging rights, not
          checkout codes.
        </p>
      </div>
    </div>
  );
}

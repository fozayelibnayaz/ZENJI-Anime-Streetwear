"use client";

import { useEffect, useRef, useState } from "react";
import { dayKey, drawFortune, type DrawnFortune } from "@/lib/omikuji";
import { useFortune } from "@/hooks/useFortune";
import { useCred } from "@/lib/cred";
import { useUI } from "@/providers/UIProvider";
import { cx } from "@/lib/cx";

type Phase = "idle" | "shaking" | "stick" | "paper";

/**
 * THE SHRINE — one omikuji a day.
 *
 * Hold the cylinder and shake it (pointer travel feeds the wobble); at full
 * rattle a numbered stick pops and the paper unrolls. The draw is a pure
 * function of the local date (lib/omikuji), and the seal code is kept in
 * shared storage so the loadout drawer can honour it.
 */
export function Shrine() {
  const { todaysFortune, drawnToday, keep } = useFortune();
  const { earn } = useCred();
  const { toast } = useUI();

  const [phase, setPhase] = useState<Phase>(drawnToday ? "paper" : "idle");
  const [energy, setEnergy] = useState(0);
  const [fortune, setFortune] = useState<DrawnFortune | null>(todaysFortune);
  const holding = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const energyRef = useRef(0);
  const completing = useRef(false);

  // Energy bleeds off so a lazy rattle never completes.
  useEffect(() => {
    if (phase !== "shaking") return;
    const timer = setInterval(() => {
      energyRef.current = Math.max(0, energyRef.current - 2.5);
      setEnergy(energyRef.current);
      if (energyRef.current === 0 && !holding.current) setPhase("idle");
    }, 80);
    return () => clearInterval(timer);
  }, [phase]);

  const completeDraw = () => {
    if (completing.current) return;
    completing.current = true;
    holding.current = false;
    const drawn = drawFortune(dayKey(), Math.floor(Math.random() * 1_000_000));
    setPhase("stick");
    setTimeout(() => {
      setFortune(drawn);
      keep(drawn);
      setPhase("paper");
      earn("drew an omikuji", 10);
      toast(`The seal grants ${drawn.discountPct}% — code ${drawn.code}`);
    }, 800);
  };

  const feed = (amount: number) => {
    if (drawnToday || completing.current) return;
    energyRef.current = Math.min(100, energyRef.current + amount);
    setEnergy(energyRef.current);
    if (energyRef.current >= 100) completeDraw();
  };

  const onDown = (event: React.PointerEvent) => {
    if (drawnToday || phase === "stick") return;
    holding.current = true;
    last.current = { x: event.clientX, y: event.clientY };
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    setPhase("shaking");
  };
  const onMove = (event: React.PointerEvent) => {
    if (!holding.current || !last.current) return;
    const dx = event.clientX - last.current.x;
    const dy = event.clientY - last.current.y;
    last.current = { x: event.clientX, y: event.clientY };
    feed(Math.min(9, Math.hypot(dx, dy) * 0.16));
  };
  const onUp = () => {
    holding.current = false;
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      {/* the cylinder */}
      <div className="relative flex min-h-[26rem] flex-col items-center justify-center border border-bone/12 bg-ink p-6">
        <Torii />
        <div
          className={cx("relative mt-6 cursor-grab touch-none select-none active:cursor-grabbing", phase === "shaking" && "omikuji-shake")}
          style={{ "--wobble": `${Math.min(10, energy / 9)}px` } as React.CSSProperties}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          role="button"
          aria-label="Hold and shake the omikuji cylinder"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") feed(18);
          }}
        >
          <svg viewBox="0 0 160 200" className="h-56 w-44" aria-hidden>
            <ellipse cx="80" cy="180" rx="58" ry="12" fill="#0c0c0e" />
            <path d="M40 70 Q38 178 52 184 H108 Q122 178 120 70 Z" fill="#17171b" stroke="#3a3a41" strokeWidth="2" />
            <path d="M40 70 Q80 84 120 70" fill="none" stroke="#e23a2e" strokeWidth="3" />
            <text x="80" y="135" textAnchor="middle" fontSize="30" fill="#e23a2e" fontFamily="serif">
              御籤
            </text>
            {/* sticks */}
            {phase === "stick" ? (
              <g className="omikuji-stick">
                <rect x="76" y="18" width="7" height="60" rx="3" fill="#e8d5c4" />
                <text x="79" y="40" fontSize="10" fill="#101013" textAnchor="middle" fontFamily="monospace">
                  {fortune?.stick ?? 1}
                </text>
              </g>
            ) : (
              <g stroke="#e8d5c4" strokeWidth="5" strokeLinecap="round">
                <line x1="66" y1="66" x2="58" y2="34" />
                <line x1="80" y1="66" x2="80" y2="28" />
                <line x1="94" y1="66" x2="102" y2="36" />
              </g>
            )}
          </svg>
        </div>

        <div className="mt-6 w-full max-w-60">
          <div className="h-1.5 w-full bg-bone/10" aria-hidden>
            <div className="h-full bg-oxide transition-[width] duration-100" style={{ width: `${energy}%` }} />
          </div>
          <p className="mt-2 text-center font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">
            {drawnToday ? "the draw is tied to the rail until midnight" : phase === "shaking" ? "keep shaking…" : "hold + shake the cylinder"}
          </p>
        </div>
      </div>

      {/* the paper */}
      <div className="border border-bone/12 bg-ink p-6 sm:p-8">
        {fortune ? (
          <div className="omikuji-paper">
            <p className="label">Omikuji // {fortune.day}</p>
            <p className="jp stamp-in mt-6 inline-block text-7xl text-oxide">{fortune.kanji}</p>
            <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-steel">
              {fortune.romaji} — {fortune.label} · stick {fortune.stick}
            </p>
            <p className="mt-6 border-l-2 border-oxide/60 pl-4 text-sm italic leading-relaxed text-fog">“{fortune.poem}”</p>
            <p className="mt-4 text-sm leading-relaxed text-fog">{fortune.advice}</p>

            <div className="mt-8 border border-oxide/40 bg-oxide/10 p-4">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">The seal&apos;s gift · {fortune.discountPct}% off today</p>
              <p className="mt-2 font-mono text-lg tracking-[0.18em] text-bone">{fortune.code}</p>
              <p className="mt-2 text-[0.68rem] leading-relaxed text-steel">
                Rides along in your loadout automatically until midnight. Frontend concept — the discount is displayed,
                not charged.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[20rem] flex-col items-center justify-center text-center">
            <p className="jp text-5xl text-steel">紙</p>
            <p className="mt-4 max-w-60 text-sm leading-relaxed text-steel">
              The paper is blank until a stick falls. Shake with intent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Torii() {
  return (
    <svg viewBox="0 0 200 60" className="absolute left-1/2 top-4 h-10 w-40 -translate-x-1/2 opacity-70" aria-hidden>
      <path d="M8 14 Q100 2 192 14 L188 24 Q100 14 12 24 Z" fill="#e23a2e" />
      <rect x="34" y="22" width="8" height="38" fill="#e23a2e" />
      <rect x="158" y="22" width="8" height="38" fill="#e23a2e" />
      <rect x="52" y="30" width="96" height="5" fill="#e23a2e" />
    </svg>
  );
}

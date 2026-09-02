"use client";

import { useEffect, useRef, useState } from "react";
import { slashGame } from "@/content/arcade";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useCred } from "@/lib/cred";
import { useUI } from "@/providers/UIProvider";
import { cx } from "@/lib/cx";

interface Crate {
  id: number;
  x: number; // % of arena width
  y: number; // px from top
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  kind: "drop" | "bootleg";
  kanji: string;
  sliced: 0 | 1 | 2; // 0 whole, 1/2 = half flying off
  slicedAt?: number;
}

const GAME_SECONDS = 45;
const CRATE_R = 34;
const DROP_KANJI = ["炎", "鬼", "浪", "禅", "力"];

/**
 * SLASH THE DROP — a fruit-slicer for drop crates.
 * Pointer-drag draws the blade; slicing a crate halves it with physics.
 * Bootleg crates (wrong seal, red cross) kill the combo. Score → cred.
 */
export function SlashGame({ onMood }: { onMood: (mood: "cheer" | "sulk" | "idle") => void }) {
  const { earn } = useCred();
  const { toast } = useUI();
  const [best, setBest] = usePersistentState<{ score: number }>("zenji.arcade.slash.v1", { score: 0 });

  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [crates, setCrates] = useState<Crate[]>([]);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);

  const arenaRef = useRef<HTMLDivElement>(null);
  const pointerDown = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const nextId = useRef(1);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);

  const start = () => {
    setPhase("play");
    setScore(0);
    setCombo(0);
    setCrates([]);
    setTimeLeft(GAME_SECONDS);
    comboRef.current = 0;
    scoreRef.current = 0;
  };

  // main loop
  useEffect(() => {
    if (phase !== "play") return;
    let frame = 0;
    let lastSpawn = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const remaining = Math.max(0, GAME_SECONDS - elapsed);
      setTimeLeft(Math.ceil(remaining));

      const arena = arenaRef.current;
      const height = arena?.clientHeight ?? 420;

      if (now - lastSpawn > Math.max(420, 900 - elapsed * 10)) {
        lastSpawn = now;
        const kind: Crate["kind"] = Math.random() < 0.22 ? "bootleg" : "drop";
        setCrates((current) => [
          ...current,
          {
            id: nextId.current++,
            x: 12 + Math.random() * 76,
            y: height + 40,
            vx: (Math.random() - 0.5) * 0.7,
            vy: -(7.2 + Math.random() * 3.4),
            rot: Math.random() * 40 - 20,
            vr: (Math.random() - 0.5) * 4,
            kind,
            kanji: DROP_KANJI[Math.floor(Math.random() * DROP_KANJI.length)],
            sliced: 0,
          },
        ]);
      }

      setCrates((current) =>
        current
          .map((crate) => ({
            ...crate,
            x: crate.x + crate.vx,
            y: crate.y + crate.vy + (crate.sliced ? 6 : 0),
            vy: crate.vy + (crate.sliced ? 0.9 : 0.32),
            rot: crate.rot + crate.vr,
          }))
          .filter((crate) => {
            if (crate.sliced && crate.slicedAt && performance.now() - crate.slicedAt > 800) return false;
            if (!crate.sliced && crate.y > height + 60 && crate.vy > 0) {
              if (crate.kind === "drop") {
                comboRef.current = 0;
                setCombo(0);
              }
              return false;
            }
            return true;
          }),
      );

      if (remaining <= 0) {
        const final = scoreRef.current;
        setPhase("over");
        const cred = Math.max(1, Math.floor(final / 5));
        earn("played slash the drop", cred);
        if (final > best.score) {
          setBest({ score: final });
          toast(`New high score ${final} — KOMA bows. +${cred} cred`);
          onMood("cheer");
        } else {
          toast(`Round over — ${final} pts, +${cred} cred`);
        }
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, earn, toast, best.score, setBest, onMood]);

  const sliceAt = (point: { x: number; y: number }) => {
    const prev = lastPoint.current;
    lastPoint.current = point;
    if (!prev) return;
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const px = (prev.x + point.x) / 2;
    const py = (prev.y + point.y) / 2;

    setCrates((current) =>
      current.map((crate) => {
        if (crate.sliced) return crate;
        const cx = (crate.x / 100) * rect.width;
        const dist = Math.hypot(cx - px, crate.y - py);
        if (dist > CRATE_R) return crate;
        if (crate.kind === "bootleg") {
          comboRef.current = 0;
          setCombo(0);
          onMood("sulk");
          return { ...crate, sliced: 1 as const, slicedAt: performance.now() };
        }
        comboRef.current += 1;
        setCombo(comboRef.current);
        scoreRef.current += 10 * Math.min(comboRef.current, 8);
        setScore(scoreRef.current);
        if (comboRef.current === 5) onMood("cheer");
        return { ...crate, sliced: 1 as const, slicedAt: performance.now() };
      }),
    );
  };

  const onMove = (event: React.PointerEvent) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (!pointerDown.current) return;
    setTrail((current) => [...current.slice(-9), point]);
    sliceAt(point);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label">
          {slashGame.title}
          {" // best "}
          {best.score}
        </p>
        <div className="flex items-center gap-4 font-mono text-[0.68rem] uppercase tracking-[0.14em]">
          <span className="text-steel">
            time <span className="text-bone">{String(timeLeft).padStart(2, "0")}</span>
          </span>
          <span className="text-steel">
            score <span className="text-oxide">{score}</span>
          </span>
          <span className={cx("transition-colors", combo >= 5 ? "text-oxide" : "text-steel")}>combo ×{combo}</span>
        </div>
      </div>

      <div
        ref={arenaRef}
        onPointerDown={(event) => {
          pointerDown.current = true;
          const rect = event.currentTarget.getBoundingClientRect();
          lastPoint.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={onMove}
        onPointerUp={() => {
          pointerDown.current = false;
          lastPoint.current = null;
          setTrail([]);
        }}
        onPointerLeave={() => {
          pointerDown.current = false;
          setTrail([]);
        }}
        className="relative mt-3 h-[26rem] touch-none select-none overflow-hidden border border-bone/12 bg-sumi"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 78px, rgba(242,242,240,0.045) 78px 80px), repeating-linear-gradient(0deg, transparent 0 44px, rgba(242,242,240,0.03) 44px 46px)",
          cursor: "crosshair",
        }}
        aria-label="Slash the drop arena — drag to cut crates"
      >
        {crates.map((crate) => (
          <div
            key={crate.id}
            className="absolute h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${crate.x}%`, top: crate.y, transform: `translate(-50%,-50%) rotate(${crate.rot}deg)` }}
          >
            {crate.sliced ? (
              <>
                <span className="crate-half-l absolute inset-0 grid place-items-center border-2 border-oxide bg-ink text-2xl text-bone" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}>
                  {crate.kanji}
                </span>
                <span className="crate-half-r absolute inset-0 grid place-items-center border-2 border-oxide bg-ink text-2xl text-bone" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}>
                  {crate.kanji}
                </span>
              </>
            ) : crate.kind === "bootleg" ? (
              <span className="grid h-full w-full place-items-center border-2 border-dashed border-steel bg-ink text-2xl text-steel">
                ✕
              </span>
            ) : (
              <span className="grid h-full w-full place-items-center border-2 border-oxide bg-ink text-2xl text-bone shadow-[0_0_24px_rgba(226,58,46,0.25)]">
                {crate.kanji}
              </span>
            )}
          </div>
        ))}

        {/* blade trail */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {trail.length > 1 ? (
            <polyline
              points={trail.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#e23a2e"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(226,58,46,0.8))" }}
            />
          ) : null}
        </svg>

        {phase !== "play" ? (
          <div className="absolute inset-0 grid place-items-center bg-sumi/85 p-6 text-center backdrop-blur-sm">
            <div className="max-w-sm">
              <p className="display text-3xl">{phase === "over" ? `Round over — ${score}` : slashGame.title}</p>
              <p className="mt-3 text-xs leading-relaxed text-fog">{slashGame.brief}</p>
              <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">{slashGame.rewards}</p>
              <button
                type="button"
                onClick={start}
                className="mt-5 h-12 border border-oxide bg-oxide px-8 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-bone hover:opacity-90"
              >
                {phase === "over" ? "Run it back" : "Draw your blade"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

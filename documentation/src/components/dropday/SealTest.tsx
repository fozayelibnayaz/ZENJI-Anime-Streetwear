"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sealRound, type Seal } from "@/content/seals";
import { cx } from "@/lib/cx";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useUI } from "@/providers/UIProvider";
import { Action } from "@/components/ui/Action";

type Phase = "idle" | "playing" | "passed" | "failed";

const ROUND_SECONDS = 20;

/**
 * SEAL TEST — match four kanji to their meanings before the timer runs out and
 * the early-access pass unlocks for the next drop.
 *
 * It is a game, but it is also the sizing-style content people actually read:
 * by the time you have matched 炎 to "flame" you understand the graphics.
 */
export function SealTest() {
  const { earlyAccess, grantEarlyAccess } = usePreferences();
  const { toast } = useUI();

  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<Seal[]>(() => sealRound(7));
  const [shuffled, setShuffled] = useState<Seal[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(ROUND_SECONDS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = () => {
    // Seeded off the clock, so the board differs per attempt but never during SSR.
    const next = sealRound(Date.now() % 100000);
    setRound(next);
    setShuffled([...next].sort(() => Math.random() - 0.5));
    setMatched([]);
    setSelected(null);
    setWrong(null);
    setRemaining(ROUND_SECONDS);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    timer.current = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setPhase("failed");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return stopTimer;
  }, [phase, stopTimer]);

  const choose = (kanji: string) => {
    if (phase !== "playing" || matched.includes(kanji)) return;
    setSelected(kanji);
    setWrong(null);
  };

  const answer = (seal: Seal) => {
    if (phase !== "playing" || !selected) return;

    if (seal.kanji !== selected) {
      setWrong(seal.meaning);
      setRemaining((value) => Math.max(1, value - 3));
      return;
    }

    const next = [...matched, seal.kanji];
    setMatched(next);
    setSelected(null);

    // Win condition is resolved here, in the event that caused it, rather than
    // in an effect watching the score.
    if (next.length === round.length) {
      stopTimer();
      setPhase("passed");
      if (!earlyAccess) {
        grantEarlyAccess();
        toast("Early access unlocked — 24h head start on the next chapter");
      }
    }
  };

  return (
    <section aria-labelledby="seal-heading" className="border border-bone/12 bg-ink p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">Access gate</p>
          <h2 id="seal-heading" className="display mt-2 text-3xl">
            The seal test
          </h2>
        </div>
        <span
          className={cx(
            "shrink-0 border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em]",
            earlyAccess ? "border-jade text-jade" : "border-bone/20 text-steel",
          )}
        >
          {earlyAccess ? "Pass held" : "Locked"}
        </span>
      </div>

      <p className="mt-4 max-w-prose text-sm leading-relaxed text-fog">
        Match every seal to its meaning inside {ROUND_SECONDS} seconds and the next chapter opens for you 24 hours
        early. Wrong answer costs three seconds.
      </p>

      {phase === "idle" ? (
        <Action onClick={start} className="mt-6 h-12 px-6">
          {earlyAccess ? "Run it again" : "Start the test"}
        </Action>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="label">
              {matched.length} / {round.length} matched
            </p>
            <p
              className={cx(
                "font-mono text-sm tabular-nums",
                remaining <= 5 && phase === "playing" ? "text-oxide" : "text-bone",
              )}
              aria-live="off"
            >
              {String(remaining).padStart(2, "0")}s
            </p>
          </div>
          <div className="mt-2 h-1 w-full bg-ash">
            <div
              className="h-full bg-oxide transition-[width] duration-1000 ease-linear"
              style={{ width: `${(remaining / ROUND_SECONDS) * 100}%` }}
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="label">Seals</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {round.map((seal) => {
                  const done = matched.includes(seal.kanji);
                  return (
                    <button
                      key={seal.kanji}
                      type="button"
                      onClick={() => choose(seal.kanji)}
                      disabled={done || phase !== "playing"}
                      aria-pressed={selected === seal.kanji}
                      className={cx(
                        "jp aspect-square border text-3xl transition-colors",
                        done
                          ? "border-jade/40 text-jade/40"
                          : selected === seal.kanji
                            ? "border-oxide bg-oxide/15 text-bone"
                            : "border-bone/20 text-bone hover:border-bone/60",
                      )}
                    >
                      {seal.kanji}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="label">Meanings</p>
              <div className="mt-3 flex flex-col gap-2">
                {shuffled.map((seal) => {
                  const done = matched.includes(seal.kanji);
                  return (
                    <button
                      key={seal.meaning}
                      type="button"
                      onClick={() => answer(seal)}
                      disabled={done || phase !== "playing"}
                      className={cx(
                        "border px-3 py-2.5 text-left font-mono text-xs uppercase tracking-[0.12em] transition-colors",
                        done
                          ? "border-jade/40 text-jade/50 line-through"
                          : wrong === seal.meaning
                            ? "border-oxide text-oxide"
                            : "border-bone/20 text-bone hover:border-bone/60",
                      )}
                    >
                      {seal.meaning}
                      <span className="ml-2 text-steel">{seal.romaji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <p role="status" aria-live="polite" className="mt-5 min-h-6 font-mono text-[0.68rem] uppercase tracking-[0.14em]">
            {phase === "passed" ? (
              <span className="text-jade">Pass granted. You are in the early window for the next chapter.</span>
            ) : phase === "failed" ? (
              <span className="text-oxide">Time. The gate stays shut — run it again.</span>
            ) : selected ? (
              <span className="text-steel">Now pick its meaning.</span>
            ) : (
              <span className="text-steel">Pick a seal.</span>
            )}
          </p>

          {phase !== "playing" ? (
            <Action onClick={start} variant="outline" className="mt-3 h-11 px-5">
              Run it again
            </Action>
          ) : null}
        </>
      )}
    </section>
  );
}

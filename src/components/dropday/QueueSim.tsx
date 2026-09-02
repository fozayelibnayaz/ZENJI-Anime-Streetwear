"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { usePreferences } from "@/providers/PreferencesProvider";
import { Action } from "@/components/ui/Action";

type State = "idle" | "queued" | "through";

/**
 * Drop-day queue. A real release puts everyone in a line; this reproduces the
 * feeling — position, ETA, movement — without pretending to be a server.
 * Early-access holders skip most of the line, which is the whole reward.
 */
export function QueueSim() {
  const { earlyAccess } = usePreferences();
  const [state, setState] = useState<State>("idle");
  const [position, setPosition] = useState(0);
  const [total, setTotal] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const join = () => {
    const size = earlyAccess ? 40 + Math.floor(Math.random() * 60) : 320 + Math.floor(Math.random() * 400);
    setTotal(size);
    setPosition(size);
    setState("queued");
  };

  useEffect(() => {
    if (state !== "queued") return;

    tick.current = setInterval(() => {
      setPosition((current) => {
        // The line moves in uneven bursts, the way a real one does.
        const step = Math.max(1, Math.round(current * 0.08) + Math.floor(Math.random() * 9));
        const next = current - step;
        if (next <= 0) {
          setState("through");
          return 0;
        }
        return next;
      });
    }, 700);

    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [state]);

  const progress = total ? 1 - position / total : 0;
  const etaSeconds = Math.ceil(position / Math.max(1, total * 0.09)) * 0.7;

  return (
    <section aria-labelledby="queue-heading" className="border border-bone/12 bg-ink p-5 sm:p-7">
      <p className="label">Release queue</p>
      <h2 id="queue-heading" className="display mt-2 text-3xl">
        Take your place
      </h2>

      {state === "idle" ? (
        <>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-fog">
            Every chapter opens to a queue. {earlyAccess ? "Your pass moves you near the front." : "Clear the seal test and you start near the front instead of the back."}
          </p>
          <Action onClick={join} className="mt-6 h-12 px-6">
            Join the queue
          </Action>
        </>
      ) : (
        <>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="display text-6xl tabular-nums" aria-live="polite">
                {state === "through" ? "IN" : position}
              </p>
              <p className="label mt-1">{state === "through" ? "Gate open" : "People ahead of you"}</p>
            </div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel">
              {state === "through" ? "00:00" : `~${Math.max(1, Math.round(etaSeconds))}s left`}
            </p>
          </div>

          <div className="mt-4 h-1.5 w-full bg-ash">
            <div
              className={cx("h-full transition-[width] duration-500 ease-linear", state === "through" ? "bg-jade" : "bg-oxide")}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          {state === "through" ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/drop"
                className="inline-flex h-12 items-center bg-bone px-6 font-mono text-xs uppercase tracking-[0.18em] text-sumi transition-colors hover:bg-oxide hover:text-bone"
              >
                Enter the drop →
              </Link>
              <Action variant="outline" className="h-12 px-6" onClick={() => setState("idle")}>
                Reset
              </Action>
            </div>
          ) : (
            <p className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
              Keep this tab open — leaving loses your place.
            </p>
          )}
        </>
      )}
    </section>
  );
}

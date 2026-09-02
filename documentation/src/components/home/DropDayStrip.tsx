import Link from "next/link";
import { DropClock } from "./DropClock";
import { Reveal } from "@/components/ui/Reveal";

/** Homepage entry point to the Drop Day console. */
export function DropDayStrip() {
  return (
    <section className="relative overflow-hidden border-y border-bone/10 bg-sumi" aria-labelledby="dropday-heading">
      <span aria-hidden="true" className="halftone pointer-events-none absolute inset-0 opacity-60" />

      <div className="shell relative grid items-center gap-8 py-16 lg:grid-cols-[1fr_0.9fr]">
        <Reveal>
          <p className="label">Ritual_002 — Drop Day</p>
          <h2 id="dropday-heading" className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
            Chapter 03 opens
            <br />
            <span className="text-oxide">Friday, 7pm AEST</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-fog sm:text-base">
            Fortnightly, on the dot. Take a place in the release queue, watch the stock board move, and clear the seal
            test to open the gate twenty-four hours early.
          </p>
          <Link
            href="/drop-day"
            className="mt-8 inline-flex h-13 items-center bg-oxide px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors hover:bg-oxide-deep"
          >
            Open the drop day console →
          </Link>
        </Reveal>

        <Reveal delay={100}>
          <DropClock variant="panel" />
        </Reveal>
      </div>
    </section>
  );
}

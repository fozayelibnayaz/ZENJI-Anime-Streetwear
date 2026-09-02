"use client";

import { Img } from "@/components/ui/Img";
import { usePointerSlash } from "@/hooks/usePointerSlash";
import { ActionLink } from "@/components/ui/Action";
import { DropClock } from "./DropClock";

const STATS = [
  { value: "240", unit: "gsm", note: "Cotton bodies" },
  { value: "48", unit: "hr", note: "Melbourne delivery" },
  { value: "10", unit: "pcs", note: "Per size, per run" },
];

/**
 * Hero.
 *
 * One interaction, done properly: drag the cut across the garment and the back
 * print is revealed underneath. Mouse follows on hover, touch follows a drag,
 * arrow keys move it in steps, and it breathes on its own until you touch it.
 */
export function Hero() {
  const { containerRef, position, engaged, nudge } = usePointerSlash();
  const percent = Math.round(position * 100);

  return (
    <section className="relative overflow-hidden border-b border-bone/10" aria-labelledby="hero-heading">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-rail opacity-70" />
      <span
        aria-hidden="true"
        className="jp pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none text-[26rem] leading-none text-bone/[0.03] sm:text-[34rem]"
      >
        力
      </span>

      <div className="shell relative grid items-center gap-10 py-12 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="label flex items-center gap-3">
            <span className="live-dot inline-block h-1.5 w-1.5 bg-oxide" />
            System // Chapter 02 — Shadow Protocol
          </p>

          <h1 id="hero-heading" className="display mt-6 text-[clamp(3.4rem,13vw,9.5rem)]">
            <span className="block animate-[zenji-slash-in_.8s_var(--ease-slash)_both]">Wear your</span>
            <span className="block animate-[zenji-slash-in_.8s_var(--ease-slash)_.12s_both] text-oxide">story</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-fog sm:text-base">
            Original anime artwork on heavyweight cotton, drawn and printed in Naarm / Melbourne. Limited runs, real
            measurements, no bootlegs.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ActionLink href="/drop" className="h-14 px-8 text-sm">
              Shop the drop →
            </ActionLink>
            <ActionLink href="/fit-lab" variant="outline" className="h-14 px-8 text-sm">
              Find my size
            </ActionLink>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-bone/10 pt-6">
            {STATS.map((stat) => (
              <div key={stat.note}>
                <dt className="sr-only">{stat.note}</dt>
                <dd>
                  <span className="display text-3xl">{stat.value}</span>
                  <span className="ml-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-oxide">{stat.unit}</span>
                  <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
                    {stat.note}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---- The cut ---- */}
        <div className="order-1 lg:order-2">
          <div
            ref={containerRef}
            className="group relative aspect-[4/5] w-full touch-pan-y overflow-hidden bg-slate select-none sm:aspect-[5/6] lg:aspect-[4/5]"
          >
            <Img
              src="/media/hero/slash-front.webp"
              alt="ZENJI Blue Flame Tee, front print, worn in a Melbourne laneway"
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 42vw, 92vw"
              className="object-cover"
            />

            {/* Back print, revealed by the cut. */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `polygon(${percent}% 0, 100% 0, 100% 100%, ${Math.max(0, percent - 8)}% 100%)` }}
            >
              <Img
                src="/media/hero/slash-back.webp"
                alt="The same tee from behind, showing the full back graphic"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 92vw"
                className="object-cover"
              />
            </div>

            {/* Blade */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-px bg-bone shadow-[0_0_24px_4px_rgba(226,58,46,0.55)]"
              style={{ left: `${percent}%`, transform: "skewX(-4deg)" }}
            />

            {/* Keyboard-operable handle. This is the accessible version of the drag. */}
            <button
              type="button"
              role="slider"
              tabIndex={0}
              aria-label="Reveal the back print"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-valuetext={`${percent}% revealed`}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  nudge(-0.06);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  nudge(0.06);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  nudge(-1);
                } else if (event.key === "End") {
                  event.preventDefault();
                  nudge(1);
                }
              }}
              className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center border border-bone/70 bg-sumi/70 text-bone backdrop-blur transition-colors hover:border-oxide hover:text-oxide"
              style={{ left: `${percent}%` }}
            >
              <span aria-hidden="true" className="font-mono text-xs">
                ⇤⇥
              </span>
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-sumi/90 to-transparent p-4">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-fog">
                Blue Flame Tee · <span className="jp">蒼炎</span> Souen
              </p>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">
                {engaged ? `${percent}% back print` : "Drag to cut"}
              </p>
            </div>
          </div>

          <DropClock className="mt-4" />
        </div>
      </div>
    </section>
  );
}

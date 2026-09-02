import type { Metadata } from "next";
import { DropClock } from "@/components/home/DropClock";
import { QueueSim } from "@/components/dropday/QueueSim";
import { SealTest } from "@/components/dropday/SealTest";
import { StockTicker } from "@/components/dropday/StockTicker";

export const metadata: Metadata = {
  title: "Drop Day — the release console",
  description:
    "Countdown in your own timezone, live stock board, release queue and the seal test that unlocks 24-hour early access to the next ZENJI chapter.",
};

export default function DropDayPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label flex items-center gap-2">
          <span className="live-dot inline-block h-1.5 w-1.5 bg-oxide" />
          Ritual_002 // Fortnightly, Friday 7pm AEST
        </p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">Drop day</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          A drop is an event, not a page refresh. Here is the whole ritual: the countdown converted to your timezone,
          the queue, the stock board, and the gate.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <DropClock variant="panel" />
        <QueueSim />
        <SealTest />
        <StockTicker />
      </div>

      <section className="mt-16 border-t border-bone/10 pt-10">
        <h2 className="display text-3xl">How the queue works</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Doors open at 7pm",
              body: "Everyone who is on the page when the clock hits zero is placed in line in the order they arrived.",
            },
            {
              n: "02",
              title: "Early access skips ahead",
              body: "Clear the seal test and your pass puts you near the front for every chapter after it — not just the next one.",
            },
            {
              n: "03",
              title: "Stock is live",
              body: "The board updates as pieces sell. When a size hits zero it is finished; we do not restock a chapter.",
            },
          ].map((item) => (
            <div key={item.n}>
              <p className="font-mono text-xs tracking-[0.2em] text-oxide">{item.n}</p>
              <h3 className="display mt-3 text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

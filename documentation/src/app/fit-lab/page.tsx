import type { Metadata } from "next";
import { FitLab } from "@/components/fitlab/FitLab";

export const metadata: Metadata = {
  title: "Fit Lab — find your size in 20 seconds",
  description:
    "Measure a tee you already own and the ZENJI Fit Lab overlays it on our pattern to name your size, with the exact centimetre difference for every option.",
};

const HOW_TO = [
  {
    n: "01",
    title: "Pick the garment",
    body: "Choose the tee or hoodie in your wardrobe that fits the way you want ours to fit. Not your smallest, not your biggest — your favourite.",
  },
  {
    n: "02",
    title: "Two numbers",
    body: "Lay it flat. Chest is armpit to armpit. Length is from the highest point of the shoulder straight down to the hem. Do not stretch the fabric.",
  },
  {
    n: "03",
    title: "Tell us the vibe",
    body: "Close, true to ZENJI, or extra boxy. We shift the target measurements accordingly and rank every size against them.",
  },
];

export default function FitLabPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Tool_001 // No returns, no guessing</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">Fit Lab</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          Oversized means something different at every label. Rather than describing our fit in adjectives, we compare
          it to a garment you already own and give you the centimetres.
        </p>
      </header>

      <div className="mt-10">
        <FitLab />
      </div>

      <section className="mt-20 border-t border-bone/10 pt-10" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="display text-3xl sm:text-4xl">
          How to measure properly
        </h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          {HOW_TO.map((step) => (
            <li key={step.n}>
              <p className="font-mono text-xs tracking-[0.2em] text-oxide">{step.n}</p>
              <h3 className="display mt-3 text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-steel">
          Everything here is stored on your own device only. Nothing is sent anywhere — this build has no backend at
          all.
        </p>
      </section>
    </div>
  );
}

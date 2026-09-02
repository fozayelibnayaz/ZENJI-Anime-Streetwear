import type { Metadata } from "next";
import { Shrine } from "@/components/shrine/Shrine";

export const metadata: Metadata = {
  title: "The Shrine — draw today's omikuji",
  description:
    "Shake the cylinder, pull a stick, unroll the paper. One omikuji a day: a fortune for your fit and a seal code that rides along in your loadout.",
};

export default function ShrinePage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Ritual_003 // {`{ SHRINE : OPEN }`}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">The shrine</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          Every Japanese store of a certain age keeps a small shrine by the door. Ours keeps an omikuji cylinder:
          hold it and shake, one stick falls, one paper unrolls. The fortune reads your week; the seal code rides
          along in your loadout until midnight. One draw a day — that is the rule, and the rule is the fun.
        </p>
      </header>
      <div className="mt-8">
        <Shrine />
      </div>
    </div>
  );
}

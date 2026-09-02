import type { Metadata } from "next";
import { ArcadeHall } from "@/components/arcade/ArcadeHall";

export const metadata: Metadata = {
  title: "The Arcade — KOMA, slash the drop, versus, the wall",
  description:
    "ZENJI's arcade: meet KOMA the street cat, dress him in any print, slash drop crates for combos, crown looks in the versus ring and tag the studio wall.",
};

export default function ArcadePage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Update_004 // {`{ ARCADE : OPEN }`}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">The arcade</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          The back room past the rail. KOMA the street cat hosts three games — a blade, a ring and a wall. Original
          characters only: rule 01 applies to mascots too, so everything in here is drawn in-house.
        </p>
      </header>
      <div className="mt-8">
        <ArcadeHall />
      </div>
    </div>
  );
}

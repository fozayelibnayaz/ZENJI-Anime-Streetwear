import type { Metadata } from "next";
import { CounterGame } from "@/components/counter/CounterGame";

export const metadata: Metadata = {
  title: "The Counter — haggle with KAGE",
  description:
    "Step up to KAGE's counter. Three pieces under the glass daily — flatter, bluff, cash or walk, and work the price down before you shake on it.",
};

export default function CounterPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Update_005 // {`{ COUNTER : OPEN }`}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">The counter</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          Nineteen years behind the rail and KAGE has heard every line. Pick a piece from under the counter, work his
          price with some manners — or none — and shake when the number feels right. Your rank is your leverage.
        </p>
      </header>
      <div className="mt-8">
        <CounterGame />
      </div>
    </div>
  );
}

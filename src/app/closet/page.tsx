import type { Metadata } from "next";
import { ClosetArcade } from "@/components/closet/ClosetArcade";
import { ClosetConsole } from "@/components/closet/ClosetConsole";

export const metadata: Metadata = {
  title: "The Closet — dress the figure, stack a look",
  description:
    "ZENJI's digital fitting room. Pick a frame, choose your size and watch the garment render on the figure in real time — then stack a full outfit or let the Melbourne weather decide what you wear.",
};

export default function ClosetPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Console // {`{ RACK : ACTIVE }`}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">The closet</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          A digital fitting room for people who cannot try things on before buying. Pick how the frame is built, hang
          any piece on it at your actual size, then stack the whole outfit. Nothing here is a stock photo — the figure
          renders our flat-lay photography scaled to the size chart, so an S and a 2XL genuinely sit differently.
        </p>
      </header>

      <div className="mt-8">
        <ClosetArcade />
        <ClosetConsole />
      </div>
    </div>
  );
}

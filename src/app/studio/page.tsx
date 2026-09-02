import type { Metadata } from "next";
import { CardStudio } from "@/components/studio/CardStudio";

export const metadata: Metadata = {
  title: "Card Studio — cut your own editorial card",
  description:
    "Direct your own ZENJI editorial: pick a laneway backdrop, hang a piece in frame, stamp a seal, write the caption and export the card as a PNG.",
};

export default function StudioPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Tool_003 // {`{ DIRECTOR : YOU }`}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">Card studio</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          The lookbook was shot over three cold mornings in Fitzroy. This is yours: pick a backdrop, drag the piece
          where you want it, stamp a seal, write the caption — then export the card as a PNG and take it anywhere.
        </p>
      </header>
      <div className="mt-8">
        <CardStudio />
      </div>
    </div>
  );
}

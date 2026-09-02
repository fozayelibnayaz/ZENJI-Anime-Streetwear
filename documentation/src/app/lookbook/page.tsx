import type { Metadata } from "next";
import { LookbookViewer } from "@/components/lookbook/LookbookViewer";

export const metadata: Metadata = {
  title: "Lookbook — how it actually wears",
  description:
    "ZENJI shot on location in Fitzroy, Collingwood and Melbourne Chinatown. Tap any pin to shop the piece straight from the photo.",
};

export default function LookbookPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Editorial // Chapter 02</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">Lookbook</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          No studio, no stylist. Three locations around inner Melbourne, real light, real weather. Every pin on these
          photos opens the piece.
        </p>
      </header>

      <div className="mt-14">
        <LookbookViewer />
      </div>
    </div>
  );
}

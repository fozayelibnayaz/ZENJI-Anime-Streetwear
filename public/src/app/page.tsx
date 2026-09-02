import { Hero } from "@/components/home/Hero";
import { FeaturedDrop } from "@/components/home/FeaturedDrop";
import { FitLabTeaser } from "@/components/home/FitLabTeaser";
import { DropDayStrip } from "@/components/home/DropDayStrip";
import { LookbookStrip } from "@/components/home/LookbookStrip";
import { ClosetTeaser } from "@/components/home/ClosetTeaser";
import { EthosGrid } from "@/components/home/EthosGrid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedDrop />
      <FitLabTeaser />
      <DropDayStrip />
      <LookbookStrip />
      <ClosetTeaser />
      <EthosGrid />
    </>
  );
}

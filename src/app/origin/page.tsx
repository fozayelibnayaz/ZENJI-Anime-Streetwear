import type { Metadata } from "next";
import Link from "next/link";
import { MangaScroller } from "@/components/origin/MangaScroller";
import { manifesto } from "@/content/origin";

export const metadata: Metadata = {
  title: "Origin — why this label exists",
  description:
    "The ZENJI story, told as a vertical manga: one bad screen print in a Brunswick garage, and the four rules that came out of it.",
};

export default function OriginPage() {
  return (
    <div>
      <header className="shell py-16 sm:py-24">
        <p className="label">THE_ORIGIN // Read top to bottom</p>
        <h1 className="display mt-4 text-6xl sm:text-8xl">
          Wear your
          <br />
          <span className="text-oxide">story</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-fog sm:text-base">
          Six panels. Scroll like you would read a webtoon — or turn animation off in the console and read it as plain
          text. Both work.
        </p>
      </header>

      <MangaScroller />

      <section className="shell py-20" aria-labelledby="rules-heading">
        <h2 id="rules-heading" className="display text-4xl sm:text-5xl">
          The four rules
        </h2>
        <ol className="mt-10 grid gap-px bg-bone/10 sm:grid-cols-2">
          {manifesto.map((rule) => (
            <li key={rule.n} className="bg-sumi p-6 lg:p-8">
              <p className="font-mono text-xs tracking-[0.2em] text-oxide">{rule.n}</p>
              <h3 className="display mt-4 text-2xl">{rule.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fog">{rule.body}</p>
            </li>
          ))}
        </ol>

        <Link
          href="/drop"
          className="mt-12 inline-flex h-13 items-center bg-bone px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-sumi transition-colors hover:bg-oxide hover:text-bone"
        >
          See what the rules produced →
        </Link>
      </section>
    </div>
  );
}

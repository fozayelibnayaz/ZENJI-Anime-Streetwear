import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  /** Small mono kicker, e.g. "COLLECTION // THE_ORIGIN_DROP". */
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  link?: { href: string; label: string };
  className?: string;
}

export function SectionHeading({ eyebrow, title, intro, link, className }: SectionHeadingProps) {
  return (
    <div className={cx("flex flex-wrap items-end justify-between gap-6 border-b border-bone/10 pb-5", className)}>
      <Reveal className="max-w-2xl">
        <p className="label">{eyebrow}</p>
        <h2 className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
        {intro ? <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">{intro}</p> : null}
      </Reveal>
      {link ? (
        <Link
          href={link.href}
          className="group font-mono text-xs uppercase tracking-[0.18em] text-steel transition-colors hover:text-oxide"
        >
          {link.label}
          <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      ) : null}
    </div>
  );
}

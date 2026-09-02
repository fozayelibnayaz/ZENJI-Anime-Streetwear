import { cx } from "@/lib/cx";

interface MarqueeProps {
  items: string[];
  /** Seconds for one full pass. */
  duration?: number;
  className?: string;
}

/**
 * Infinite ticker. The list is rendered twice and translated -50%, which is the
 * only way to loop seamlessly without measuring anything at runtime.
 */
export function Marquee({ items, duration = 38, className }: MarqueeProps) {
  const run = [...items, ...items];

  return (
    <div className={cx("relative overflow-hidden border-y border-bone/10 bg-ink py-2.5", className)}>
      <div
        className="marquee-track flex w-max items-center gap-10 whitespace-nowrap"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
        aria-hidden="true"
      >
        {run.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-steel">
            {item}
            <span className="text-oxide">◆</span>
          </span>
        ))}
      </div>
      {/* Screen readers get the list once, without the duplication. */}
      <p className="sr-only">{items.join(". ")}</p>
    </div>
  );
}

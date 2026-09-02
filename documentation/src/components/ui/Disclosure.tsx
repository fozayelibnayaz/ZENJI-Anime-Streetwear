import type { ReactNode } from "react";

interface DisclosureProps {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Small mono note on the right of the row, e.g. a topic tag. */
  note?: string;
}

/**
 * Built on <details> so it works before hydration, survives Ctrl+F on some
 * browsers, and needs no ARIA bookkeeping from us.
 */
export function Disclosure({ summary, children, defaultOpen, note }: DisclosureProps) {
  return (
    <details className="group border-b border-bone/10" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
        <span className="display text-lg sm:text-xl">{summary}</span>
        <span className="flex shrink-0 items-center gap-3">
          {note ? <span className="label hidden sm:inline">{note}</span> : null}
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center border border-bone/20 text-steel transition-transform duration-300 group-open:rotate-45 group-open:border-oxide group-open:text-oxide"
          >
            +
          </span>
        </span>
      </summary>
      <div className="pb-6 pr-10 text-sm leading-relaxed text-fog">{children}</div>
    </details>
  );
}

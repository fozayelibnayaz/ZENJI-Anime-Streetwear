"use client";

import { useMemo, useState } from "react";
import { faqs } from "@/content/faq";
import { Disclosure } from "@/components/ui/Disclosure";
import { cx } from "@/lib/cx";

const TOPICS = ["All", "Sizing", "Shipping", "Returns", "Drops", "Care"] as const;

/** Searchable FAQ. Most support questions are sizing questions, so it filters live. */
export function FaqBrowser() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All");
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return faqs.filter((entry) => {
      if (topic !== "All" && entry.topic !== topic) return false;
      if (!needle) return true;
      return `${entry.question} ${entry.answer}`.toLowerCase().includes(needle);
    });
  }, [topic, term]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={topic === item}
              onClick={() => setTopic(item)}
              className={cx(
                "h-8 border px-3 font-mono text-[0.66rem] uppercase tracking-[0.12em] transition-colors",
                topic === item ? "border-oxide bg-oxide text-bone" : "border-bone/20 text-steel hover:text-bone",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="sm:w-64">
          <label htmlFor="faq-search" className="sr-only">
            Search the FAQ
          </label>
          <input
            id="faq-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search questions…"
            className="h-10 w-full border border-bone/20 bg-sumi px-3 font-mono text-sm text-bone outline-none transition-colors focus:border-oxide placeholder:text-steel/60"
          />
        </div>
      </div>

      <p className="label mt-4" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "answer" : "answers"}
      </p>

      <div className="mt-4">
        {results.length === 0 ? (
          <p className="border border-dashed border-bone/15 px-6 py-14 text-center text-sm text-steel">
            Nothing matches that. Email hello@zenji.shop and a human will answer within a day.
          </p>
        ) : (
          results.map((entry) => (
            <Disclosure key={entry.id} summary={entry.question} note={entry.topic}>
              {entry.answer}
            </Disclosure>
          ))
        )}
      </div>
    </div>
  );
}

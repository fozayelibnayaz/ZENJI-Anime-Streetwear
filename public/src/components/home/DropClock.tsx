"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  cityFromTimeZone,
  countdownTo,
  formatInZone,
  MELBOURNE_TZ,
  nextDropAt,
  pad,
  resolveLocalTimeZone,
} from "@/lib/drop";
import { useMounted } from "@/hooks/useMounted";
import { cx } from "@/lib/cx";

interface DropClockProps {
  className?: string;
  variant?: "inline" | "panel";
}

/**
 * Counts down to the next fortnightly drop, in Melbourne time *and* in the
 * visitor's own timezone — because half our customers are in Perth doing
 * three-hour maths in their head.
 *
 * Renders a stable placeholder until mounted so the static HTML and the first
 * client render always agree.
 */
export function DropClock({ className, variant = "inline" }: DropClockProps) {
  const mounted = useMounted();
  const target = useMemo(() => nextDropAt(), []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const left = countdownTo(target, now);
  const localZone = mounted ? resolveLocalTimeZone() : MELBOURNE_TZ;
  const showLocal = mounted && localZone !== MELBOURNE_TZ;

  const digits = mounted
    ? [
        { value: pad(left.days), unit: "days" },
        { value: pad(left.hours), unit: "hrs" },
        { value: pad(left.minutes), unit: "min" },
        { value: pad(left.seconds), unit: "sec" },
      ]
    : [
        { value: "--", unit: "days" },
        { value: "--", unit: "hrs" },
        { value: "--", unit: "min" },
        { value: "--", unit: "sec" },
      ];

  if (variant === "panel") {
    return (
      <div className={cx("border border-bone/12 bg-ink p-6 sm:p-8", className)}>
        <p className="label flex items-center gap-2">
          <span className="live-dot inline-block h-1.5 w-1.5 bg-oxide" />
          Next chapter unlocks
        </p>

        <div className="mt-5 flex flex-wrap gap-3 sm:gap-6">
          {digits.map((digit) => (
            <div key={digit.unit} className="min-w-16">
              <p className="display text-5xl tabular-nums sm:text-6xl">{digit.value}</p>
              <p className="label mt-1">{digit.unit}</p>
            </div>
          ))}
        </div>

        <dl className="mt-6 space-y-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel">
          <div className="flex gap-2">
            <dt>Melbourne</dt>
            <dd className="text-fog">{formatInZone(target, MELBOURNE_TZ)} AEST</dd>
          </div>
          {showLocal ? (
            <div className="flex gap-2">
              <dt>Your time ({cityFromTimeZone(localZone)})</dt>
              <dd className="text-fog">{formatInZone(target, localZone)}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    );
  }

  return (
    <div className={cx("flex flex-wrap items-center justify-between gap-3 border border-bone/12 px-4 py-3", className)}>
      <p className="label flex items-center gap-2">
        <span className="live-dot inline-block h-1.5 w-1.5 bg-oxide" />
        Next drop
      </p>
      <p className="font-mono text-sm tabular-nums text-bone">
        {digits.map((digit) => digit.value).join(" : ")}
        <span className="ml-2 text-[0.62rem] uppercase tracking-[0.14em] text-steel">d h m s</span>
      </p>
      <Link
        href="/drop-day"
        className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel underline underline-offset-4 transition-colors hover:text-oxide"
      >
        Drop day console →
      </Link>
    </div>
  );
}

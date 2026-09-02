"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "@/content/products";
import { totalUnits } from "@/lib/catalogue";
import { formatPrice } from "@/lib/money";
import { useMounted } from "@/hooks/useMounted";
import { cx } from "@/lib/cx";

interface Row {
  slug: string;
  name: string;
  price: number;
  units: number;
  viewers: number;
  flash: boolean;
}

const WATCHLIST = products.filter((product) => product.featured).slice(0, 5);

/**
 * Live stock board. Numbers start from the real catalogue and then drift on the
 * client only — the server-rendered HTML stays deterministic, so there is no
 * hydration mismatch and no flash of wrong data.
 */
export function StockTicker() {
  const mounted = useMounted();
  const [rows, setRows] = useState<Row[]>(() =>
    WATCHLIST.map((product) => ({
      slug: product.slug,
      name: product.name,
      price: product.price,
      units: totalUnits(product),
      viewers: 0,
      flash: false,
    })),
  );

  useEffect(() => {
    // Viewer counts are random, so they are seeded on the first tick rather than
    // during render — the server-rendered markup stays deterministic.
    const seed = window.setTimeout(() => {
      setRows((current) => current.map((row) => ({ ...row, viewers: 12 + Math.floor(Math.random() * 90) })));
    }, 80);

    const id = window.setInterval(() => {
      setRows((current) =>
        current.map((row) => {
          const sells = Math.random() < 0.35 && row.units > 0;
          return {
            ...row,
            units: sells ? row.units - 1 : row.units,
            viewers: Math.max(6, row.viewers + Math.round((Math.random() - 0.5) * 14)),
            flash: sells,
          };
        }),
      );
    }, 2600);

    return () => {
      window.clearTimeout(seed);
      window.clearInterval(id);
    };
  }, []);

  return (
    <section aria-labelledby="stock-heading" className="border border-bone/12 bg-ink">
      <div className="flex items-center justify-between border-b border-bone/10 px-5 py-4">
        <h2 id="stock-heading" className="display text-2xl">
          Live stock board
        </h2>
        <p className="label flex items-center gap-2">
          <span className="live-dot inline-block h-1.5 w-1.5 bg-oxide" />
          {mounted ? "Streaming" : "Connecting"}
        </p>
      </div>

      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Remaining units and current viewers for the featured pieces</caption>
        <thead>
          <tr className="border-b border-bone/10">
            {["Piece", "Price", "Units", "Watching"].map((heading) => (
              <th key={heading} scope="col" className="label px-5 py-3 font-normal">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug} className="border-b border-bone/8 last:border-0">
              <th scope="row" className="px-5 py-3 text-left font-normal">
                <Link href={`/drop/${row.slug}`} className="text-sm text-bone transition-colors hover:text-oxide">
                  {row.name}
                </Link>
              </th>
              <td className="px-5 py-3 font-mono text-xs text-fog">{formatPrice(row.price)}</td>
              <td
                className={cx(
                  "px-5 py-3 font-mono text-xs tabular-nums transition-colors duration-500",
                  row.units === 0 ? "text-steel line-through" : row.flash ? "text-oxide" : "text-bone",
                )}
              >
                {row.units.toString().padStart(2, "0")}
              </td>
              <td className="px-5 py-3 font-mono text-xs tabular-nums text-steel">
                {mounted ? row.viewers : "--"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="border-t border-bone/10 px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
        Simulated feed for this frontend build — no live inventory service is connected.
      </p>
    </section>
  );
}

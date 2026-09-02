"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/content/products";
import { versus } from "@/content/arcade";
import { crowdShare, matchupsFor } from "@/lib/versus";
import { dayKey } from "@/lib/omikuji";
import { formatPrice } from "@/lib/money";
import { withBasePath } from "@/lib/asset";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useCred } from "@/lib/cred";
import { useUI } from "@/providers/UIProvider";
import { cx } from "@/lib/cx";

/**
 * THE VERSUS — two looks enter the ring, the street votes.
 * Crowning a look teaches the Floorwalker your taste.
 */
export function Versus() {
  const { crown } = usePreferences();
  const { earn } = useCred();
  const { toast } = useUI();
  const fights = useMemo(() => matchupsFor(), []);
  const [index, setIndex] = useState(0);
  const [vote, setVote] = useState<0 | 1 | null>(null);

  const fight = fights[index % fights.length];
  const share = vote === null ? null : crowdShare(dayKey(), index, vote);

  const pick = (side: 0 | 1) => {
    if (vote !== null) return;
    setVote(side);
    const winner: Product = side === 0 ? fight.a : fight.b;
    crown(winner.slug);
    earn("crowned a look in the versus", 5);
    toast(`${winner.name} crowned — the Floorwalker takes notes`);
  };

  const next = () => {
    setVote(null);
    setIndex((current) => current + 1);
  };

  return (
    <div>
      <p className="label">
        {versus.title}
        {" // fight "}
        {String((index % fights.length) + 1).padStart(2, "0")}/{String(fights.length).padStart(2, "0")}
      </p>
      <p className="mt-2 max-w-xl text-xs leading-relaxed text-steel">{versus.brief}</p>

      <div className="relative mt-4 grid grid-cols-2 gap-3">
        {([0, 1] as const).map((side) => {
          const product = side === 0 ? fight.a : fight.b;
          const won = vote === side;
          return (
            <button
              key={product.slug}
              type="button"
              onClick={() => pick(side)}
              disabled={vote !== null}
              className={cx(
                "group relative border p-3 text-left transition-all",
                won ? "border-oxide bg-oxide/10" : "border-bone/12 bg-sumi hover:border-bone/50",
                vote !== null && !won && "opacity-50",
              )}
            >
              <img
                src={withBasePath(product.images.front)}
                alt={`${product.name} — ${product.colourway}`}
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
              <p className="mt-2 truncate text-xs text-bone">{product.name}</p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-steel">{formatPrice(product.price)}</p>
              {vote === null ? (
                <span className="absolute right-2 top-2 border border-bone/20 bg-ink/80 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog opacity-0 transition-opacity group-hover:opacity-100">
                  Crown
                </span>
              ) : null}
            </button>
          );
        })}
        <span className="display pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-oxide" aria-hidden>
          対
        </span>
      </div>

      {vote !== null && share !== null ? (
        <div className="mt-4 border border-bone/12 bg-ink p-4">
          <div className="flex h-2 w-full overflow-hidden" aria-hidden>
            <span className="h-full bg-oxide transition-[width] duration-700" style={{ width: `${vote === 0 ? share : 100 - share}%` }} />
            <span className="h-full flex-1 bg-bone/20" />
          </div>
          <p className="mt-3 text-xs text-fog">
            {versus.judge((vote === 0 ? fight.a : fight.b).name, vote === 0 ? share : 100 - share)}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-4 h-10 border border-oxide px-6 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-oxide hover:bg-oxide hover:text-bone"
          >
            Next fight →
          </button>
        </div>
      ) : null}
    </div>
  );
}

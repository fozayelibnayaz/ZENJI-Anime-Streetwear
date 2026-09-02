"use client";

import { Img } from "@/components/ui/Img";
import { looks } from "@/content/lookbook";
import { getProduct } from "@/lib/catalogue";
import { formatPrice } from "@/lib/money";
import { useUI } from "@/providers/UIProvider";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Shoppable editorial. Each pin is a real button over the image — tap it and the
 * quick view opens with that piece, so nobody has to guess what the model is
 * wearing or go hunting through the catalogue for it.
 */
export function LookbookViewer() {
  const { openQuickView } = useUI();

  return (
    <div className="flex flex-col gap-20">
      {looks.map((look, index) => (
        <Reveal key={look.id} variant="slash">
          <figure className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
            <div className="relative aspect-[3/4] overflow-hidden bg-slate sm:aspect-[4/3] lg:aspect-[3/4]">
              <Img
                src={look.image}
                alt={look.alt}
                fill
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                sizes="(min-width: 1024px) 55vw, 92vw"
                className="object-cover"
              />

              {look.hotspots.map((hotspot) => {
                const product = getProduct(hotspot.slug);
                if (!product) return null;
                return (
                  <button
                    key={hotspot.slug}
                    type="button"
                    onClick={() => openQuickView(hotspot.slug)}
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    aria-label={`Shop ${product.name}, ${formatPrice(product.price)}`}
                  >
                    <span className="relative grid h-8 w-8 place-items-center rounded-full border border-bone/70 bg-sumi/70 text-bone backdrop-blur transition-colors group-hover:border-oxide group-hover:text-oxide">
                      <span aria-hidden="true" className="text-xs">
                        +
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 animate-[zenji-pulse_2.4s_var(--ease-cut)_infinite] rounded-full border border-oxide/60"
                      />
                    </span>
                    <span className="pointer-events-none absolute left-10 top-1/2 hidden -translate-y-1/2 whitespace-nowrap border border-bone/20 bg-sumi/90 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-bone backdrop-blur group-hover:block group-focus-visible:block">
                      {hotspot.note} · {formatPrice(product.price)}
                    </span>
                  </button>
                );
              })}
            </div>

            <figcaption className="flex flex-col justify-center">
              <p className="label">
                Look {String(index + 1).padStart(2, "0")} · {look.time}
              </p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">{look.title}</h2>
              <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel">{look.location}</p>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-fog">{look.caption}</p>

              <ul className="mt-6 flex flex-col gap-2">
                {look.hotspots.map((hotspot) => {
                  const product = getProduct(hotspot.slug);
                  if (!product) return null;
                  return (
                    <li key={hotspot.slug}>
                      <button
                        type="button"
                        onClick={() => openQuickView(hotspot.slug)}
                        className="flex w-full items-center justify-between gap-4 border border-bone/12 px-4 py-3 text-left transition-colors hover:border-oxide"
                      >
                        <span className="text-sm text-bone">{product.name}</span>
                        <span className="font-mono text-xs text-steel">{formatPrice(product.price)} →</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

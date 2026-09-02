import { Img } from "@/components/ui/Img";
import Link from "next/link";
import { looks } from "@/content/lookbook";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Horizontal filmstrip. Scroll-snap keeps it usable with a thumb; the same
 * looks get full hotspots on the lookbook page.
 */
export function LookbookStrip() {
  return (
    <section className="py-20 defer-paint" aria-labelledby="lookbook-heading">
      <div className="shell">
        <SectionHeading
          eyebrow="Editorial // Shot on location"
          title={<span id="lookbook-heading">Lookbook</span>}
          intro="Fitzroy, Collingwood and Chinatown, over three mornings and one very cold night."
          link={{ href: "/lookbook", label: "Full lookbook" }}
        />
      </div>

      <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--page-gutter)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {looks.map((look) => (
          <li key={look.id} className="w-[80vw] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw]">
            <Link href="/lookbook" className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-slate">
                <Img
                  src={look.image}
                  alt={look.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 80vw"
                  className="object-cover transition-transform duration-[900ms] ease-[var(--ease-slash)] group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sumi/90 to-transparent p-4">
                  <p className="label">{look.time} · {look.location}</p>
                  <p className="display mt-1 text-2xl">{look.title}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

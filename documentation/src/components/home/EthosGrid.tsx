import Link from "next/link";
import { manifesto } from "@/content/origin";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function EthosGrid() {
  return (
    <section className="shell defer-paint py-20" aria-labelledby="ethos-heading">
      <SectionHeading
        eyebrow="Manifesto_001"
        title={<span id="ethos-heading">The ZENJI ethos</span>}
        intro="Four rules we wrote in the first month and have not broken since."
        link={{ href: "/origin", label: "Read the origin" }}
      />

      <div className="mt-10 grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-4">
        {manifesto.map((rule, index) => (
          <Reveal key={rule.n} delay={index * 70} className="group bg-sumi p-6 transition-colors hover:bg-ink lg:p-8">
            <p className="font-mono text-xs tracking-[0.2em] text-oxide">{rule.n}</p>
            <h3 className="display mt-5 text-2xl">{rule.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fog">{rule.body}</p>
            <span
              aria-hidden="true"
              className="mt-6 block h-px w-8 bg-oxide transition-all duration-500 group-hover:w-full"
            />
          </Reveal>
        ))}
      </div>

      <p className="mt-8 text-sm text-steel">
        Questions about materials or sizing?{" "}
        <Link href="/support" className="text-bone underline underline-offset-4 hover:text-oxide">
          Everything is answered here
        </Link>
        .
      </p>
    </section>
  );
}

import type { Metadata } from "next";
import { shipping, site } from "@/content/site";
import { faqs } from "@/content/faq";
import { FaqBrowser } from "@/components/support/FaqBrowser";
import { ContactForm } from "@/components/support/ContactForm";

export const metadata: Metadata = {
  title: "Support — shipping, returns and sizing",
  description:
    "Australian delivery times and costs, the 30-day exchange policy, garment care and answers to the questions we get most.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: { "@type": "Answer", text: entry.answer },
  })),
};

export default function SupportPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="border-b border-bone/10 pb-8">
        <p className="label">Support // Real humans, one business day</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">Support</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          Everything about getting a ZENJI piece to your door and keeping it looking right once it is there.
        </p>
      </header>

      <section className="mt-14" aria-labelledby="shipping-heading">
        <h2 id="shipping-heading" className="display text-3xl sm:text-4xl">
          Delivery across Australia
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-bone/15">
                {["Zone", "Speed", "Cost"].map((heading) => (
                  <th key={heading} scope="col" className="label py-3 font-normal">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipping.map((zone) => (
                <tr key={zone.zone} className="border-b border-bone/8">
                  <th scope="row" className="py-3 pr-4 text-left text-sm font-normal text-bone">
                    {zone.zone}
                  </th>
                  <td className="py-3 pr-4 font-mono text-xs text-fog">{zone.speed}</td>
                  <td className="py-3 font-mono text-xs text-fog">{zone.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-steel">
          Orders placed before 2pm AEST on a weekday leave the studio the same day. Everything is tracked with Australia
          Post.
        </p>
      </section>

      <section className="mt-20" id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="display text-3xl sm:text-4xl">
          Questions we actually get
        </h2>
        <div className="mt-6">
          <FaqBrowser />
        </div>
      </section>

      <section className="mt-20 border-t border-bone/10 pt-12" aria-labelledby="contact-heading">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 id="contact-heading" className="display text-3xl sm:text-4xl">
              Still stuck?
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fog">
              Send it through and we will get back to you within one business day. For sizing, tell us the measurements
              of a garment you own — it is the fastest way to a straight answer.
            </p>
            <p className="mt-6 font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.14em] text-steel">
              {site.email}
              <br />
              {site.studio}
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}

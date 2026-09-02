import Link from "next/link";
import { nav, site } from "@/content/site";
import { NewsletterForm } from "./NewsletterForm";

const legal = [
  { href: "/support", label: "Shipping & returns" },
  { href: "/support#faq", label: "FAQ" },
  { href: "/origin", label: "Our story" },
  { href: "/fit-lab", label: "Fit Lab" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-bone/10 bg-ink">
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
        <div>
          <p className="display text-4xl tracking-[0.15em]">ZENJI</p>
          <p className="jp mt-2 text-sm text-steel">{site.kanji} — 禅 stillness, 時 timing</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-fog">{site.tagline}</p>
          <p className="mt-5 font-mono text-[0.66rem] uppercase leading-relaxed tracking-[0.14em] text-steel">
            {site.studio}
            <br />
            {site.email}
          </p>
        </div>

        <nav aria-label="Footer — shop">
          <p className="label">Shop</p>
          <ul className="mt-4 space-y-2.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-fog transition-colors hover:text-oxide">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer — help">
          <p className="label">Help</p>
          <ul className="mt-4 space-y-2.5">
            {legal.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm text-fog transition-colors hover:text-oxide">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="label mt-6">Follow</p>
          <ul className="mt-4 space-y-2.5">
            {site.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="text-sm text-fog transition-colors hover:text-oxide"
                >
                  {social.label} <span className="text-steel">{social.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label">Drop list</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-fog">
            Early access to every chapter, 24 hours before it goes public. No spam, no daily nonsense — one message per
            drop.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-bone/10">
        <div className="shell flex flex-col items-start justify-between gap-2 py-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ZENJI. Frontend concept build.</p>
          <p>Designed &amp; built in Naarm / Melbourne · Prices in AUD, GST included</p>
        </div>
      </div>
    </footer>
  );
}

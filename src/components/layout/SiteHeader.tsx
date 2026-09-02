"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site, tickerItems } from "@/content/site";
import { cx } from "@/lib/cx";
import { useMember } from "@/hooks/useMember";
import { useLoadout } from "@/providers/LoadoutProvider";
import { useUI } from "@/providers/UIProvider";
import { Marquee } from "@/components/ui/Marquee";

export function SiteHeader() {
  const pathname = usePathname();
  const { openOverlay } = useUI();
  const { count, hydrated } = useLoadout();
  const { account } = useMember();
  const [menuOpen, setMenuOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);

  // Collapse the header to a hairline bar after the first screen.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setCondensed(window.scrollY > 40);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-[80] w-full">
      <Marquee items={tickerItems} className="border-t-0" />

      <div
        className={cx(
          "border-b border-bone/10 backdrop-blur transition-[background-color,height] duration-300",
          condensed ? "bg-sumi/92" : "bg-sumi/70",
        )}
      >
        <div className={cx("shell flex items-center justify-between transition-[height] duration-300", condensed ? "h-14" : "h-[4.5rem]")}>
          <Link href="/" className="group flex items-baseline gap-2" aria-label={`${site.name} home`}>
            <span className="display text-2xl tracking-[0.2em] transition-colors group-hover:text-oxide">ZENJI</span>
            <span className="jp text-xs text-steel transition-colors group-hover:text-bone">{site.kanji}</span>
          </Link>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cx(
                      "relative font-mono text-[0.7rem] uppercase tracking-[0.18em] transition-colors",
                      isActive(item.href) ? "text-bone" : "text-steel hover:text-bone",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cx(
                        "absolute -bottom-1.5 left-0 h-px bg-oxide transition-all duration-300",
                        isActive(item.href) ? "w-full" : "w-0",
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="flex h-9 items-center gap-1.5 border border-bone/15 px-3 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel transition-colors hover:border-oxide hover:text-oxide"
              aria-label={account ? `Signed in as ${account.handle} — open account` : "Sign in or join the house list"}
            >
              <span aria-hidden="true">◍</span>
              <span className="hidden md:inline">
                {!hydrated ? "Member" : account ? `@${account.handle}` : "Sign in"}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => openOverlay("console")}
              className="flex h-9 items-center gap-2 border border-bone/15 px-3 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel transition-colors hover:border-bone/40 hover:text-bone"
              aria-label="Open search and command console"
            >
              <span aria-hidden="true">⌕</span>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden border border-bone/15 px-1.5 py-0.5 text-[0.58rem] text-steel md:inline">⌘K</kbd>
            </button>

            <button
              type="button"
              onClick={() => openOverlay("loadout")}
              className="relative flex h-9 items-center gap-2 border border-bone/15 px-3 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-bone transition-colors hover:border-oxide hover:text-oxide"
              aria-label={`Open loadout, ${hydrated ? count : 0} items`}
            >
              <span className="hidden sm:inline">Loadout</span>
              <span aria-hidden="true" className="sm:hidden">
                ▦
              </span>
              <span className={cx("min-w-4 text-center", count > 0 ? "text-oxide" : "text-steel")}>
                {hydrated ? count : 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid h-9 w-9 place-items-center border border-bone/15 text-bone transition-colors hover:border-oxide hover:text-oxide lg:hidden"
            >
              <span aria-hidden="true">{menuOpen ? "✕" : "≡"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation: a full sheet, thumb-reachable, one tap deep. */}
      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="fixed inset-x-0 bottom-0 top-[calc(2.5rem+3.5rem)] z-[81] flex flex-col overflow-y-auto border-t border-bone/10 bg-sumi/98 backdrop-blur lg:hidden"
      >
        <nav aria-label="Mobile" className="gutter flex-1 py-4">
          <ul>
            {nav.map((item, index) => (
              <li key={item.href} className="border-b border-bone/10">
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-baseline justify-between gap-4 py-5"
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <span className="display text-3xl">{item.label}</span>
                  <span className="label">
                    {String(index + 1).padStart(2, "0")} · {item.note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-mono text-[0.66rem] uppercase leading-relaxed tracking-[0.14em] text-steel">
            {site.studio}
            <br />
            Free AU shipping over A$100
          </p>
        </nav>
      </div>
    </header>
  );
}

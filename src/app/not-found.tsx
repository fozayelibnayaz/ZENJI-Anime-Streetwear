import Link from "next/link";
import { nav } from "@/content/site";

/** In-world 404. Static export renders this to /404.html, which GitHub Pages serves automatically. */
export default function NotFound() {
  return (
    <div className="shell flex min-h-[70svh] flex-col justify-center py-20">
      <p className="label">Error // 404</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">
        This page
        <br />
        <span className="text-oxide">was cut</span>
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-fog">
        Nothing at this address. Either the chapter closed, or the link lost a character somewhere.
      </p>

      <nav aria-label="Suggested pages" className="mt-10 grid max-w-3xl gap-px bg-bone/10 sm:grid-cols-3">
        {nav.slice(0, 6).map((item) => (
          <Link key={item.href} href={item.href} className="group bg-sumi p-5 transition-colors hover:bg-ink">
            <span className="display block text-xl group-hover:text-oxide">{item.label}</span>
            <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-steel">
              {item.note}
            </span>
          </Link>
        ))}
      </nav>

      <Link
        href="/"
        className="mt-10 inline-flex h-13 w-fit items-center bg-bone px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-sumi transition-colors hover:bg-oxide hover:text-bone"
      >
        Back to the front page →
      </Link>
    </div>
  );
}

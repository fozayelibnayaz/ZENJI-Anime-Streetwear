"use client";

import { Img } from "@/components/ui/Img";
import { useEffect, useRef, useState } from "react";
import { originPanels, type OriginPanel } from "@/content/origin";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { useInView } from "@/hooks/useInView";
import { cx } from "@/lib/cx";

/**
 * THE_ORIGIN — the brand story read as a vertical manga.
 *
 * Panels ink in as they enter, a chapter rail tracks where you are, and the
 * speed lines respond to how fast you are scrolling. With reduced motion on it
 * quietly becomes a well-set article, which is the point: the story is content
 * first and an animation second.
 */
export function MangaScroller() {
  const velocity = useScrollVelocity();
  const [active, setActive] = useState(0);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    panelRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* Speed lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: velocity * 0.5,
          backgroundImage:
            "repeating-linear-gradient(96deg, rgba(242,240,235,0.5) 0 1px, transparent 1px 26px)",
          maskImage: "radial-gradient(ellipse at center, transparent 30%, black 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 30%, black 100%)",
        }}
      />

      {/* Chapter rail */}
      <nav
        aria-label="Chapters"
        className="pointer-events-none fixed left-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
      >
        {originPanels.map((panel, index) => (
          <span key={panel.id} className="flex items-center gap-2">
            <span
              className={cx(
                "h-px transition-all duration-500",
                index === active ? "w-8 bg-oxide" : "w-4 bg-bone/25",
              )}
            />
            <span
              className={cx(
                "font-mono text-[0.6rem] tracking-[0.16em] transition-colors duration-500",
                index === active ? "text-bone" : "text-steel/60",
              )}
            >
              {panel.chapter}
            </span>
          </span>
        ))}
      </nav>

      <div className="relative z-10 flex flex-col">
        {originPanels.map((panel, index) => (
          <Panel
            key={panel.id}
            panel={panel}
            index={index}
            registerRef={(node) => {
              panelRefs.current[index] = node;
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface PanelProps {
  panel: OriginPanel;
  index: number;
  registerRef: (node: HTMLElement | null) => void;
}

function Panel({ panel, index, registerRef }: PanelProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 });
  const flipped = index % 2 === 1;

  const tone =
    panel.tone === "bone"
      ? "bg-bone text-sumi"
      : panel.tone === "oxide"
        ? "bg-oxide text-bone"
        : "bg-ink text-bone";

  return (
    <section
      ref={(node) => {
        ref.current = node;
        registerRef(node);
      }}
      data-index={index}
      aria-labelledby={`${panel.id}-heading`}
      className={cx("relative border-b border-bone/10", tone)}
    >
      <div
        className={cx(
          "shell grid items-center gap-8 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16",
          flipped && "lg:[direction:rtl] lg:[&>*]:[direction:ltr]",
        )}
      >
        <div
          style={{
            clipPath: inView ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)" : "polygon(0 0, 0 0, 0 100%, 0 100%)",
            transition: "clip-path .9s var(--ease-slash)",
          }}
        >
          <p className={cx("font-mono text-[0.66rem] uppercase tracking-[0.2em]", panel.tone === "bone" ? "text-sumi/60" : "text-steel")}>
            Chapter {panel.chapter}
          </p>
          <div className="mt-4 flex items-start gap-4">
            <span className={cx("jp text-5xl leading-none sm:text-6xl", panel.tone === "oxide" ? "text-bone/70" : "text-oxide")}>
              {panel.kanji}
            </span>
            <h2 id={`${panel.id}-heading`} className="display text-3xl sm:text-5xl">
              {panel.heading}
            </h2>
          </div>
          <p
            className={cx(
              "mt-5 max-w-md text-sm leading-relaxed sm:text-base",
              panel.tone === "bone" ? "text-sumi/75" : panel.tone === "oxide" ? "text-bone/85" : "text-fog",
            )}
          >
            {panel.body}
          </p>
        </div>

        {panel.image ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate">
            <Img
              src={panel.image}
              alt={panel.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 45vw, 92vw"
              loading={index === 0 ? "eager" : "lazy"}
              className={cx(
                "object-cover transition-transform duration-[1.2s] ease-[var(--ease-slash)]",
                inView ? "scale-100" : "scale-105",
              )}
            />
            <span aria-hidden="true" className="halftone absolute inset-0 mix-blend-soft-light" />
          </div>
        ) : (
          <div aria-hidden="true" className="hidden lg:block">
            <span className={cx("jp block text-[10rem] leading-none opacity-10", panel.tone === "bone" ? "text-sumi" : "text-bone")}>
              {panel.kanji}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

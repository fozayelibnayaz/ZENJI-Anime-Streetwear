"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Progress of an element through the viewport, 0 at "top edge enters" and 1 at
 * "bottom edge leaves". Read on rAF rather than on every scroll event so the
 * manga scroller stays at 60fps on a mid-range Android.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let running = true;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const span = rect.height + viewport;
      const value = span > 0 ? (viewport - rect.top) / span : 0;
      setProgress(Math.min(1, Math.max(0, value)));
    };

    const onScroll = () => {
      if (frame || !running) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { ref, progress } as const;
}

"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** 0–1 of the element that must be visible before it counts as "in". */
  threshold?: number;
  /** Fire once and disconnect — the default, because reveal animations should
   *  not replay every time you scroll back up. */
  once?: boolean;
  rootMargin?: string;
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.2,
  once = true,
  rootMargin = "0px 0px -8% 0px",
}: Options = {}) {
  const ref = useRef<T | null>(null);
  // Browsers without IntersectionObserver (and test environments) skip the
  // animation entirely and show the content straight away.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return { ref, inView } as const;
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Normalised scroll speed, 0 (still) to 1 (flicking). Used to drive the manga
 * speed lines — the faster you scroll, the harder the page draws them.
 */
export function useScrollVelocity(maxPxPerFrame = 90) {
  const [velocity, setVelocity] = useState(0);
  const last = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    let current = 0;

    const tick = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - last.current);
      last.current = y;
      // Ease towards the new value so the lines fade instead of flickering.
      current += (Math.min(1, delta / maxPxPerFrame) - current) * 0.18;
      setVelocity(current < 0.01 ? 0 : current);
      raf.current = window.requestAnimationFrame(tick);
    };

    raf.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf.current);
  }, [maxPxPerFrame]);

  return velocity;
}

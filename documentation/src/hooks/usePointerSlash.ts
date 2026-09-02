"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SlashOptions {
  /** Starting cut position, 0 (far left) to 1 (far right). */
  initial?: number;
  /** Sweep the cut on its own until the visitor touches it. */
  demo?: boolean;
}

/**
 * The hero interaction: a katana cut you drag across the garment to reveal the
 * back print. Pointer, touch and keyboard all drive the same number.
 *
 * Everything is written to a ref and flushed on requestAnimationFrame — React
 * state updates at 120Hz would drop frames on a phone.
 */
export function usePointerSlash({ initial = 0.5, demo = true }: SlashOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(initial);
  const [engaged, setEngaged] = useState(false);

  const target = useRef(initial);
  const frame = useRef(0);
  const dragging = useRef(false);
  const engagedRef = useRef(false);

  const flush = useCallback(() => {
    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      setPosition(target.current);
    });
  }, []);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.width === 0) return;
      const next = (clientX - rect.left) / rect.width;
      target.current = Math.min(0.97, Math.max(0.03, next));
      flush();
    },
    [flush],
  );

  const engage = useCallback(() => {
    if (engagedRef.current) return;
    engagedRef.current = true;
    setEngaged(true);
  }, []);

  const nudge = useCallback(
    (delta: number) => {
      engage();
      target.current = Math.min(0.97, Math.max(0.03, target.current + delta));
      flush();
    },
    [engage, flush],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onPointerDown = (event: PointerEvent) => {
      dragging.current = true;
      engage();
      node.setPointerCapture?.(event.pointerId);
      setFromClientX(event.clientX);
    };

    const onPointerMove = (event: PointerEvent) => {
      // Mouse follows on hover; touch only follows an actual drag, so the page
      // can still be scrolled with a finger on top of the hero.
      if (event.pointerType === "mouse") {
        engage();
        setFromClientX(event.clientX);
        return;
      }
      if (!dragging.current) return;
      setFromClientX(event.clientX);
    };

    const stop = (event: PointerEvent) => {
      dragging.current = false;
      node.releasePointerCapture?.(event.pointerId);
    };

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("pointermove", onPointerMove, { passive: true });
    node.addEventListener("pointerup", stop);
    node.addEventListener("pointercancel", stop);

    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerup", stop);
      node.removeEventListener("pointercancel", stop);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [engage, setFromClientX]);

  /* Idle demo: a slow breath across the garment so the hero is never a dead
     screen, killed the instant someone interacts or if motion is reduced. */
  useEffect(() => {
    if (!demo || engaged) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      target.current = 0.5 + Math.sin(t * 0.55) * 0.22;
      setPosition(target.current);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [demo, engaged]);

  return { containerRef, position, engaged, nudge, setFromClientX } as const;
}

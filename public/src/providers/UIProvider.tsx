"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

type Overlay = "loadout" | "console" | "size-guide" | null;

interface UIContextValue {
  overlay: Overlay;
  quickView: string | null;
  openOverlay: (overlay: Exclude<Overlay, null>) => void;
  closeOverlay: () => void;
  openQuickView: (slug: string) => void;
  closeQuickView: () => void;
  toasts: Toast[];
  toast: (message: string, action?: Toast["action"]) => void;
  dismissToast: (id: number) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

const TOAST_TTL = 5000;

export function UIProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [quickView, setQuickView] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const openOverlay = useCallback((next: Exclude<Overlay, null>) => {
    setQuickView(null);
    setOverlay(next);
  }, []);

  const closeOverlay = useCallback(() => setOverlay(null), []);
  const openQuickView = useCallback((slug: string) => {
    setOverlay(null);
    setQuickView(slug);
  }, []);
  const closeQuickView = useCallback(() => setQuickView(null), []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message: string, action?: Toast["action"]) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, action }]);
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), TOAST_TTL),
      );
    },
    [dismissToast],
  );

  // Escape closes whatever is on top, everywhere, without each overlay wiring
  // up its own listener.
  useEffect(() => {
    if (!overlay && !quickView) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuickView(null);
        setOverlay(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay, quickView]);

  // Lock the page behind an open overlay, compensating for the scrollbar so the
  // layout does not jump on desktop.
  useEffect(() => {
    const locked = Boolean(overlay || quickView);
    const { body, documentElement } = document;
    if (!locked) return;

    const gap = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [overlay, quickView]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo<UIContextValue>(
    () => ({
      overlay,
      quickView,
      openOverlay,
      closeOverlay,
      openQuickView,
      closeQuickView,
      toasts,
      toast,
      dismissToast,
    }),
    [overlay, quickView, openOverlay, closeOverlay, openQuickView, closeQuickView, toasts, toast, dismissToast],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside <UIProvider>");
  return context;
}

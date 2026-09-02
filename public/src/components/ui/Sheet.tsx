"use client";

import type { ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cx } from "@/lib/cx";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Where the panel comes from. Mobile always gets a bottom sheet for `side`. */
  placement?: "right" | "center" | "bottom";
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared shell for every overlay on the site: one backdrop, one focus trap, one
 * set of animation rules. Consistency here is what stops an interactive site
 * from feeling messy.
 */
export function Sheet({ open, onClose, placement = "right", label, children, className }: SheetProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  if (!open) return null;

  const panelPosition =
    placement === "right"
      ? "inset-y-0 right-0 w-full max-w-[26rem] border-l"
      : placement === "bottom"
        ? "inset-x-0 bottom-0 max-h-[85dvh] border-t"
        : "inset-x-0 top-[8vh] mx-auto w-[min(46rem,92vw)] border";

  const panelAnimation =
    placement === "right" ? "animate-[zenji-slash-in_.35s_var(--ease-slash)_both]" : "animate-[zenji-rise_.3s_var(--ease-slash)_both]";

  return (
    <div className="fixed inset-0 z-[90]" role="presentation">
      <button
        type="button"
        aria-label={`Close ${label}`}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-sumi/80 backdrop-blur-sm animate-[zenji-rise_.2s_ease-out_both]"
      />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cx(
          "absolute flex flex-col border-bone/12 bg-ink shadow-panel outline-none",
          panelPosition,
          panelAnimation,
          className,
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {children}
      </div>
    </div>
  );
}

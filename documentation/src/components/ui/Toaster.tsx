"use client";

import { useUI } from "@/providers/UIProvider";

/**
 * Toasts double as the site's aria-live region, so screen readers hear "added
 * to loadout" at the same moment everyone else sees it.
 */
export function Toaster() {
  const { toasts, dismissToast } = useUI();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[95] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:px-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-4 border border-bone/12 bg-slate/95 px-4 py-3 shadow-panel backdrop-blur animate-[zenji-rise_.25s_var(--ease-slash)_both]"
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-bone">{toast.message}</p>
          <div className="flex shrink-0 items-center gap-3">
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.run();
                  dismissToast(toast.id);
                }}
                className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-oxide hover:underline"
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-steel transition-colors hover:text-bone"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

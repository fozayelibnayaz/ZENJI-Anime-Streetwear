"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { Size } from "@/content/products";
import type { FitPreference } from "@/content/sizing";
import type { FitDna } from "@/lib/dna";

export interface StoredFit {
  size: Size;
  chest: number;
  length: number;
  preference: FitPreference;
  confidence: "high" | "medium" | "low";
  savedAt: number;
}

export type MotionSetting = "auto" | "off";
export type Unit = "cm" | "in";

interface Preferences {
  motion: MotionSetting;
  unit: Unit;
  fit: StoredFit | null;
  saved: string[];
  recent: string[];
  earlyAccess: boolean;
  /** Fit DNA taste profile, sequenced in the Fit Lab. */
  dna: FitDna | null;
  /** Looks crowned in the Versus ring — the Floorwalker pulls like these. */
  crowned: string[];
}

const DEFAULTS: Preferences = {
  motion: "auto",
  unit: "cm",
  fit: null,
  saved: [],
  recent: [],
  earlyAccess: false,
  dna: null,
  crowned: [],
};

interface PreferencesContextValue extends Preferences {
  hydrated: boolean;
  setMotion: (value: MotionSetting) => void;
  toggleMotion: () => void;
  setUnit: (value: Unit) => void;
  setFit: (fit: StoredFit | null) => void;
  toggleSaved: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  noteVisit: (slug: string) => void;
  grantEarlyAccess: () => void;
  setDna: (dna: FitDna | null) => void;
  crown: (slug: string) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const STORAGE_KEY = "zenji.prefs.v1";
const RECENT_LIMIT = 6;

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs, hydrated] = usePersistentState<Preferences>(STORAGE_KEY, DEFAULTS);

  // The CSS reads this attribute, so the toggle kills animation everywhere at
  // once without every component subscribing to the context.
  useEffect(() => {
    document.documentElement.dataset.motion = prefs.motion === "off" ? "off" : "on";
  }, [prefs.motion]);

  const setMotion = useCallback((motion: MotionSetting) => setPrefs((c) => ({ ...c, motion })), [setPrefs]);

  const toggleMotion = useCallback(
    () => setPrefs((c) => ({ ...c, motion: c.motion === "off" ? "auto" : "off" })),
    [setPrefs],
  );

  const setUnit = useCallback((unit: Unit) => setPrefs((c) => ({ ...c, unit })), [setPrefs]);

  const setFit = useCallback((fit: StoredFit | null) => setPrefs((c) => ({ ...c, fit })), [setPrefs]);

  const toggleSaved = useCallback(
    (slug: string) =>
      setPrefs((c) => ({
        ...c,
        saved: c.saved.includes(slug) ? c.saved.filter((s) => s !== slug) : [...c.saved, slug],
      })),
    [setPrefs],
  );

  const noteVisit = useCallback(
    (slug: string) =>
      setPrefs((c) => ({ ...c, recent: [slug, ...c.recent.filter((s) => s !== slug)].slice(0, RECENT_LIMIT) })),
    [setPrefs],
  );

  const grantEarlyAccess = useCallback(() => setPrefs((c) => ({ ...c, earlyAccess: true })), [setPrefs]);

  const setDna = useCallback((dna: FitDna | null) => setPrefs((c) => ({ ...c, dna })), [setPrefs]);

  const crown = useCallback(
    (slug: string) =>
      setPrefs((c) => ({ ...c, crowned: [slug, ...c.crowned.filter((s) => s !== slug)].slice(0, 8) })),
    [setPrefs],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...DEFAULTS,
      ...prefs,
      hydrated,
      setMotion,
      toggleMotion,
      setUnit,
      setFit,
      toggleSaved,
      isSaved: (slug: string) => prefs.saved?.includes(slug) ?? false,
      noteVisit,
      grantEarlyAccess,
      setDna,
      crown,
    }),
    [prefs, hydrated, setMotion, toggleMotion, setUnit, setFit, toggleSaved, noteVisit, grantEarlyAccess, setDna, crown],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return context;
}

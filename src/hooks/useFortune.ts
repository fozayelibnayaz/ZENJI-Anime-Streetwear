"use client";

import { useCallback } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { dayKey, type DrawnFortune, type StoredFortune } from "@/lib/omikuji";

const STORAGE_KEY = "zenji.omikuji.v1";

/**
 * The drawn fortune is shared state: the shrine writes it, the loadout drawer
 * reads it to honour the seal code. usePersistentState keeps both in sync.
 */
export function useFortune() {
  const [stored, setStored, hydrated] = usePersistentState<StoredFortune | null>(STORAGE_KEY, null);

  const today = dayKey();
  const todaysFortune = hydrated && stored && stored.day === today ? stored.fortune : null;

  const keep = useCallback(
    (fortune: DrawnFortune) => setStored({ day: fortune.day, fortune }),
    [setStored],
  );

  return { stored, todaysFortune, drawnToday: todaysFortune !== null, keep, hydrated };
}

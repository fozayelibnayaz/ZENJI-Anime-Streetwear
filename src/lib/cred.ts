import { useCallback } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

/**
 * STREET CRED — the showroom's loyalty game.
 *
 * Every playful interaction (hanging a piece, saving a look, drawing an omikuji,
 * exporting a card…) earns cred. Pure thresholds + titles live here so any
 * surface can render the badge consistently. Everything persists on-device.
 */

export interface CredEntry {
  at: number;
  why: string;
  pts: number;
}

export interface CredState {
  points: number;
  log: CredEntry[];
}

export interface CredLevel {
  title: string;
  kanji: string;
  min: number;
  note: string;
}

export const CRED_LEVELS: CredLevel[] = [
  { min: 0, title: "Genji", kanji: "初心", note: "street rookie" },
  { min: 60, title: "Rōnin", kanji: "浪人", note: "wanders the racks" },
  { min: 140, title: "Kage", kanji: "影", note: "moves through drops unseen" },
  { min: 260, title: "Sensei", kanji: "先生", note: "the rail listens to you" },
  { min: 420, title: "Ukiyo Legend", kanji: "浮世", note: "the floating world knows your fit" },
];

export function levelFor(points: number): CredLevel {
  let current = CRED_LEVELS[0];
  for (const level of CRED_LEVELS) if (points >= level.min) current = level;
  return current;
}

export function nextLevelFor(points: number): CredLevel | null {
  return CRED_LEVELS.find((level) => level.min > points) ?? null;
}

/** 0–1 progress between the current level and the next one. */
export function levelProgress(points: number): number {
  const next = nextLevelFor(points);
  if (!next) return 1;
  const current = levelFor(points);
  return Math.min(1, Math.max(0, (points - current.min) / (next.min - current.min)));
}

const STORAGE_KEY = "zenji.cred.v1";
const LOG_LIMIT = 12;

export function useCred() {
  const [state, setState, hydrated] = usePersistentState<CredState>(STORAGE_KEY, { points: 0, log: [] });

  const earn = useCallback(
    (why: string, pts: number) =>
      setState((current) => ({
        points: current.points + pts,
        log: [{ at: Date.now(), why, pts }, ...current.log].slice(0, LOG_LIMIT),
      })),
    [setState],
  );

  return {
    points: state.points,
    log: state.log,
    level: levelFor(state.points),
    next: nextLevelFor(state.points),
    progress: levelProgress(state.points),
    hydrated,
    earn,
  };
}

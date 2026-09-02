"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state.
 *
 * Storage is treated as an external store rather than something an effect
 * copies into React state: the server renders the fallback, the client reads the
 * real value on its first paint, and every hook using the same key stays in sync
 * (including across browser tabs).
 *
 * It also has to survive the real world — private-mode Safari, a full quota, and
 * values left behind by an older build — so every access is guarded.
 */
interface Store<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

const stores = new Map<string, Store<unknown>>();

function createStore<T>(key: string, fallback: T): Store<T> {
  let value = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) value = JSON.parse(raw) as T;
    } catch {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* storage unavailable — carry on with the in-memory value */
      }
    }
  };

  const emit = () => listeners.forEach((listener) => listener());

  return {
    get() {
      if (!loaded && typeof window !== "undefined") load();
      return value;
    },
    set(next: T) {
      value = next;
      loaded = true;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* quota exceeded or private mode — the session still works */
      }
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      // Another tab changing the same key should update this one too.
      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        loaded = false;
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

function getStore<T>(key: string, fallback: T): Store<T> {
  let store = stores.get(key) as Store<T> | undefined;
  if (!store) {
    store = createStore(key, fallback);
    stores.set(key, store as Store<unknown>);
  }
  return store;
}

export function usePersistentState<T>(key: string, fallback: T) {
  const store = getStore(key, fallback);

  const value = useSyncExternalStore(
    store.subscribe,
    store.get,
    () => fallback,
  );

  const hydrated = useMountedFlag();

  const persist = useCallback(
    (next: T | ((current: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (current: T) => T)(store.get()) : next;
      store.set(resolved);
    },
    [store],
  );

  return [value, persist, hydrated] as const;
}

const noopSubscribe = () => () => {};

function useMountedFlag(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

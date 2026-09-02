"use client";

import { useSyncExternalStore } from "react";

/** No client-side source ever changes, so the subscription is a no-op. */
const subscribe = () => () => {};

/**
 * True once the component has mounted on the client, false during SSR and the
 * hydration pass. Implemented with useSyncExternalStore rather than an effect so
 * React can tell the two renders apart without a cascading state update.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

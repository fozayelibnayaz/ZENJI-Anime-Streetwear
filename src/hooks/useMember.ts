"use client";

import { useCallback } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  EMPTY_MEMBERS,
  createAccount,
  restoreStores,
  snapshotStores,
  validateHandle,
  validatePass,
  verifyPass,
  type MembersStore,
} from "@/lib/members";

/**
 * Session glue for the house list. Sign-in/out swaps each member's saved
 * stores into place and reloads once so every provider rehydrates with the
 * right wardrobe.
 */
export function useMember() {
  const [store, setStore, hydrated] = usePersistentState<MembersStore>("zenji.members.v1", EMPTY_MEMBERS);
  const account = store.session ? (store.accounts[store.session] ?? null) : null;

  const signUp = useCallback(
    (handle: string, name: string, pass: string): string | null => {
      const clean = handle.trim().toLowerCase();
      const err = validateHandle(clean) ?? validatePass(pass);
      if (err) return err;
      const result = createAccount(store, clean, name, pass, snapshotStores());
      if ("error" in result) return result.error;
      setStore(result.store);
      window.setTimeout(() => window.location.reload(), 150);
      return null;
    },
    [store, setStore],
  );

  const signIn = useCallback(
    (handle: string, pass: string): string | null => {
      const clean = handle.trim().toLowerCase();
      const target = store.accounts[clean];
      if (!target) return "No such handle on the list.";
      if (!verifyPass(target, pass)) return "Wrong passcode.";
      const accounts = store.session
        ? { ...store.accounts, [store.session]: { ...store.accounts[store.session], saved: snapshotStores() } }
        : store.accounts;
      setStore({ accounts, session: clean });
      restoreStores(target.saved);
      window.setTimeout(() => window.location.reload(), 150);
      return null;
    },
    [store, setStore],
  );

  const signOut = useCallback(() => {
    if (!store.session) return;
    const accounts = {
      ...store.accounts,
      [store.session]: { ...store.accounts[store.session], saved: snapshotStores() },
    };
    setStore({ accounts, session: null });
    window.setTimeout(() => window.location.reload(), 150);
  }, [store, setStore]);

  return { account, memberCount: Object.keys(store.accounts).length, signUp, signIn, signOut, hydrated };
}

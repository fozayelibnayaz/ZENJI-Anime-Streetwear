import { hash } from "@/lib/counter";

/**
 * THE HOUSE LIST — client-side member accounts.
 *
 * This is a static concept build: there is no server, so accounts live in the
 * browser. Passcodes are salted + hashed (never stored raw), and each member's
 * progress — cred, loadout, closet slots, counter slips, arcade scores — is
 * snapshotted per account, so signing in swaps the whole wardrobe over.
 * Upgrading to cloud auth later means swapping this module for a provider;
 * the UI only talks to useMember().
 */

/** Every persisted store that travels with a member. */
export const DATA_KEYS = [
  "zenji.cred.v1",
  "zenji.loadout.v1",
  "zenji.prefs.v1",
  "zenji.closet.slots.v1",
  "zenji.counter.v1",
  "zenji.arcade.slash.v1",
  "zenji.omikuji.v1",
  "zenji.floorwalker.v1",
] as const;

export interface MemberAccount {
  handle: string;
  name: string;
  salt: string;
  passHash: number;
  createdAt: number;
  /** localStorage snapshot of DATA_KEYS, taken on sign-out / sign-up. */
  saved: Partial<Record<string, string>>;
}

export interface MembersStore {
  accounts: Record<string, MemberAccount>;
  session: string | null;
}

export const EMPTY_MEMBERS: MembersStore = { accounts: {}, session: null };

export function validateHandle(handle: string): string | null {
  if (!/^[a-z0-9-]{3,16}$/.test(handle)) {
    return "Handle: 3–16 chars, a–z, 0–9 or dash.";
  }
  return null;
}

export function validatePass(pass: string): string | null {
  if (pass.length < 4) return "Passcode: at least 4 characters.";
  return null;
}

export function passHash(salt: string, pass: string): number {
  return hash(`${salt}//${pass}`);
}

export function makeSalt(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createAccount(
  store: MembersStore,
  handle: string,
  name: string,
  pass: string,
  saved: Partial<Record<string, string>>,
): { store: MembersStore } | { error: string } {
  if (store.accounts[handle]) return { error: "That handle's already on the list." };
  const salt = makeSalt();
  const account: MemberAccount = {
    handle,
    name: name.trim() || handle,
    salt,
    passHash: passHash(salt, pass),
    createdAt: Date.now(),
    saved,
  };
  return {
    store: { accounts: { ...store.accounts, [handle]: account }, session: handle },
  };
}

export function verifyPass(account: MemberAccount, pass: string): boolean {
  return passHash(account.salt, pass) === account.passHash;
}

/* ---- browser-side snapshot helpers (no-ops during SSR) ---- */

export function snapshotStores(): Partial<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const out: Partial<Record<string, string>> = {};
  for (const key of DATA_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) out[key] = value;
  }
  return out;
}

export function restoreStores(saved: Partial<Record<string, string>>): void {
  if (typeof window === "undefined") return;
  for (const key of DATA_KEYS) {
    const value = saved[key];
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  }
}

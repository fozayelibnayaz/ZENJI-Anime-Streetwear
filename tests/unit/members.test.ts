import { describe, expect, it } from "vitest";
import {
  DATA_KEYS,
  EMPTY_MEMBERS,
  createAccount,
  passHash,
  validateHandle,
  validatePass,
  verifyPass,
} from "@/lib/members";

describe("validation", () => {
  it("accepts sensible handles", () => {
    expect(validateHandle("koma-01")).toBeNull();
    expect(validateHandle("zen")).toBeNull();
  });

  it("rejects short, long or weird handles", () => {
    expect(validateHandle("ab")).not.toBeNull();
    expect(validateHandle("x".repeat(17))).not.toBeNull();
    expect(validateHandle("KOMA")).not.toBeNull();
    expect(validateHandle("no spaces")).not.toBeNull();
  });

  it("passcode needs 4+ chars", () => {
    expect(validatePass("1234")).toBeNull();
    expect(validatePass("123")).not.toBeNull();
  });
});

describe("passcodes", () => {
  it("hashes deterministically and salt-sensitive", () => {
    expect(passHash("s1", "kage")).toBe(passHash("s1", "kage"));
    expect(passHash("s1", "kage")).not.toBe(passHash("s2", "kage"));
    expect(passHash("s1", "kage")).not.toBe(passHash("s1", "KAGE"));
  });
});

describe("accounts", () => {
  it("creates an account, starts a session, never stores the raw passcode", () => {
    const result = createAccount(EMPTY_MEMBERS, "koma-01", "Koma Fan", "secrets", {});
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.store.session).toBe("koma-01");
    const account = result.store.accounts["koma-01"];
    expect(account.name).toBe("Koma Fan");
    expect(JSON.stringify(account)).not.toContain("secrets");
    expect(verifyPass(account, "secrets")).toBe(true);
    expect(verifyPass(account, "wrong")).toBe(false);
  });

  it("refuses duplicate handles", () => {
    const first = createAccount(EMPTY_MEMBERS, "koma-01", "A", "1234", {});
    if ("error" in first) throw new Error("setup failed");
    const second = createAccount(first.store, "koma-01", "B", "5678", {});
    expect("error" in second).toBe(true);
  });

  it("carries the member's saved stores on the account", () => {
    const saved = { "zenji.cred.v1": '{"points":42,"log":[]}' };
    const result = createAccount(EMPTY_MEMBERS, "zen", "", "1234", saved);
    if ("error" in result) throw new Error("setup failed");
    expect(result.store.accounts["zen"].saved["zenji.cred.v1"]).toContain("42");
    expect(result.store.accounts["zen"].name).toBe("zen"); // falls back to handle
  });
});

describe("data keys", () => {
  it("travels all eight persisted stores", () => {
    expect(DATA_KEYS).toContain("zenji.cred.v1");
    expect(DATA_KEYS).toContain("zenji.closet.slots.v1");
    expect(DATA_KEYS).toContain("zenji.counter.v1");
    expect(DATA_KEYS).toHaveLength(8);
  });
});

"use client";

import { useState, type FormEvent } from "react";
import { useMember } from "@/hooks/useMember";
import { useCred } from "@/lib/cred";
import { cx } from "@/lib/cx";

const inputCls =
  "w-full border border-bone/20 bg-sumi/70 px-3 py-2 font-mono text-xs text-bone placeholder:text-steel focus:border-oxide focus:outline-none";

export function AccountDesk() {
  const { account, memberCount, signUp, signIn, signOut } = useMember();
  const { points, level } = useCred();
  const [mode, setMode] = useState<"up" | "in">("up");
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(mode === "up" ? signUp(handle, name, pass) : signIn(handle, pass));
  };

  if (account) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
        <div className="max-w-prose space-y-4">
          <p className="text-sm leading-relaxed text-fog">
            You are on the house list as <span className="text-bone">{account.name}</span>. Everything you earn — cred,
            loadout, saved looks, counter slips, arcade scores — is kept under this handle in this browser, and swaps
            over when you sign in elsewhere on the list.
          </p>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-steel">
            concept accounts: salted + hashed passcode, stored locally — no server, no email, no tracking.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="border border-bone/25 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-fog hover:border-oxide hover:text-bone"
          >
            Sign out
          </button>
        </div>

        {/* member card */}
        <div className="w-72 border border-oxide/50 bg-slate/70 p-5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-oxide">ZENJI // house list</p>
          <p className="display mt-3 text-3xl font-black uppercase text-bone">{account.name}</p>
          <p className="font-mono text-xs text-steel">@{account.handle}</p>
          <div className="mt-5 space-y-1.5 border-t border-bone/10 pt-4 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-fog">
            <p className="flex justify-between"><span>rank</span><span className="text-bone">{level.title} {level.kanji}</span></p>
            <p className="flex justify-between"><span>cred</span><span className="text-bone">{points}</span></p>
            <p className="flex justify-between"><span>since</span><span className="text-bone">{new Date(account.createdAt).toLocaleDateString("en-AU")}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 grid grid-cols-2 border border-bone/15">
        {(["up", "in"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={cx(
              "py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.2em]",
              mode === m ? "bg-oxide text-bone" : "text-steel hover:text-bone",
            )}
          >
            {m === "up" ? "Join the list" : "Sign in"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4 border border-bone/15 bg-slate/50 p-6">
        <label className="block">
          <span className="mb-1 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-steel">Handle</span>
          <input value={handle} onChange={(e) => setHandle(e.target.value)} className={inputCls} placeholder="e.g. koma-fan-01" autoComplete="username" />
        </label>
        {mode === "up" && (
          <label className="block">
            <span className="mb-1 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-steel">Name on the card</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="how the card should read" autoComplete="nickname" />
          </label>
        )}
        <label className="block">
          <span className="mb-1 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-steel">Passcode</span>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className={inputCls} placeholder="••••" autoComplete={mode === "up" ? "new-password" : "current-password"} />
        </label>

        {error && (
          <p className="border border-oxide/60 bg-oxide/10 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-oxide" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="w-full bg-oxide py-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-bone transition-transform hover:-translate-y-0.5">
          {mode === "up" ? "Sign me up" : "Back in"}
        </button>
        <p className="font-mono text-[0.6rem] leading-relaxed text-steel">
          {memberCount} on the list in this browser. Concept accounts: your passcode is salted + hashed and everything
          stays in this browser — no server, no email.
        </p>
      </form>
    </div>
  );
}

"use client";

import { useId, useState, type FormEvent } from "react";
import { cx } from "@/lib/cx";

type Status = "idle" | "sending" | "done" | "error";

// Deliberately loose: the point is catching typos, not policing valid addresses.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    // Honeypot — bots fill hidden fields, humans never see them.
    const trap = new FormData(event.currentTarget).get("company");
    if (trap) {
      setStatus("done");
      setMessage("You're on the list.");
      return;
    }

    if (!EMAIL.test(email.trim())) {
      setStatus("error");
      setMessage("That email does not look right — check the @ and the dot.");
      return;
    }

    setStatus("sending");
    // No backend in this build; the delay keeps the interaction honest.
    window.setTimeout(() => {
      setStatus("done");
      setMessage("You're on the list. Watch for the next chapter.");
      setEmail("");
    }, 550);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="mt-5">
      <label htmlFor={`${id}-email`} className="label">
        Email address
      </label>

      <div className="mt-2 flex">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          aria-describedby={`${id}-status`}
          placeholder="you@example.com.au"
          className="h-12 min-w-0 flex-1 border border-bone/20 bg-transparent px-3 font-mono text-sm text-bone outline-none transition-colors focus:border-oxide placeholder:text-steel/60"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-12 shrink-0 bg-bone px-5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sumi transition-colors hover:bg-oxide hover:text-bone disabled:opacity-50"
        >
          {status === "sending" ? "…" : "Join"}
        </button>
      </div>

      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <p
        id={`${id}-status`}
        role="status"
        aria-live="polite"
        className={cx(
          "mt-2 min-h-5 font-mono text-[0.66rem] uppercase tracking-[0.14em]",
          status === "error" ? "text-oxide" : "text-jade",
        )}
      >
        {message}
      </p>
    </form>
  );
}

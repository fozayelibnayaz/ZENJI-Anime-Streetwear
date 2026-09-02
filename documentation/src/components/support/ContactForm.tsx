"use client";

import { useId, useState, type FormEvent } from "react";
import { cx } from "@/lib/cx";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TOPICS = ["Order or shipping", "Sizing help", "Returns", "Wholesale / stockists", "Something else"];

/** Contact form with real client-side validation. No backend — it reports that honestly. */
export function ContactForm() {
  const id = useId();
  const [values, setValues] = useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!EMAIL.test(values.email.trim())) next.email = "We need a working email to reply to.";
    if (values.message.trim().length < 12) next.message = "A little more detail helps us answer properly.";
    return next;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem — a keyboard user should not have to hunt.
      const firstKey = Object.keys(found)[0];
      document.getElementById(`${id}-${firstKey}`)?.focus();
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
      setValues({ name: "", email: "", topic: TOPICS[0], message: "" });
    }, 600);
  };

  if (sent) {
    return (
      <div className="border border-jade/40 bg-jade/5 p-6" role="status">
        <p className="display text-2xl text-jade">Message queued</p>
        <p className="mt-2 text-sm leading-relaxed text-fog">
          This build has no backend, so nothing was actually sent — in production this posts to the support inbox and
          you would hear back within one business day.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-oxide underline underline-offset-4"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field id={`${id}-name`} label="Name" error={errors.name}>
        <input
          id={`${id}-name`}
          value={values.name}
          onChange={set("name")}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className={inputClass(Boolean(errors.name))}
        />
      </Field>

      <Field id={`${id}-email`} label="Email" error={errors.email}>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          value={values.email}
          onChange={set("email")}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className={inputClass(Boolean(errors.email))}
        />
      </Field>

      <Field id={`${id}-topic`} label="Topic" className="sm:col-span-2">
        <select id={`${id}-topic`} value={values.topic} onChange={set("topic")} className={inputClass(false)}>
          {TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </Field>

      <Field id={`${id}-message`} label="Message" error={errors.message} className="sm:col-span-2">
        <textarea
          id={`${id}-message`}
          rows={5}
          value={values.message}
          onChange={set("message")}
          aria-invalid={Boolean(errors.message)}
          className={cx(inputClass(Boolean(errors.message)), "h-auto py-3 leading-relaxed")}
        />
      </Field>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="h-12 bg-oxide px-7 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors hover:bg-oxide-deep disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return cx(
    "h-12 w-full border bg-sumi px-3 font-mono text-sm text-bone outline-none transition-colors focus:border-oxide",
    invalid ? "border-oxide" : "border-bone/20",
  );
}

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      <p className="mt-1 min-h-4 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-oxide">{error}</p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clerk, clerkSteps } from "@/content/floorwalker";
import { formatPrice } from "@/lib/money";
import { cx } from "@/lib/cx";
import { withBasePath } from "@/lib/asset";
import { availableSizes } from "@/lib/catalogue";
import { recommend, reasonFor, type ConciergeAnswers, EMPTY_ANSWERS } from "@/lib/concierge";
import { usePersistentState } from "@/hooks/usePersistentState";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useLoadout } from "@/providers/LoadoutProvider";
import { useUI } from "@/providers/UIProvider";
import { useCred } from "@/lib/cred";

interface Message {
  from: "clerk" | "you";
  text: string;
}

interface FloorwalkerStore {
  hinted: boolean;
  visits: number;
}

/**
 * THE FLOORWALKER — an opt-in showroom clerk.
 *
 * The bell is the contract: nothing moves until the shopper rings it. One
 * dismissible bubble is the only proactive surface, and "not today" is always
 * one tap away. Recommendations come from lib/concierge (answers + Fit DNA).
 */
export function Floorwalker() {
  const [store, setStore] = usePersistentState<FloorwalkerStore>("zenji.floorwalker.v1", {
    hinted: false,
    visits: 0,
  });
  const { dna, crowned } = usePreferences();
  const { add } = useLoadout();
  const { toast, openQuickView } = useUI();
  const { earn } = useCred();

  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(-1); // -1 greeting, 0..2 questions, 3 done
  const [answers, setAnswers] = useState<ConciergeAnswers>(EMPTY_ANSWERS);
  const scrollRef = useRef<HTMLDivElement>(null);

  // One gentle bubble, once, only until dismissed or the bell is rung.
  useEffect(() => {
    if (store.hinted || open) return;
    const timer = setTimeout(() => setBubble(true), 6000);
    return () => clearTimeout(timer);
  }, [store.hinted, open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, typing]);

  const say = (text: string, then?: () => void) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((current) => [...current, { from: "clerk", text }]);
      then?.();
    }, 650);
  };

  const ring = () => {
    setBubble(false);
    setStore((current) => ({ ...current, hinted: true, visits: current.visits + 1 }));
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setMessages([]);
    setAnswers(EMPTY_ANSWERS);
    setStep(-1);
    say(store.visits > 0 ? clerk.greetingBack : clerk.greeting, () => setStep(0));
  };

  const dismissBubble = () => {
    setBubble(false);
    setStore((current) => ({ ...current, hinted: true }));
  };

  const answer = (value: string, label: string) => {
    setMessages((current) => [...current, { from: "you", text: label }]);
    const nextAnswers: ConciergeAnswers = {
      vibe: step === 0 ? (value as ConciergeAnswers["vibe"]) : answers.vibe,
      climate: step === 1 ? (value as ConciergeAnswers["climate"]) : answers.climate,
      budget: step === 2 ? (value as ConciergeAnswers["budget"]) : answers.budget,
    };
    setAnswers(nextAnswers);
    if (step < clerkSteps.length - 1) {
      const nextStep = step + 1;
      say(clerkSteps[nextStep].ask, () => setStep(nextStep));
    } else {
      setStep(3);
      say("Three pieces, pulled for you. The rail approves.", () => earn("asked the floorwalker", 5));
    }
  };

  const notToday = () => {
    setOpen(false);
    setBubble(false);
    toast(clerk.decline);
  };

  const picks = step === 3 ? recommend(answers, dna, 3, crowned) : [];

  const addPick = (slug: string) => {
    const product = recommend(answers, dna, 3, crowned).find((p) => p.slug === slug);
    if (!product) return;
    const size = availableSizes(product)[0];
    if (!size) return;
    add(slug, size);
    toast(`${product.name} hung in your loadout`);
    earn("floorwalker pull", 5);
  };

  return (
    <>
      {/* the bell + one dismissible bubble — the entire proactive surface */}
      <div className="fixed bottom-4 right-4 z-[75] flex flex-col items-end gap-3">
        {bubble && !open ? (
          <div className="relative max-w-56 border border-bone/20 bg-ink/95 p-3 text-xs text-fog shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={dismissBubble}
              aria-label="Dismiss help bubble"
              className="absolute right-1 top-1 px-1 text-steel hover:text-bone"
            >
              ✕
            </button>
            <span className="jp mr-1 text-oxide">案内</span>
            {clerk.bubble}
          </div>
        ) : null}
        <button
          type="button"
          onClick={ring}
          aria-label={open ? "Close the floorwalker" : "Ring for the floorwalker"}
          className={cx(
            "grid h-14 w-14 place-items-center rounded-full border text-xl transition-all",
            open
              ? "border-oxide bg-oxide text-bone"
              : "border-bone/25 bg-ink/90 text-bone hover:border-oxide hover:text-oxide fw-bell",
          )}
        >
          <span aria-hidden="true">{open ? "✕" : "🛎"}</span>
        </button>
      </div>

      {open ? (
        <section
          aria-label="The floorwalker — showroom help"
          className="fixed bottom-24 right-4 z-[75] flex max-h-[min(70dvh,540px)] w-[min(92vw,380px)] flex-col border border-bone/20 bg-ink/97 shadow-2xl backdrop-blur"
        >
          <header className="flex items-center gap-3 border-b border-bone/10 p-3">
            <ClerkAvatar bow={step === -1 || typing} />
            <div className="min-w-0">
              <p className="display text-sm tracking-[0.18em]">{clerk.name}</p>
              <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">{clerk.role}</p>
            </div>
            <button type="button" onClick={notToday} className="ml-auto px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel hover:text-bone">
              Not today
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <p
                key={index}
                className={cx(
                  "max-w-[85%] border px-3 py-2 text-xs leading-relaxed",
                  message.from === "clerk" ? "border-bone/10 bg-sumi text-fog" : "ml-auto border-oxide/40 bg-oxide/10 text-bone",
                )}
              >
                {message.text}
              </p>
            ))}
            {typing ? (
              <p className="flex w-14 items-center justify-center gap-1 border border-bone/10 bg-sumi px-3 py-2" aria-label="Kira is typing">
                <span className="fw-dot h-1 w-1 rounded-full bg-steel" />
                <span className="fw-dot h-1 w-1 rounded-full bg-steel" style={{ animationDelay: "0.15s" }} />
                <span className="fw-dot h-1 w-1 rounded-full bg-steel" style={{ animationDelay: "0.3s" }} />
              </p>
            ) : null}

            {step >= 0 && step < clerkSteps.length && !typing ? (
              <div className="flex flex-col gap-2 pt-1">
                {clerkSteps[step].options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => answer(option.value, option.label)}
                    className="border border-bone/15 px-3 py-2 text-left text-xs text-fog transition-colors hover:border-oxide hover:text-bone"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {step === 3 && !typing ? (
              <div className="space-y-2 pt-1">
                {picks.map((product) => (
                  <div key={product.slug} className="border border-bone/10 bg-sumi p-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={withBasePath(product.images.front)}
                        alt=""
                        className="h-14 w-11 shrink-0 object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs text-bone">{product.name}</p>
                        <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-steel">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[0.68rem] leading-relaxed text-steel">“{reasonFor(product, answers)}”</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openQuickView(product.slug)}
                        className="flex-1 border border-bone/20 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog hover:border-bone/60 hover:text-bone"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => addPick(product.slug)}
                        className="flex-1 border border-oxide/60 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-oxide hover:bg-oxide hover:text-bone"
                      >
                        Hang it
                      </button>
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-[0.68rem] text-steel">{clerk.closing}</p>
                <p className="pt-1 text-[0.68rem] text-steel">
                  <Link href="/counter" className="text-oxide underline-offset-4 hover:underline">
                    {clerk.counterTip}
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

/** Small animated anime clerk — pure SVG, blinks and bows via CSS. */
function ClerkAvatar({ bow }: { bow: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cx("h-11 w-11 shrink-0", bow && "fw-bow")}
      role="img"
      aria-label="Kira, the floorwalker"
    >
      <rect x="8" y="30" width="48" height="30" fill="#17171b" stroke="#3a3a41" />
      <path d="M8 34 L56 34" stroke="#e23a2e" strokeWidth="2" />
      <circle cx="32" cy="22" r="14" fill="#e8d5c4" />
      <path d="M18 20 Q20 6 32 7 Q44 6 46 20 Q40 14 32 14 Q24 14 18 20Z" fill="#101013" />
      <g className="fw-blink">
        <circle cx="27" cy="23" r="1.8" fill="#101013" />
        <circle cx="37" cy="23" r="1.8" fill="#101013" />
      </g>
      <path d="M29 29 Q32 31 35 29" stroke="#101013" strokeWidth="1.2" fill="none" />
      <rect x="26" y="40" width="12" height="10" fill="#0c0c0e" stroke="#e23a2e" strokeWidth="1" />
      <text x="32" y="48" textAnchor="middle" fontSize="7" fill="#e23a2e">
        禅
      </text>
    </svg>
  );
}

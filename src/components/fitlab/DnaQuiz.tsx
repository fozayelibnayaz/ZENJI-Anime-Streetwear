"use client";

import { useState } from "react";
import { DNA_AXES, DNA_QUESTIONS, dnaFromAnswers, dnaMatch, matchLabel, productDna, type FitDna } from "@/lib/dna";
import { products } from "@/content/products";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useUI } from "@/providers/UIProvider";
import { useCred } from "@/lib/cred";

/**
 * FIT DNA — five questions, one pentagon.
 *
 * The profile is stored in preferences and consumed by the PDP match badge and
 * the Floorwalker's brain, so the whole showroom quietly learns your taste.
 */
export function DnaQuiz() {
  const { dna, setDna } = usePreferences();
  const { toast } = useUI();
  const { earn } = useCred();
  const [step, setStep] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const pick = (questionId: string, optionIndex: number) => {
    const next = { ...answers, [questionId]: optionIndex };
    setAnswers(next);
    if (step !== null && step < DNA_QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    const profile = dnaFromAnswers(next);
    setDna(profile);
    earn("sequenced fit DNA", 10);
    toast("Fit DNA sequenced — match % now shows across the store");
    setStep(null);
  };

  const best = dna
    ? [...products].map((p) => ({ p, score: dnaMatch(dna, productDna(p)) })).sort((a, b) => b.score - a.score)[0]
    : null;

  return (
    <section aria-labelledby="dna-heading" className="mt-20 border-t border-bone/10 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Tool_002 // taste, measured</p>
          <h2 id="dna-heading" className="display mt-3 text-3xl sm:text-4xl">
            Fit DNA
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-fog">
            Five instincts, one pentagon. The store reads it back as a match percentage on every piece — and the
            floorwalker uses it to pull your three.
          </p>
        </div>
        {step === null ? (
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setStep(0);
            }}
            className="h-11 border border-oxide px-5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-oxide transition-colors hover:bg-oxide hover:text-bone"
          >
            {dna ? "Re-sequence" : "Sequence my DNA"}
          </button>
        ) : null}
      </div>

      {step !== null ? (
        <div className="mt-8 border border-bone/12 bg-ink p-5 sm:p-7">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">
            {String(step + 1).padStart(2, "0")} / {String(DNA_QUESTIONS.length).padStart(2, "0")}
          </p>
          <p className="display mt-3 text-xl sm:text-2xl">{DNA_QUESTIONS[step].prompt}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {DNA_QUESTIONS[step].options.map((option, index) => (
              <button
                key={option.label}
                type="button"
                onClick={() => pick(DNA_QUESTIONS[step].id, index)}
                className="border border-bone/15 px-4 py-3 text-left text-xs leading-relaxed text-fog transition-colors hover:border-oxide hover:text-bone"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : dna ? (
        <div className="mt-8 grid gap-8 border border-bone/12 bg-ink p-5 sm:p-7 lg:grid-cols-[auto_1fr]">
          <Radar dna={dna} />
          <div>
            <ul className="space-y-2">
              {DNA_AXES.map((axis) => (
                <li key={axis.id} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel">
                    <span className="jp mr-1 text-oxide">{axis.kanji}</span>
                    {axis.label}
                  </span>
                  <span className="h-1.5 bg-bone/10">
                    <span className="block h-full bg-oxide" style={{ width: `${dna[axis.id]}%` }} />
                  </span>
                  <span className="text-right font-mono text-[0.62rem] text-fog">{dna[axis.id]}</span>
                </li>
              ))}
            </ul>
            {best ? (
              <p className="mt-6 text-sm text-fog">
                Closest piece on the floor: <span className="text-bone">{best.p.name}</span> — {best.score}%{" "}
                {matchLabel(best.score)}.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** Animated pentagon radar of the five axes. */
function Radar({ dna }: { dna: FitDna }) {
  const size = 220;
  const center = size / 2;
  const radius = 86;
  const point = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / DNA_AXES.length - Math.PI / 2;
    const r = (value / 100) * radius;
    return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
  };
  const ring = (value: number) => DNA_AXES.map((_, index) => point(index, value)).join(" ");
  const profile = DNA_AXES.map((axis, index) => point(index, dna[axis.id])).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-52 w-52" role="img" aria-label="Fit DNA radar chart">
      {[25, 50, 75, 100].map((value) => (
        <polygon key={value} points={ring(value)} fill="none" stroke="#26262c" strokeWidth="1" />
      ))}
      {DNA_AXES.map((axis, index) => {
        const [x, y] = point(index, 100).split(",").map(Number);
        return (
          <g key={axis.id}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="#26262c" strokeWidth="1" />
            <text
              x={center + (x - center) * 1.18}
              y={center + (y - center) * 1.18 + 3}
              textAnchor="middle"
              fontSize="9"
              fill="#9a9aa0"
              fontFamily="ui-monospace, monospace"
            >
              {axis.kanji}
            </text>
          </g>
        );
      })}
      <polygon points={profile} fill="rgba(226,58,46,0.22)" stroke="#e23a2e" strokeWidth="1.6" className="dna-in" />
      {DNA_AXES.map((axis, index) => {
        const [x, y] = point(index, dna[axis.id]).split(",").map(Number);
        return <circle key={axis.id} cx={x} cy={y} r="2.4" fill="#e23a2e" />;
      })}
    </svg>
  );
}

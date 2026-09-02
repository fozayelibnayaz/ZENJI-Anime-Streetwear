import { products, type Product } from "@/content/products";

/**
 * THE COUNTER — haggle with KAGE, the shopkeeper.
 *
 * Pure, seeded, testable game logic. Every day KAGE puts three pieces "under
 * the counter" and opens with a price. You work it down with four moves —
 * flatter, bluff, cash, or walk — while his mood slides. Nothing random at
 * runtime: the whole deal derives from (day, slug, round) seeds, so tests and
 * shoppers see the same KAGE.
 */

export type CounterMove = "flatter" | "bluff" | "cash" | "walk";

export const MOVES: { id: CounterMove; label: string; hint: string }[] = [
  { id: "flatter", label: "Flatter", hint: "Compliment the stitching. Warms him up, small cuts." },
  { id: "bluff", label: "Bluff", hint: "“Croft had it cheaper.” Big cuts — if he believes you." },
  { id: "cash", label: "Cash", hint: "“Full notes, now.” Steady cuts, and near the floor he signs." },
  { id: "walk", label: "Walk", hint: "Head for the door. He might call you back with a real price." },
];

export interface DealState {
  slug: string;
  name: string;
  ask: number;
  floor: number;
  price: number;
  mood: number; // 0..100 — KAGE's warmth
  rounds: number;
  maxRounds: number;
  uses: Record<CounterMove, number>;
  seed: number;
  done: boolean;
  walked: boolean;
  calledBack: boolean;
  line: string;
  history: { move: CounterMove | "open" | "shake"; line: string; price: number }[];
}

/* ---------------- seeded rng ---------------- */

export function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry(seed: number): number {
  let t = (seed + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/* ---------------- daily stock ---------------- */

export function dailyItems(day: string): Product[] {
  const seed = hash(`counter:${day}`);
  const pool = [...products];
  const picked: Product[] = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const at = Math.floor(mulberry(seed + i * 97) * pool.length);
    picked.push(pool.splice(at, 1)[0]);
  }
  return picked;
}

/* ---------------- the deal ---------------- */

export function openDeal(product: Product, day: string, levelIndex: number): DealState {
  const seed = hash(`deal:${day}:${product.slug}`);
  const ask = product.price;
  const floor = Math.round((product.price * 82) / 100);
  const maxRounds = 4 + (levelIndex >= 2 ? 1 : 0);
  const line = OPEN_LINES[seed % OPEN_LINES.length];
  return {
    slug: product.slug,
    name: product.name,
    ask,
    floor,
    price: ask,
    mood: 45 + Math.floor(mulberry(seed + 1) * 20),
    rounds: 0,
    maxRounds,
    uses: { flatter: 0, bluff: 0, cash: 0, walk: 0 },
    seed,
    done: false,
    walked: false,
    calledBack: false,
    line,
    history: [{ move: "open", line, price: ask }],
  };
}

export function applyMove(state: DealState, move: CounterMove): DealState {
  if (state.done) return state;
  const seed = state.seed + state.rounds * 131 + hash(move);
  const roll = mulberry(seed);
  const span = state.ask - state.floor;
  const dim = 1 / (1 + state.uses[move] * 0.6);

  let price = state.price;
  let mood = state.mood;
  let done: boolean = state.done;
  let walked: boolean = state.walked;
  let calledBack: boolean = state.calledBack;
  let line = "";

  if (move === "flatter") {
    mood = Math.min(100, mood + 12);
    price -= span * 0.1 * dim * (0.7 + roll * 0.6);
    line = FLATTER[mood > 70 ? 2 : mood > 50 ? 1 : 0];
  } else if (move === "bluff") {
    if (roll < 0.62 + mood / 400) {
      price -= span * 0.17 * dim;
      mood = Math.max(0, mood - 5);
      line = BLUFF_YES[Math.floor(roll * BLUFF_YES.length) % BLUFF_YES.length];
    } else {
      price -= span * 0.04 * dim;
      mood = Math.max(0, mood - 14);
      line = BLUFF_NO[Math.floor(roll * BLUFF_NO.length) % BLUFF_NO.length];
    }
  } else if (move === "cash") {
    mood = Math.min(100, mood + 4);
    price -= span * 0.08 * dim;
    if (price - state.floor < span * 0.14) {
      done = true;
      line = CASH_CLOSE[mood > 55 ? 1 : 0];
    } else {
      line = CASH[mood > 60 ? 1 : 0];
    }
  } else {
    // walk — the big swing
    if (roll < 0.35 + mood / 300) {
      calledBack = true;
      price -= span * 0.22;
      mood = Math.min(100, mood + 8);
      line = WALK_BACK[Math.floor(roll * WALK_BACK.length) % WALK_BACK.length];
    } else {
      done = true;
      walked = true;
      line = WALK_GONE[Math.floor(roll * WALK_GONE.length) % WALK_GONE.length];
    }
  }

  price = Math.max(state.floor, Math.round(price));
  const rounds = state.rounds + 1;
  if (!done && rounds >= state.maxRounds) {
    done = true;
    line = `${line} Last offer's on the counter.`;
  }

  return {
    ...state,
    price,
    mood,
    rounds,
    done,
    walked,
    calledBack,
    uses: { ...state.uses, [move]: state.uses[move] + 1 },
    line,
    history: [...state.history, { move, line, price }],
  };
}

/** Shake on the current price — closes the deal. */
export function shake(state: DealState): DealState {
  if (state.walked) return state;
  return { ...state, done: true, line: SHAKE_LINES[state.mood > 60 ? 1 : 0], history: [...state.history, { move: "shake", line: "Shaken.", price: state.price }] };
}

export function discountPct(state: DealState): number {
  return Math.round(((state.ask - state.price) / state.ask) * 100);
}

export function credFor(state: DealState): number {
  if (state.walked) return 2;
  return 5 + discountPct(state);
}

/* ---------------- KAGE's mouth ---------------- */

const OPEN_LINES = [
  "That one? Straight off the press table. Price is on the tag.",
  "Good eye. Last metre of that fabric, so the tag's the tag.",
  "Careful — that piece has a queue. Tag price, take it or leave it.",
];
const FLATTER = [
  "Hm. Flattery doesn't move prices. …A little, maybe.",
  "The stitching IS double-lock. Alright, a token cut.",
  "Ha! You know your seams. Fine — a proper cut.",
];
const BLUFF_YES = [
  "Croft? CROFT? …Fine. But you never saw my price.",
  "If Croft had it cheaper, why are you here? …Still. A cut.",
];
const BLUFF_NO = [
  "Croft sells seconds. I don't. Don't insult the rail.",
  "I've run this counter nineteen years. Nice try.",
];
const CASH = ["Notes, now? Everyone's on a card these days. Small cut.", "Cash still talks. A little."];
const CASH_CLOSE = ["…Done. Count it at the till.", "Fine, fine — cash wins. Shake."];
const WALK_BACK = ["OI— oi. Alright, back here. Real price, just for you.", "…Door's heavy, isn't it. Come back. Better number."];
const WALK_GONE = ["Walk then. The tag stays the tag.", "See you at Croft's, eh."];
const SHAKE_LINES = ["Shaken. It's yours — treat it right.", "Shaken. Good deal. Don't tell Croft."];

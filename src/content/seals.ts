/** Seal test — the four-pair kanji match that unlocks early access on Drop Day. */

export interface Seal {
  kanji: string;
  romaji: string;
  meaning: string;
}

export const seals: Seal[] = [
  { kanji: "力", romaji: "chikara", meaning: "Strength" },
  { kanji: "影", romaji: "kage", meaning: "Shadow" },
  { kanji: "炎", romaji: "honō", meaning: "Flame" },
  { kanji: "道", romaji: "michi", meaning: "The way" },
  { kanji: "魂", romaji: "tamashii", meaning: "Spirit" },
  { kanji: "無限", romaji: "mugen", meaning: "Limitless" },
];

/** Deterministic pick so server and client render the same board before hydration. */
export function sealRound(seed: number, count = 4): Seal[] {
  const pool = [...seals];
  const picked: Seal[] = [];
  let cursor = Math.abs(Math.floor(seed));
  while (picked.length < count && pool.length) {
    cursor = (cursor * 1103515245 + 12345) % 2147483648;
    const index = cursor % pool.length;
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

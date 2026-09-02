/**
 * THE_ORIGIN — the brand story told as a vertical manga.
 * Each panel is a scroll beat. Keep the copy short; the panel does the work.
 */

export interface OriginPanel {
  id: string;
  chapter: string;
  kanji: string;
  heading: string;
  body: string;
  /** Optional artwork; panels without one render as a type-only beat. */
  image?: string;
  alt?: string;
  /** Visual treatment of the panel, kept declarative so the renderer stays dumb. */
  tone: "ink" | "bone" | "oxide";
}

export const originPanels: OriginPanel[] = [
  {
    id: "p1",
    chapter: "01",
    kanji: "始",
    heading: "It started with a bad screen print",
    body: "2023. A borrowed press in a Brunswick garage, four tees, three of them ruined. The fourth one is framed in the studio.",
    image: "/media/origin/panel-01.webp",
    alt: "Ink-heavy manga style panel of a screen printing press in a dark garage",
    tone: "ink",
  },
  {
    id: "p2",
    chapter: "02",
    kanji: "問",
    heading: "Why does anime merch look like merch?",
    body: "Everything on the market was a licensed character slapped on a blank. Nothing was made for someone who watches the show and then has to catch the 86 tram to work.",
    tone: "bone",
  },
  {
    id: "p3",
    chapter: "03",
    kanji: "画",
    heading: "Every graphic is drawn, not sourced",
    body: "No stock art, no generated art, no bootlegs. Original characters and original symbols, inked by hand and separated for print in-house.",
    image: "/media/origin/panel-02.webp",
    alt: "Close up of a hand inking an original anime character illustration on paper",
    tone: "ink",
  },
  {
    id: "p4",
    chapter: "04",
    kanji: "限",
    heading: "Limited means limited",
    body: "Runs are capped at what we can print in a weekend. When a size is gone it does not come back — the next chapter gets a new graphic instead.",
    tone: "oxide",
  },
  {
    id: "p5",
    chapter: "05",
    kanji: "街",
    heading: "Built for a Melbourne winter",
    body: "240gsm bodies that survive a summer at Fed Square, 480gsm fleece that survives everything else. Printed, packed and posted from Fitzroy.",
    image: "/media/origin/panel-03.webp",
    alt: "Melbourne laneway at night with streetwear figures walking away from camera",
    tone: "ink",
  },
  {
    id: "p6",
    chapter: "06",
    kanji: "力",
    heading: "Wear your story",
    body: "You are not buying a character. You are buying the part of the story you are currently in.",
    tone: "bone",
  },
];

export const manifesto = [
  {
    n: "01",
    title: "Original art only",
    body: "Every mark on every garment is drawn by our own artists. If we cannot draw it, we do not sell it.",
  },
  {
    n: "02",
    title: "Weight over hype",
    body: "240gsm minimum on tees, 480gsm on fleece. A drop is only limited if the garment is worth chasing.",
  },
  {
    n: "03",
    title: "Made close to home",
    body: "Printed and packed in Naarm / Melbourne. Blanks are ethically sourced and we publish the mill.",
  },
  {
    n: "04",
    title: "Say the real number",
    body: "Prices in AUD, tax in, no fake countdown discounts. Every measurement on this site is off the actual pattern.",
  },
];

export interface FaqEntry {
  id: string;
  topic: "Sizing" | "Shipping" | "Returns" | "Drops" | "Care";
  question: string;
  answer: string;
}

export const faqs: FaqEntry[] = [
  {
    id: "faq-fit",
    topic: "Sizing",
    question: "Everything is oversized — what size do I actually take?",
    answer:
      "Take your usual size for a boxy fit with a dropped shoulder, or size down one if you want it to sit closer. If you would rather not guess, the Fit Lab compares a tee you already own against our pattern and gives you a number in about twenty seconds.",
  },
  {
    id: "faq-measure",
    topic: "Sizing",
    question: "How do I measure a garment properly?",
    answer:
      "Lay it flat, smooth out the wrinkles, and measure straight across from armpit to armpit — that is the chest number. Then measure from the highest point of the shoulder down to the hem for length. Do not measure around your body; garment-flat numbers are what our chart uses.",
  },
  {
    id: "faq-between",
    topic: "Sizing",
    question: "I am between sizes. Up or down?",
    answer:
      "Up, almost always. Our bodies are cut boxy, so the extra centimetres land in the width rather than the length and the silhouette still reads correctly.",
  },
  {
    id: "faq-ship-speed",
    topic: "Shipping",
    question: "How fast is delivery inside Australia?",
    answer:
      "Melbourne metro is usually next business day. Sydney, Brisbane and Adelaide land in two to four, Perth, Hobart and Darwin in three to six. Everything is tracked and posted from Fitzroy before 2pm AEST on weekdays.",
  },
  {
    id: "faq-ship-free",
    topic: "Shipping",
    question: "Is shipping free?",
    answer:
      "Free Australia-wide on orders over A$100. Under that it is A$9.95 to the east coast and A$12.95 elsewhere. New Zealand is a A$24.95 flat rate.",
  },
  {
    id: "faq-returns",
    topic: "Returns",
    question: "What if the fit is wrong?",
    answer:
      "Thirty days for an exchange or store credit on unworn pieces with the tag still on. First exchange inside Australia is on us — we send a return label, you send it back in the same satchel.",
  },
  {
    id: "faq-drop-when",
    topic: "Drops",
    question: "When is the next drop?",
    answer:
      "Fortnightly on a Friday at 7:00pm AEST. The Drop Day console counts it down in your own timezone and holds early access for anyone who cleared the seal test.",
  },
  {
    id: "faq-restock",
    topic: "Drops",
    question: "Do sold out sizes come back?",
    answer:
      "No. A run is capped at what the studio can print over a weekend. Sold out stays sold out — the next chapter gets a new graphic instead.",
  },
  {
    id: "faq-care-print",
    topic: "Care",
    question: "How do I keep the print from cracking?",
    answer:
      "Cold wash inside out, skip the dryer, and iron on the reverse only. Our inks are water-based and cure into the fibre, so treated properly the graphic outlives the collar.",
  },
];

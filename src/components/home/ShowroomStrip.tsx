import Link from "next/link";

/**
 * SHOWROOM UPDATE strip — the five new rooms of the store, one scroll deep.
 */
const ROOMS = [
  {
    href: "/shrine",
    kanji: "御籤",
    title: "The Shrine",
    note: "Shake the cylinder — one omikuji a day, and a seal code for your loadout.",
  },
  {
    href: "/studio",
    kanji: "室",
    title: "Card Studio",
    note: "Direct your own editorial: backdrop, piece, seal, caption — export the PNG.",
  },
  {
    href: "/closet",
    kanji: "rail",
    title: "Closet Arcade",
    note: "The rail is physical now. Flick hangers, stack looks, save slots, earn cred.",
  },
  {
    href: "/fit-lab",
    kanji: "dna",
    title: "Fit DNA",
    note: "Five instincts, one pentagon. Match % follows you across the store.",
  },
  {
    href: "/drop",
    kanji: "案内",
    title: "The Floorwalker",
    note: "Ring the bell and KIRA pulls three pieces for your taste — or don't.",
  },
  {
    href: "/arcade",
    kanji: "駒",
    title: "KOMA + Slash",
    note: "Dress the street cat in any print, then slice drop crates for combos.",
  },
  {
    href: "/arcade",
    kanji: "対",
    title: "The Versus",
    note: "Two looks enter the ring. Crowning one teaches the clerk your taste.",
  },
  {
    href: "/arcade",
    kanji: "壁",
    title: "The Wall",
    note: "The studio's unpaintable wall — spray it, stamp it, export it.",
  },
];

export function ShowroomStrip() {
  return (
    <section aria-labelledby="showroom-heading" className="border-t border-bone/10">
      <div className="shell py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">Update_003 // the showroom opens</p>
            <h2 id="showroom-heading" className="display mt-3 text-4xl sm:text-6xl">
              Five new rooms
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-steel">
            Everything a real showroom does — a clerk, a shrine, a mirror, a rail you can flick — rebuilt static,
            stored on your device, sent nowhere.
          </p>
        </div>

        <ul className="mt-10 grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-2 lg:grid-cols-4">
          {ROOMS.map((room, index) => (
            <li key={room.href + room.title} className="group bg-sumi">
              <Link href={room.href} className="flex h-full flex-col p-5 transition-colors hover:bg-ink">
                <p className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel">
                  {String(index + 1).padStart(2, "0")}
                  <span className="jp text-base text-oxide transition-transform duration-300 group-hover:-translate-y-0.5">
                    {room.kanji}
                  </span>
                </p>
                <p className="display mt-6 text-xl">{room.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-steel">{room.note}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

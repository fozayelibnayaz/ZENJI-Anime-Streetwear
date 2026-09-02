/**
 * THE ARCADE — copy for KOMA, the slash game, the versus room and the wall.
 * Original characters only: the label's rule #01 applies to mascots too.
 */

export const koma = {
  name: "KOMA",
  species: "street cat // 駒",
  idle: [
    "The rail creaks. Good sign — means people are touching things.",
    "I nap on the hoodies. Quality control.",
    "If the print cracks in the wash, it was never ours.",
    "Melbourne weather again. Reach for the fleece.",
    "Slice straight, slice kind.",
  ],
  cheer: [
    "Clean cut! The crate never saw it.",
    "Combo! The council will hear about this.",
    "That is exactly how I open my tuna cans.",
  ],
  sulk: [
    "A bootleg crate. We do not slice those — we report them.",
    "Careful. Counterfeit cuts dull the blade.",
  ],
  dressed: (name: string) => `Hmph. I look dangerous in the ${name}. Dangerous and soft.`,
} as const;

export const slashGame = {
  title: "SLASH THE DROP",
  brief:
    "Drop crates launch from the alley floor. Cut them open with your blade before they fall — chain slices for combos. Bootleg crates wear the wrong seal: slicing one dulls your combo to zero. Forty-five seconds on the clock.",
  rewards: "Score becomes street cred (÷5). Beat your high score and KOMA bows.",
} as const;

export const versus = {
  title: "THE VERSUS",
  brief:
    "Two looks enter the ring, the street votes. Your pick is remembered — the Floorwalker quietly starts pulling pieces like the ones you crown.",
  judge: (winner: string, share: number) =>
    `The street says ${winner} — ${share}% of the crowd. I was told to agree.`,
} as const;

export const tagWall = {
  title: "THE WALL",
  brief:
    "Every studio has one wall nobody repaints. Hold to spray, tap a stencil to stamp it, pick your ink. Export a photo of your wall before someone tags over it.",
} as const;

export const arcadeStickers = ["禅", "力", "炎", "鬼", "浪", "墨", "Z", "04"] as const;

export const arcadeInks = [
  { id: "oxide", label: "Oxide", value: "#e23a2e" },
  { id: "cobalt", label: "Cobalt", value: "#1f4fd8" },
  { id: "bone", label: "Bone", value: "#f2f2f0" },
  { id: "gold", label: "Kanari", value: "#e8b53a" },
] as const;

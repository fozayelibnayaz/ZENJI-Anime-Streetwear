/** Lookbook: editorial imagery with shoppable hotspots. */

export interface LookHotspot {
  /** Percentage coordinates over the image, so pins stay put at any size. */
  x: number;
  y: number;
  slug: string;
  note: string;
}

export interface Look {
  id: string;
  title: string;
  location: string;
  time: string;
  image: string;
  alt: string;
  caption: string;
  hotspots: LookHotspot[];
}

export const looks: Look[] = [
  {
    id: "look-01",
    title: "First Light",
    location: "Rose Street, Fitzroy VIC",
    time: "06:14 AEST",
    image: "/media/lookbook/look-01.webp",
    alt: "Model in an oversized black anime graphic tee standing in a Fitzroy laneway at dawn",
    caption:
      "Shot before the coffee queues. Blue Flame Tee worn a size up, cargo hem cinched, nothing else.",
    hotspots: [
      { x: 48, y: 40, slug: "blue-flame-tee", note: "Blue Flame Tee, size L" },
      { x: 52, y: 74, slug: "shadow-cargo-pant", note: "Shadow Cargo Pant" },
    ],
  },
  {
    id: "look-02",
    title: "Tram Stop 12",
    location: "Smith Street, Collingwood VIC",
    time: "18:52 AEST",
    image: "/media/lookbook/look-02.webp",
    alt: "Two people in heavyweight black hoodies waiting at a Melbourne tram stop at dusk",
    caption:
      "Ronin Hoodie over the Bushido Tee. The whole point of a 480gsm fleece is the fifteen minutes you spend outside.",
    hotspots: [
      { x: 36, y: 46, slug: "ronin-heavyweight-hoodie", note: "Ronin Heavyweight Hoodie" },
      { x: 66, y: 52, slug: "bushido-tee", note: "Bushido Tee" },
    ],
  },
  {
    id: "look-03",
    title: "Night Market",
    location: "Chinatown, Melbourne CBD",
    time: "21:30 AEST",
    image: "/media/lookbook/look-03.webp",
    alt: "Streetwear model in a bone coloured graphic tee under neon signage in Melbourne Chinatown",
    caption:
      "Will Of The Sun is the only bone body we make. It photographs badly under neon and looks incredible in person.",
    hotspots: [
      { x: 50, y: 42, slug: "will-of-the-sun-tee", note: "Will Of The Sun Tee" },
      { x: 44, y: 22, slug: "seal-cap", note: "Seal Cap" },
    ],
  },
];

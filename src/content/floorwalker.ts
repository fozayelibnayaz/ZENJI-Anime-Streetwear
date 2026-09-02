/**
 * THE FLOORWALKER — persona copy for the opt-in showroom clerk.
 *
 * Everything the clerk says lives here so the voice can be rewritten without
 * touching the component. The clerk never speaks first for longer than one
 * dismissible bubble: this is a showroom, not a pop-up.
 */

export const clerk = {
  name: "KIRA",
  role: "floorwalker // 案内人",
  bubble: "Need a hand reading the rack?",
  greeting: "Evening. I keep the floor — tell me what you're chasing and I'll pull three pieces.",
  greetingBack: "Back again. I remembered your taste — shall I pull something new?",
  decline: "No worries. The bell's on the wall if you change your mind.",
  closing: "Anything else? …Take your time. The rail isn't going anywhere.",
  counterTip: "Want it cheaper? KAGE keeps the counter out back — mind your manners.",
  thanks: "Good eye. I'll hang it in your loadout.",
} as const;

export interface ClerkStep {
  id: "vibe" | "climate" | "budget";
  ask: string;
  options: { value: string; label: string }[];
}

export const clerkSteps: ClerkStep[] = [
  {
    id: "vibe",
    ask: "First — what's the energy?",
    options: [
      { value: "loud", label: "Loud. Read it from the tram." },
      { value: "dark", label: "Dark. Swallow the light." },
      { value: "quiet", label: "Quiet. Seals only." },
    ],
  },
  {
    id: "climate",
    ask: "And what is Melbourne doing to you this week?",
    options: [
      { value: "hot", label: "Scorcher — tee weather" },
      { value: "cold", label: "Cold — fleece weather" },
      { value: "rain", label: "Drizzle — layer weather" },
    ],
  },
  {
    id: "budget",
    ask: "Last one. What should I keep the pull under?",
    options: [
      { value: "under40", label: "Under A$40" },
      { value: "under120", label: "Under A$120" },
      { value: "any", label: "Surprise me" },
    ],
  },
];

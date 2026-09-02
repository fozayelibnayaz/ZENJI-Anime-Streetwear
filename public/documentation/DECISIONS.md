# Design and engineering decisions

Short notes on the choices that shaped this build, and the things deliberately left out.

## Who the site is for

The buyer for an Australian anime-streetwear label is 16–28, metro (Melbourne, Sydney, Brisbane),
arrives from an Instagram or TikTok link **on a phone, at night**, and spends A$40–110 on oversized
240–300gsm pieces sold in drops rather than seasons. Two objections stop the sale:

1. *"Oversized" means nothing — will it actually fit me?*
2. *Is this a real local label, and when does it arrive?*

Both are frontend problems, and the two biggest features on the site (**Fit Lab**, **Drop Day**)
exist to answer them. Everything else is in service of getting out of the way.

## Art direction: `SYSTEM // ZENJI`

Sumi black, bone, steel, and a single oxide red used only for calls to action, live states and sale
prices. Manga print language — halftone dots, hairline rules, paper grain, ink wipes — instead of the
purple-and-cyan neon cyberpunk that every anime template defaults to. Restraint is the differentiator:
the category is loud, so the shop is quiet and the garments are loud.

One motion idea, applied everywhere: **the slash**. Sections cut in on a diagonal `clip-path`, the
hero is a cut you drag, the 404 says the page "was cut". A single consistent idea reads as designed;
five different animation styles read as assembled.

## Why no animation library

Framer Motion is ~35KB gzipped before you animate anything, and most of this site's motion is
`clip-path` and `opacity` driven by scroll position. Four small hooks (`useInView`,
`useScrollProgress`, `useScrollVelocity`, `usePointerSlash`) cover every effect here, cost almost
nothing, and keep the hero at 60fps on a mid-range Android because the pointer position is written to
a ref and flushed on `requestAnimationFrame` rather than through React state at 120Hz.

## Why the filters live in the URL

Shoppers share links, use the back button, and open things in new tabs. Keeping filter state in
`useSearchParams` means all three work for free, and it lets the Fit Lab hand off to
`/drop?size=L` without any cross-component plumbing.

## Why the size problem got the biggest feature

Returns in oversized streetwear are overwhelmingly a fit problem, and a static size chart does not
fix it because nobody knows what 57cm across the chest feels like. Comparing to a garment already in
the wardrobe converts an abstract number into a known object. The algorithm is deliberately simple
and pure (`src/lib/fit.ts`): weighted distance across chest and length, chest weighted about twice as
heavily because that is what determines whether a boxy cut reads correctly. Being pure makes it
testable, and it is the most heavily tested code in the repo.

## State: three contexts, no store library

`LoadoutProvider` (cart), `PreferencesProvider` (size, units, motion, saved items, early access) and
`UIProvider` (overlays and toasts). Persistence goes through a `useSyncExternalStore`-backed helper
rather than an effect that copies `localStorage` into state — which means no hydration mismatch, no
cascading render on mount, and two tabs stay in sync.

## Honesty as a UX principle

There is no backend, so the site never pretends otherwise. Checkout, the newsletter and the contact
form all validate properly and then say plainly that nothing was sent. The live stock board is
labelled as a simulated feed. Stock messaging ("Only 2 left in S", "Sold out — no restock") is driven
by the real numbers in the catalogue rather than by invented urgency.

## Things deliberately not built

| Idea | Why not |
|---|---|
| Device-sniffing "we noticed you're on mobile" UI | The layout should adapt without announcing it. Responsive design already is the feature |
| 3D t-shirt configurator | Heavy, slow on mid-range phones, and nobody buys a tee because they rotated it |
| AI chat assistant | Answers a question the FAQ already answers, worse and slower |
| Particle / cursor-trail backgrounds | Reads as a template. Costs frames, adds nothing |
| Infinite scroll on the collection | Fifteen pieces. A grid is faster and keeps the footer reachable |
| Dark/light toggle | The brand is one colour scheme. A "light mode" would be a different label |

## Performance budget

Static export, self-hosted subset fonts, AVIF/WebP art with explicit dimensions, `priority` on the
hero only, `content-visibility` on long sections, and overlays that mount on first use. The
production build keeps first-load JS well inside the ~110KB target and the largest page ships one
LCP image that is preloaded.

## Known limitations

- Product photography is art-directed placeholder imagery made for this concept, not a real shoot.
- Playwright browsers could not be downloaded in the authoring sandbox, so the e2e suite is written
  and configured but was last executed locally / in CI rather than here. Unit tests, lint, types and
  the production build all run clean.
- The stock board and release queue are simulations, by design and by label.

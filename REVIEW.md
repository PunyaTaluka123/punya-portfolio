# Fresh-eyes review (gate 12)

One subagent with no earlier context reviewed the repo read-only against the full brief. Its findings and their status are below.

- [x] H1: `/llm` failed axe contrast in dark mode (the page background was transparent). Fixed: explicit `light-dark()` colours for the background, text and links in `llm.astro`.
- [x] M1: A focused project card could hide under the sticky stack. Fixed: `.card:focus-within { z-index: 1 }`.
- [x] M2: Every card title had a view-transition name, so the titles overlapped mid-transition. Fixed: on `pageswap`, `main.ts` names only the clicked card's title.
- [x] M3: Literal sizes, spacing and times sat outside the tokens. Fixed: all of them now live in `tokens.css`. `theme-color` is read from `tokens.css` through `src/lib/tokens.ts`.
- [x] M4: A stray `astro preview` could shadow the verify server. Fixed: the server tags its responses, refuses to run if another server answers on the port, and handles errors. I stopped the stray process.
- [x] L1: Copy as Markdown needed to work in Safari. Fixed: `ClipboardItem` with a promise.
- [x] L2: In the LLM view, the glance h2 came before the page's h1. Fixed: the glance title is no longer a heading, and the section uses `aria-label`.
- [x] L3: "Most of them are about computer vision" was unsupported. Reworded to "My focus is computer vision".
- [ ] L4: The owner needs to confirm that the BiogasBoosters 33% is a target. That is a question for the owner, not a code fix.
- [x] L5: Project pages repeated their one-liner. Removed the duplicate body sentences and "What" rows.
- [x] Nits fixed:
  - removed the border-colour transition
  - more links get the draw-in underline
  - the hero h1 text is no longer duplicated
  - the mark link's accessible name now includes "PT" (label in name)
  - fixed the home-page detection in `Base.astro`
  - experience order in the LLM view: heading, then date
  - the contact email wraps less
  - theme-color follows a manual theme toggle
  - `boot.js` is hashed
  - removed the unused `@fontsource` dependencies
  - Markdown files are now formatted by Prettier
  - gates 6, 7 and 9 are stricter
- [ ] Re-run the full `npm run verify` after these fixes. Only gates 1–4 have been re-run. Also update FACT_AUDIT.md for the reworded lines (the about lead; the project "My part" and "Area" rows) and fix doc errors D2, D3 and D5 in DECISIONS.md.

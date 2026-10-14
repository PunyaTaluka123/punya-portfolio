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
- [x] L4: Is the BiogasBoosters 33% a target? Resolved in the copy: the rules require stating 33%, and the site frames it only as a target for the planned 2027 deployment (DECISIONS D6). The final report asks the owner to confirm it.
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
- [x] Follow-ups done: updated FACT_AUDIT.md rows 13, 31, 38 and 39 for the reworded lines; fixed DECISIONS D2, D3 and D5 and the README path for `boot.js`.
- [x] Found while re-running (the user spotted it): gate 7 called `curl` with `spawnSync`. That froze the event loop of the process hosting the test server, so curl could never get an answer and the run hung. It had only "passed" before because the stray preview server answered instead. Fixed: gate 7 uses async `execFile` with `--max-time 20`, and every gate now has a 20-minute timeout, so a future hang prints a FAIL line instead of going silent.

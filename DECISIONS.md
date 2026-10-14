# Decisions

Each entry gives the choice and the reason. I worked alone and asked no questions, as the brief said.

## D1. Design direction: "Signal": a type-led page over a live feature map

I combined three ideas, the maximum allowed:

1. **Oversized display type as the hero, framed by monospace rails** (from Samuel Goddard).
   The name fills the first screen. Small monospace metadata lines sit above and below, reading like log output: `NTU SINGAPORE / DSAI / YEAR 1`. That gives extreme contrast in type size at no image or WebGL cost.
2. **A dot-matrix canvas field behind the hero** (from Nahiyan Khan's dot texture). I re-read it as a CNN feature map: a grid of dots whose size and opacity follow a slow drifting field. It points at computer vision without a stock "neural network" illustration. It is drawn in about 2 KB of JS, starts after load, and pauses when the tab is hidden or the hero leaves the screen. I did **not** take the CRT intro: it hides content behind JS.
3. **An asymmetric sticky structure with a progress marker** (from Brittany Chiang's sticky column and line markers). Section labels sit in a narrow left column. The projects use a sticky stack: each card pins and the next one slides over it, while a progress bar and a `01 / 03` counter track the stack.

I rejected WebGL scenes (Bruno Simon, Houmahani, Gil Huybrecht). In my captures they showed nothing without a GPU, and one crashed. That fails the no-JS and LLM gates.

A small motif ties this together, and it is my own idea rather than a fourth reference: on hover or focus, project cards draw **detection-box corner brackets**, as in object detection.

## D2. Palette: warm paper and ink, one accent ("signal orange")
- Light: paper `#F3F0E8`, ink `#141311`, accent `#C2410C`.
- Dark: `#121110` / `#F3F0E8`, accent `#FF7A45`.
- Why: it avoids the purple-to-blue look and neon-on-black. Orange recalls detection-box overlays, and one accent carries the whole page (the lesson from Rauno).
- I checked contrast for text pairs at 4.5:1 or more (see `tokens.css` comments and the axe gate).

## D3. Fonts
- Display: **Bricolage Grotesque** (variable, OFL), with its optical-size axis at full display size. Body: **Instrument Sans** (variable, OFL). Both are self-hosted from the `@fontsource-variable` npm packages, which the build bundles into `/_astro/`. Only the Latin subset is preloaded.
- Metadata labels use the system monospace stack (`ui-monospace`, SF Mono, Menlo, Consolas). That is a fallback stack, not a third downloaded font.
- Why: they are not Inter, Roboto or Arial. Bricolage has character at 10 rem, and Instrument Sans stays easy to read at 1 rem.

## D4. Stack: Astro + TypeScript, static output, plain CSS, no animation library
- All motion uses CSS keyframes, CSS scroll-driven animations (`animation-timeline: view()`) and native cross-document View Transitions (`@view-transition { navigation: auto }`). One small module script handles the toggles, the canvas and the cursor.
- Why: it ships close to zero JS (the budget is 120 KB, and this uses about 6 KB). Content is in the HTML at load. Browsers without scroll-driven animations or View Transitions get plain static content and plain navigation, which is the required fallback.
- I did not use Astro's `<ClientRouter />`: native cross-document View Transitions do the same job without a JS router.

## D5. Pre-paint script is external, not inline
- Theme and view (human or LLM) must be applied before first paint, so there is no flash. I use one tiny render-blocking external script, `/boot.js`, so the CSP can be `script-src 'self'` with no `'unsafe-inline'` and no hashes to keep in sync.
- Cost: one extra request. It is fetched in parallel with the CSS, so it adds almost no latency.

## D6. BiogasBoosters wording versus gate 11
- The rules say to "State deployment in 2027, 33% increase". Gate 11 says "BiogasBoosters has no result claims".
- Today is 2026-10-14, so a 2027 deployment hasn't happened yet. I state both numbers as a **plan and a target**: "Deployment is planned for 2027. The target is a 33% increase in biogas production." That states the facts the rule asks for without claiming a result. The fact audit checks for words like "achieved", "increased" and "resulted".

## D7. Extra detail from GitHub
- The facts allow scraping GitHub. The public `BiogasBoosters` repo shows a reinforcement learning setup: a simulated digester environment, a PPO agent with an LSTM feature extractor, a Kalman filter for noisy readings, and an XGBoost baseline. I use that one paragraph and cite the repo files in FACT_AUDIT.md.
- No public repos exist for the Basketball Shot Tracker or DermaTrack, so their pages stay close to the facts and add no invented results.
- I left the `OncoGuard` repo out, as the brief requires.
- I did not scrape LinkedIn. It blocks bots (it returns 999), and the facts are enough.

## D8. Site URL
- The domain is not bought yet. `astro.config.mjs` reads `SITE_URL` from the environment and defaults to `http://localhost:4321`. Canonical URLs, Open Graph, the sitemap, `llms.txt` and JSON-LD all use it. The README shows how to set it on Vercel.

## D9. Gate tooling
- `npm run verify` is one Node script, `scripts/verify.mjs`, that runs the 12 gates in order. It uses Playwright Chromium for axe, the motion test, screenshots and the LLM view test. It runs Lighthouse from its Node API against the same Chromium.
- Gates 9, 11 and 12 need human judgement (visual review, fact audit, fresh-eyes review). For each, the script runs the automated part: overflow detection plus screenshots, banned-word and claim checks, and a check that the review file exists with no open items. The judgement itself is recorded in VISUAL_REVIEW.md, FACT_AUDIT.md and REVIEW.md.

## D10. No "Learn by Doing" pauses
- The session style asks for user code contributions. The brief says "Work alone. Do not ask me questions", so I did not stop for contributions.

## D11. Fonts use `font-display: optional` with preload
- Both woff2 files (41 KB and 30 KB, Latin subset only) are preloaded. With `optional`, a slow first visit keeps the fallback font and never swaps mid-read. That keeps layout shift near zero (the gate needs CLS under 0.05). Repeat visits get the real font from cache.

## D12. CSS minifier is esbuild
- Vite's default CSS minifier folded `animation-timeline` into the `animation` shorthand. Browsers reject that, so every scroll-driven animation silently turned off. esbuild keeps the longhand. Found while debugging the progress marker.

## D13. Scroll reveals move, they don't fade
- Section reveals animate only `transform`: headings rise out of a clip mask, and rows slide up 2.5 rem. Opacity is never used for scroll reveals. A half-faded element would fail colour contrast in axe and Lighthouse wherever it sits at the edge of the viewport. Content also never depends on JS: without scroll-timeline support, everything is simply static.

## D14. Hero name size is tied to the indent
- The second line ("Taluka") is indented, so the type size is chosen per breakpoint (23vw, 19vw, min(17vw, 15rem)) so that indent plus word always fits the viewport. I found this at 768 px, where the name had been clipped.

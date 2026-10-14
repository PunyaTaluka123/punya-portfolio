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

- Light: paper `#F3F0E8`, ink `#141311`, accent `#B23A0A`. I darkened it from `#C2410C` so accent text reaches 4.5:1 on the card surface too.
- Dark: `#121110` / `#F3F0E8`, accent `#FF7A45`.
- Why: it avoids the purple-to-blue look and neon-on-black. Orange recalls detection-box overlays, and one accent carries the whole page (the lesson from Rauno).
- I checked contrast for text pairs at 4.5:1 or more (see `tokens.css` comments and the axe gate).

## D3. Fonts

- Display: **Bricolage Grotesque** (variable weight axis only, OFL). Body: **Instrument Sans** (variable weight, OFL). I copied the Latin-subset woff2 files once from the `@fontsource-variable` packages into `src/assets/fonts/`, with their licences. The packages are no longer dependencies. The build hashes the files into `/_astro/`, and both are preloaded. I used the weight-only file (41 KB) instead of the optical-size one (77 KB) to keep the page light.
- Metadata labels use the system monospace stack (`ui-monospace`, SF Mono, Menlo, Consolas). That is a fallback stack, not a third downloaded font.
- Why: they are not Inter, Roboto or Arial. Bricolage has character at 10 rem, and Instrument Sans stays easy to read at 1 rem.

## D4. Stack: Astro + TypeScript, static output, plain CSS, no animation library

- All motion uses CSS keyframes, CSS scroll-driven animations (`animation-timeline: view()`) and native cross-document View Transitions (`@view-transition { navigation: auto }`). One small module script handles the toggles, the canvas and the cursor.
- Why: it ships close to zero JS (the budget is 120 KB, and this uses about 6 KB). Content is in the HTML at load. Browsers without scroll-driven animations or View Transitions get plain static content and plain navigation, which is the required fallback.
- I did not use Astro's `<ClientRouter />`: native cross-document View Transitions do the same job without a JS router.

## D5. Pre-paint script is external, not inline

- Theme and view (human or LLM) must be applied before first paint, so there is no flash. I use one tiny render-blocking external script, `src/scripts/boot.js`, so the CSP can be `script-src 'self'` with no `'unsafe-inline'` and no hashes to keep in sync. It is imported with `?url`, so it ships as a hashed `/_astro/boot.*.js` file under the long immutable cache. It costs no revalidation round trip before first paint.
- Cost: one extra request. It is fetched in parallel with the CSS, so it adds almost no latency.

## D6. BiogasBoosters wording versus gate 11

- The rules say to "State deployment in 2027, 33% increase". Gate 11 says "BiogasBoosters has no result claims".
- My first version framed 33% as a target. On 2026-10-14 the owner confirmed in chat that **the 33% is already measured**. The site now says: "It has a measured 33% increase in biogas production. Deployment is planned for 2027." The spec list row reads "Result: Measured 33% increase in biogas production".
- Gate 11 still blocks any other result claim about BiogasBoosters (achieved, increased, improved, resulted, delivered, reduced, grew, saved). It allows the 33% only where it is labelled as measured, which is the one result the owner has confirmed.

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

## D15. No raster images on pages

- I have no photos or screenshots of the projects, and the rules ban stock illustrations and invented visuals. So the pages use type, the canvas field and CSS, and contain no `<img>`. The only raster files are the Open Graph image (PNG, 1200×630, 60 KB; social crawlers still handle PNG most reliably) and the icon set. If project screenshots are added later, use AVIF or WebP with `width`, `height` and `loading="lazy"` below the fold.

## D16. Lighthouse runs on indexable pages only

- Gate 6 runs on `/`, the three project pages and `/llm`. `/404` is deliberately `noindex`, so Lighthouse's SEO "is crawlable" audit would always mark it down. That is correct behaviour for a 404 page, not a defect. `/404` is still covered by axe (gate 5), the screenshots (gate 9) and the link check.

## D17. CI uses Node 24 and actions pinned to commit SHAs

- `verify.mjs` imports `src/data/site.ts` directly through Node's built-in TypeScript type stripping (Node 22.18 and newer), so it never duplicates content. The actions are pinned to full commit SHAs, with the version noted in a comment.

## D18. Details from the owner's resumes (2026-10-14)

- The owner shared 19 resume PDFs. Two are someone else's (Devarsh Bagla), so I did not use them. From the other 17 I added what was new and consistent across versions, mostly from the latest general resume (2026-09-29):
  - experience: titles and dates, the FRC camera-tracking routine, the KDK taxation-platform work, the coding-club grades
  - DermaTrack: model work and evaluation details
  - BiogasBoosters: architecture
  - DengueRadar: a new featured project
  - SAT, IB subjects, CERN Beamline for Schools, the IRIS details, skills, tools, work-pass eligibility, spoken languages
- **Left out on purpose:**
  - phone numbers and home addresses (the brief forbids them)
  - the IJSAT paper and the Harvard Stat 110 self-study (dropped from later resumes, or in only one tailored version)
  - the revenue model
- **Open question for the owner:** the resumes say BiogasBoosters "raised simulated methane yield 30% vs 12.5% for the XGBoost baseline". The site says "measured 33% increase in biogas production", as the owner confirmed in chat. Both can't be the headline number, so the site keeps the owner's 33% until told otherwise.
- DermaTrack keeps "designed" even though the resumes say "built", because the brief's rule is explicit.

## D19. Links that leave the page open in a new tab

- That covers external links (GitHub, LinkedIn, the project repo) and the machine-readable files (`/llm`, `llms.txt`, `portfolio.md`, `content.json`). Each has `target="_blank"`, `rel="noopener noreferrer"` and a visually hidden "(opens in a new tab)" for screen readers.
- In-page anchors (#about …), project pages and `mailto:` stay in the same tab. A section anchor in a new tab makes no sense, and cross-document View Transitions only run within one tab.

## D20. Experience as an orbit with comment boxes

- At 1000 px and wider, the roles sit on a dashed ring around "Experience", with each position computed with CSS `cos()`/`sin()`. Clicking a role opens its details as a comment box with an accent tail. Below 1000 px, a circle doesn't fit, so the roles become a vertical line with nodes, and the same boxes open below them.
- **No-JS mechanism:** the native Popover API (`popover` + `popovertarget`) gives toggling, Esc and click-outside closing, one box at a time and `aria-expanded`. CSS anchor positioning attaches the box to its title. Without anchor support the box appears centred, which still works.
- **Fit with the page:** it reuses the hairline rules, the mono metadata, the orange accent and the "detection label" look from the project cards, so it reads as part of the same system. The ring turns slowly (90 s per turn) and the titles fly out from the centre on scroll. The titles themselves stay still, because moving buttons are hard to click. All motion is off with reduced motion and in the LLM view.
- **Trade-off:** details now take a click, which slows a 30-second skim. To offset that, every title shows role, organisation and dates. The details are still in the HTML, and the LLM view, `/llm`, Markdown and JSON show everything inline.

## D21. Cursor ring jumped on links and cards

- The ring was positioned with `transform: translate3d(x, y)` and grown with the `scale` property. CSS applies `scale` on top of `transform`, so growing it to 1.9× also multiplied its position, and the ring flew away from the pointer. It is now positioned with the `translate` property, which composes correctly.

## D22. Glitch when going back to the project stack

- The page transition cross-faded the project page over the home page. For about 0.4 s both were visible on top of the sticky project stack. Fixes:
  - back/forward navigation skips the transition (it should feel instant)
  - link navigations use a short "fade out, then fade in" (a view-transition type)
  - a project title's temporary transition name is cleared when the page is restored from the back/forward cache

## D23. The experience orbit moves (owner request, 2026-10-14)

- **How it moves:** at 1000 px and wider the ring of roles turns slowly (one lap per 120 s, the `--m-orbit` token). Each role counter-rotates, so its text stays upright. Both are `rotate` animations, so they run on the compositor and never trigger layout.
- **When it stops:**
  - while any role is hovered or keyboard-focused, or its comment box is open
  - with reduced motion
  - in the LLM view
- **Accessibility:** moving content over 5 seconds needs a way to pause it (WCAG 2.2.2). Hover and focus pause it, and the reduced-motion setting turns it off.
- **Comment box side:** it picks above or below from where the role is on the ring when it opens (`beforetoggle` in `main.ts`), because roles no longer sit at fixed angles.
- **Selector guard:** a pseudo-element inside `:is()` silently invalidates the whole rule. I hit that twice, so gate 1 now fails on it.

## D24. "My part" rows removed (owner request)

- The project detail lists no longer have a "My part" row. DermaTrack still says "designed" in its one-liner and on its page.

## D25. The orbit brakes with a wobble; roles get an accent ring on hover (owner request)

- **Braking:** with JS, the orbit no longer stops dead. On hover, focus or an open box, `main.ts` drives the spin animations' `playbackRate` through a damped spring (1 → about −0.2 → 0 over about 1.2 s), so it drifts back a touch before settling. On leaving, it eases back to full speed. List and boxes share one rate, so the text stays upright. Without JS, the CSS hard stop remains as a fallback.
- **Hover ring:** an accent ring around the hovered, focused or open role, drawn with `opacity` and `scale` only.

## D26. Returning to the project stack (owner reported again)

- **Cause:** "← All projects" went to `/#projects`, and `scroll-behavior: smooth` on `html` made the browser smooth-scroll from the top of the page on arrival, racing past every section.
- **Fixes:**
  - Smooth scrolling now applies only for in-page link clicks (`html:focus-within`).
  - When the visitor came from the home page, "← All projects" calls `history.back()`. They land on the exact card they left, instantly, because back/forward skips the transition (D22).

## D27. The clicked card stayed raised after "back" (owner reported)

- **Cause:** clicking a card focuses its link, and the browser keeps that focus when you return. The rule `.card:focus-within { z-index: 1 }` (added so keyboard users never tab into a hidden card) then lifted that card above the cards that should stack over it.
- **Fix:** the raise, lift, outline and corner brackets now use `:has(:focus-visible)`. Focus left over from a mouse click doesn't count, but keyboard focus still raises the card. I tested both cases.

## D28. The experience orbit reacts to the cursor; boxes open in stages (owner request)

- **Cursor:** on a fine pointer, every role drifts slightly with the cursor anywhere in the orbit. Roles within 420 px also lean toward it (up to 22 px and 7°), and the "Experience" centre drifts the other way. `main.ts` only sets CSS variables, once per frame. The movement itself is a CSS transition with an overshooting spring easing (`--ease-spring`), so it wobbles. It holds still while a box is open, and is off with reduced motion and in the LLM view.
- **Comment box:**
  - opening: it pops out of its role as a thin strip (`transform`), opens left and right (`scale` from the centre), and then its text fades in
  - closing: the same steps backwards
  - mechanism: CSS transitions with `@starting-style` and `allow-discrete` on `display`/`overlay`, with different delays per direction; only transform and opacity animate

## D29. Filling the empty space in the experience orbit (owner request)

- **References:** circular and radial timeline layouts (Awwwards "circular timeline", Framer OrbitMotion, 21st.dev radial orbital timeline), rotating circular text badges, and "radar" rings. They all fill the space with thin-stroke instrument detail, not boxes or images.
- **Built (one static SVG plus one CSS layer, no extra JS):**
  - an outer ring with 72 compass ticks
  - a faint dotted inner ring
  - orange dashed spokes from the centre to each role, turning with the roles
  - the organisation names and "2023 — 2026" as mono text on a circle, turning slowly the other way
  - a dot grid that fades out from the centre (its own layer, so the fade never touches the role boxes)
- **Fit:** it matches the computer-vision/detection theme and uses only the existing colour tokens. The new rotations use the same `spin`/`counter-spin` animations, so they brake and wobble with the orbit. All of it is off on small screens and in the LLM view.

## D30. StemCast details and soft skills

- StemCast gained the details the owner gave in chat.
- Skills gained a "Soft skills" group, a placeholder list the owner asked for and plans to replace (`skills.soft` in `site.ts`).

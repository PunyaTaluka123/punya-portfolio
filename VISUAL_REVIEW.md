# Visual review (gate 9)

Gate 9 takes these screenshots. Files are in `screenshots/`, which git ignores; regenerate them with `npm run verify -- 9`.

- **Full-page captures** of all 6 pages (`/`, three project pages, `/404`, `/llm`) at 375, 768 and 1440 px, in light, dark and LLM views: `<page>-<width>-<mode>.png`. They are taken in the settled state (reduced motion), because scroll-driven reveals below the fold would otherwise be frozen at their pre-scroll offset.
- **First-screen captures** of every page in light and dark with normal motion, after the hero settles: `*-viewport.png`.
- **Captures of the project stack mid-scroll** on the home page, with normal motion: `home-*-stack.png`.

To review them, I put them side by side (light | dark | LLM) in contact sheets. Each sheet is cut into page-height chunks so the text stays readable. I judged each one against the design decision in DECISIONS.md D1:

- a type-led hero with the name as the largest element
- monospace metadata rails
- a dot feature-map field
- an asymmetric 12-column layout
- a sticky project stack with a progress marker
- one orange accent

## Round 1 (pre-gate captures, 375/768/1024/1440)

| #   | Where                | Problem                                                                                                                                          | Kind           | Fix                                                                                                                              |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Home hero, 1440      | The role text and CTAs formed an implicit second grid column. The rails shrank to about 1140 px, and the role line wrapped to one word per line. | broken spacing | Gave the hero grid one explicit `minmax(0,1fr)` column. Role and CTAs now sit in their own row (left and right on wide screens). |
| 2   | Home hero, 768       | "Taluka" was clipped off the right edge, and the top rail was truncated.                                                                         | overflow       | Hero size is now set per breakpoint so the indent plus the word always fits (23vw, 19vw, min(17vw, 15rem)); see D14.             |
| 3   | Rails, all widths    | The orange kernel passed over the small mono labels and hurt legibility.                                                                         | low contrast   | The rail labels now sit on a solid background. The kernel starts a few rows lower.                                               |
| 4   | About, 1440          | The two paragraphs stretched to the height of the facts column, leaving a big gap.                                                               | broken spacing | `align-content: start` on `.prose`.                                                                                              |
| 5   | About, 375           | The last paragraph touched the "Education" label.                                                                                                | broken spacing | `.about-grid` is now a grid with a gap at every width.                                                                           |
| 6   | Contact, 1440/375    | The email broke mid-word ("…@gm / ail.com").                                                                                                     | weak hierarchy | Size capped at 4.25 rem. A `<wbr>` lets the break fall before "@".                                                               |
| 7   | Project cards, 375   | "BiogasBooste / rs" broke inside the word.                                                                                                       | overflow       | Card titles are sized with container query units (`11cqi`).                                                                      |
| 8   | Project stack, 375   | The sticky progress bar covered the top of the pinned card.                                                                                      | overlap        | `--stack-top` token leaves room for the bar on small screens.                                                                    |
| 9   | Progress marker, all | The fill never moved. The CSS minifier had folded `animation-timeline` into the shorthand, which browsers reject.                                | broken motion  | Switched the CSS minifier to esbuild (D12).                                                                                      |
| 10  | Hero frame 0         | Glyph tops peeked out under the mask before the rise began.                                                                                      | polish         | Start offset raised to `translateY(130%)`.                                                                                       |

## Round 2 (gate 9 captures, all pages × 3 widths × 3 modes)

| #   | Where               | Problem                                                                                                              | Kind             | Fix                                                                                                                        |
| --- | ------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 11  | `/llm`, 375         | 7 px horizontal overflow from an unbreakable LinkedIn URL.                                                           | overflow         | Small external stylesheet for `/llm` (72ch measure, `overflow-wrap: anywhere`, follows the system theme). No scripts.      |
| 12  | LLM view, all pages | Sections had no padding or divider. A high-specificity `:is(.card article)` in the reset beat the spacing rules.     | broken spacing   | The reset now uses `:where()`; added paragraph and heading rhythm.                                                         |
| 13  | LLM view            | Double rules between experience rows and sections.                                                                   | broken spacing   | Experience borders removed in LLM view. Only section dividers remain.                                                      |
| 14  | Experience, 375     | "Lead Programmer / · FRC Team Kaizen" wrapped with the separator at the start of a line.                             | weak hierarchy   | The org sits on its own line under 640 px. The "·" separator shows only inline.                                            |
| 15  | Experience, 1440    | No space before "·" ("Academic Lead· Datathon").                                                                     | polish           | Separator is now `{' · '}` inside its span.                                                                                |
| 16  | Project cards, 375  | Cards were mostly empty space at 68svh.                                                                              | weak hierarchy   | 56svh / 30 rem on small screens; 68svh from 900 px.                                                                        |
| 17  | Project pages, 1440 | Below the title it felt sparse and disconnected from the home page.                                                  | weak hierarchy   | The project header now has its own feature-map canvas band (same component as the hero) and a bottom rule.                 |
| 18  | Full-page captures  | Headings below the fold looked missing: the captures froze scroll-driven reveals mid-entry. Real scrolling was fine. | capture artifact | Full-page captures use the settled state. Motion is checked separately in gate 8 and in the `-viewport`/`-stack` captures. |

## Round 3 (re-captured after the fixes)

- Rechecked the 375 and 1440 first-screen captures (home and project pages), the mid-scroll stack captures, `/404` in all three modes, the home LLM view at 768, and the Basketball Shot Tracking page in all three modes at 768.
- One small leftover: in the LLM view, the two hero CTA links sat a few pixels off each other's baseline. Fixed with `align-items: baseline`.
- No overflow at any width (the gate measures `scrollWidth`). No overlap of text and controls. All text pairs meet 4.5:1 (axe gate 5 confirms 0 serious or critical issues across 48 runs).
- Every capture matches D1. The name is the largest element on the home page, and project names are the largest element in their cards and pages. The accent is used only for the kernel, numbers, CTAs, bullets and the progress fill. Layouts stay asymmetric, with section bodies starting at column 4.

## Round 4 (2026-10-14: orbit, resume details, owner-reported glitches)

| #   | Where                         | Problem                                                                                                                                                                             | Kind           | Fix                                                                                                                                         |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 19  | Cursor ring, any link or card | The ring flew away from the pointer when it grew, because `scale` multiplied the `transform` position.                                                                              | broken motion  | Position with the `translate` property. Measured: ring centre equals pointer at 1× and 1.9×.                                                |
| 20  | Back from a project page      | The project page cross-faded over the sticky stack for about 0.4 s.                                                                                                                 | overlap        | Back/forward skips the transition. Link navigations fade out, then fade in. The first frame after going back now matches the settled frame. |
| 21  | Experience, 1440              | "Mentor, grades 6–8" broke mid-range on the orbit title.                                                                                                                            | weak hierarchy | Grades moved to the org line.                                                                                                               |
| 22  | Experience comment box, 1440  | The six-point FRC box was very tall.                                                                                                                                                | weak hierarchy | Box widened to 32 rem; org on its own line.                                                                                                 |
| 23  | Experience, LLM view          | The orbit ring and role buttons still showed, and the ring blocked clicks. An `:is()` that contained pseudo-elements was invalid, so the whole rule was dropped. Gate 10 caught it. | overlap        | Split selectors; the ring has `pointer-events: none`. Re-shot: the LLM view is now a linear heading-plus-bullets list, left-aligned.        |
| 24  | Experience, 375               | Checked the vertical line of roles and the comment box opening below its role. No overflow.                                                                                         | check          | —                                                                                                                                           |

Open issues: none

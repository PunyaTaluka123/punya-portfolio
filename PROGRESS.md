# Progress

Read this first if context was summarized.

## Phase 1: Research — DONE (commit f99ac43)

- 16 references, DESIGN_RESEARCH.md; direction D1 in DECISIONS.md.

## Phase 2: Design — DONE

- tokens.css (colour via light-dark(), type, space, motion), global.css, fonts self-hosted (src/assets/fonts, OFL).
- Motion: CSS letter stagger hero, canvas kernel field (main.ts), scroll-driven reveals + sticky stack progress, card lift + detection brackets, draw-in underlines, cursor follower, native cross-document view transitions, theme crossfade via startViewTransition.
- Reviewed at 375/768/1024/1440 light+dark; fixes logged as D11–D14.

## Phase 3: Build — DONE

- Astro 7 static, build.format=file, trailingSlash never. Pages: /, /projects/[slug] x3, /404, /llm. Endpoints: llms.txt, portfolio.md, content.json, robots.txt, sitemap.xml, site.webmanifest.
- scripts/verify.mjs: 12 gates; local server mirrors vercel.json headers + cleanUrls + gzip.
- Gate runs so far: 1-8 PASS (axe 48 runs 0 serious; Lighthouse 100x4 on all indexable pages, LCP 1.35 s, CLS 0, JS 2.3 KB gz).

## Phase 4: LLM mode — DONE

- Toggle (aria-pressed, label swap), data-view on <html>, #glance hidden in human mode, Copy as Markdown (clipboard verified), /portfolio.md link.
- boot.js applies ?view=llm / localStorage before paint; view transitions skipped in LLM mode.
- /llm, /llms.txt, /portfolio.md, /content.json, JSON-LD Person, robots.txt (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), sitemap.xml, OG/Twitter meta, og.png.
- Gate 10 PASS; LLM_TEST.md written from extracted text.

## Phase 5: Production — DONE (commit 2e910ff)

- vercel.json headers + cache, CI workflow (.github/workflows/verify.yml), README, npm audit 0, exact pins + lockfile.

## Gates

- 1-11: PASS individually (axe 48 runs; Lighthouse 100x4 on 5 pages, LCP ~1.35 s; motion; 96 screenshots, 3 review rounds in VISUAL_REVIEW.md; LLM_TEST.md; FACT_AUDIT.md).
- 12: fresh-eyes review DONE; fixes applied (see REVIEW.md). Gates 1-4 re-run PASS after fixes.
- OPEN (usage limit hit): full `npm run verify` re-run (gates 5-12) after review fixes; update FACT_AUDIT.md for reworded lines; fix DECISIONS D2/D3/D5 doc errors; README boot.js path (now src/scripts/boot.js); final report.

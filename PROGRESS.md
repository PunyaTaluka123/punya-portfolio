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

## Phase 4: LLM mode — mostly built (toggle, #glance, copy md, boot.js ?view=llm)
## Phase 5: Production — open
## Gates — open (scripts/verify.mjs not written yet)

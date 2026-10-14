# Punya Taluka: portfolio

A static Astro site with two views:

- A **human view**: big type, a live dot "feature map", and scroll motion.
- An **LLM view**: one plain, linear document. Switch with the header button or `?view=llm`.

Every page and machine-readable file is generated from `src/data/site.ts`.

## Run it

Requires Node 22.18 or newer (24 recommended, see `.nvmrc`).

```bash
npm ci
npx playwright install chromium   # one time, needed for the gates
npm run dev                       # http://localhost:4321
```

Other scripts:

| Command            | What it does                                                   |
| ------------------ | -------------------------------------------------------------- |
| `npm run build`    | Static build into `dist/`                                      |
| `npm run preview`  | Serve `dist/` on port 4321                                     |
| `npm run check`    | Type check, lint and format check                              |
| `npm run format`   | Prettier write                                                 |
| `npm run assets`   | Re-render `public/og.png`, the PNG icons and `favicon.ico`     |
| `npm run verify`   | Run all 12 gates (see below)                                   |

## Edit the content

All text lives in **`src/data/site.ts`**: name, role line, about, education, experience, projects, skills, interests and links. Edit it, then run `npm run build`. These all regenerate from it:

- the home page, `/projects/[slug]`, `/404` and `/llm`
- `#glance` (the LLM summary block) and the JSON-LD `Person`
- `/portfolio.md`, `/content.json`, `/llms.txt`, `/sitemap.xml` and `/site.webmanifest`

Rules that the gates enforce:
- **Every claim must trace to a source.** Add a row to `FACT_AUDIT.md` for any new claim.
- **DermaTrack** says "designed", never "built" or "launched".
- **BiogasBoosters** states its 2027 deployment and 33% figure as a plan and target, never as a result.
- Don't use hype words ("passionate", "leverage", "cutting-edge", "synergy").
- Don't add a phone number or a home address.

Adding a featured project: add an object to `projects`. Its page appears at `/projects/<slug>`. The home card, glance, Markdown, JSON and llms.txt pick it up automatically. The CSS handles up to six featured projects. For more, extend the `.vt-N` and `.card:nth-child(N)` rules in `src/styles/global.css`.

If you change the name or role line, run `npm run assets` to refresh the Open Graph image.

Design tokens (colours, type sizes, spacing, motion times) are in `src/styles/tokens.css`.

## Gates

```bash
npm run verify          # all gates, one PASS/FAIL line each
npm run verify -- 5 6   # only some gates
```

`verify` builds the site and serves `dist/` on `localhost:4321`. The local server uses the same headers, clean URLs and 404 page as `vercel.json`. Then it runs:

1. `astro check`, ESLint and Prettier, with zero errors and zero warnings
2. Production build
3. Placeholder scan of `dist/` (`{{`, `TODO`, `lorem`, `example.com`)
4. Link check: internal links and anchors, external links (2xx), and LinkedIn (checked as an exact URL, because it returns 999 to bots)
5. axe on every page × human/LLM view × light/dark × 375/1440 px; zero serious or critical issues
6. Lighthouse mobile (throttled) on every indexable page: each category ≥ 95, LCP < 2 s, CLS < 0.05, home JS < 120 KB gzipped
7. A `curl` fetch with no JS: name, project titles, GitHub/LinkedIn links and `#glance` present
8. Motion: hero frames at 0, 0.5, 1.5 and 3 s; a reduced-motion run must show no movement
9. Full-page screenshots of every page at 375/768/1440 in light, dark and LLM views, plus an overflow check (review notes go in `VISUAL_REVIEW.md`)
10. LLM view: toggle, `#glance`, no running animation, Copy as Markdown, and the machine files and JSON-LD
11. Fact checks: no OncoGuard, DermaTrack says "designed", Biogas is a target only, no hype words, no phone numbers; `FACT_AUDIT.md` present
12. Fresh-eyes review (`REVIEW.md`) has no open items

Output goes to `reports/` and `screenshots/`, which git ignores. CI runs the same command on every pull request (`.github/workflows/verify.yml`).

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo. The framework preset is detected as Astro. `vercel.json` already sets `npm run build`, the output folder `dist`, clean URLs, the security headers (CSP, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options, HSTS) and the cache rules: one year immutable for `/_astro/*`, revalidate everything else.
3. Under **Settings → Environment Variables**, add `SITE_URL`. Until you have a domain, use the Vercel URL, for example `https://<project>.vercel.app`. Canonical URLs, Open Graph tags, the sitemap, `robots.txt`, `llms.txt`, the Markdown, the JSON and the JSON-LD all use it.
4. Deploy. Then open `/`, `/llm`, `/llms.txt` and `/portfolio.md` on the live URL to check them.

## Set the domain

1. Buy the domain. In Vercel, go to **Settings → Domains → Add** and enter it. Follow the DNS records Vercel shows (an `A` record for the apex, or a `CNAME` for `www`).
2. Change `SITE_URL` to `https://your-domain` (no trailing slash) for the Production environment.
3. Redeploy so the canonical URLs, the sitemap and the other files pick up the new domain.
4. Optional: in Vercel, redirect `www` to the apex (or the other way round).

Locally, `SITE_URL` defaults to `http://localhost:4321`.

## Project layout

```
src/data/site.ts          all content
src/styles/tokens.css     design tokens
src/styles/global.css     layout, motion, LLM view
src/layouts/Base.astro    head, header, #glance, footer
src/components/Head.astro meta, OG, alternate links, preloads
src/scripts/main.ts       theme and view toggles, canvas field, cursor, copy
public/boot.js            pre-paint theme/view (no flash, CSP-safe)
src/pages/                pages and machine-readable endpoints
scripts/verify.mjs        the gates
scripts/assets.mjs        OG image and icons
```

Fonts: Bricolage Grotesque and Instrument Sans (SIL OFL 1.1). They are self-hosted, and their licences are in `src/assets/fonts/`.

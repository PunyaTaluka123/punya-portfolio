# Punya Taluka: portfolio

**Live: [punya-portfolio-delta.vercel.app](https://punya-portfolio-delta.vercel.app)**

My personal site, built as a static Astro site with two ways to read it:

- A **human view**: big type, a live dot "feature map" on a canvas, an orbiting experience section and scroll motion.
- An **LLM view**: one plain, linear document with no animation, for recruiters' AI tools and screen readers. Switch with the header button or `?view=llm`.

## What's interesting about it

- **One source of truth.** Every page, the LLM view and the machine-readable files (`/llms.txt`, `/portfolio.md`, `/content.json`, the sitemap and JSON-LD) are generated from a single typed data file, [`src/data/site.ts`](src/data/site.ts). They can't drift apart.
- **Built to be read by machines as well as people.** Besides the LLM view, `/llms.txt` follows the llms.txt convention, `/portfolio.md` is a Markdown export, `/content.json` is structured data, and every page has schema.org JSON-LD. A `curl` with no JavaScript still gets the name, projects and links.
- **12 automated quality gates** ([`scripts/verify.mjs`](scripts/verify.mjs), run in CI on every PR): type check, lint and format; a production build; a placeholder scan; an internal and external link check; axe accessibility checks on every page in both views, both themes and two widths; Lighthouse mobile ≥ 95 in every category with LCP < 2 s, CLS < 0.05 and home JS < 120 KB gzipped; a no-JS fetch; reduced-motion checks; full-page screenshots; LLM-view checks; and fact checks against an audit of every claim's source.
- **Strict security headers.** CSP `script-src 'self'` with no `unsafe-inline`: the theme script that runs before paint (to avoid a flash) is an external, build-hashed file. Also HSTS, nosniff and frame denial in `vercel.json`.
- **No tracking cookies.** Vercel Web Analytics only; no consent banner needed.

Design and build notes are in [`docs/`](docs/): the design research and chosen direction, a decision log, the fact audit (a source for every claim on the site), the LLM-view test, and the visual and fresh-eyes reviews.

## Run it

Requires Node 22.18 or newer (24 recommended, see `.nvmrc`).

```bash
npm ci
npx playwright install chromium   # one time, needed for the gates
npm run dev                       # http://localhost:4321
```

Other scripts:

| Command           | What it does                                               |
| ----------------- | ---------------------------------------------------------- |
| `npm run build`   | Static build into `dist/`                                  |
| `npm run preview` | Serve `dist/` on port 4321                                 |
| `npm run check`   | Type check, lint and format check                          |
| `npm run format`  | Prettier write                                             |
| `npm run assets`  | Re-render `public/og.png`, the PNG icons and `favicon.ico` |
| `npm run verify`  | Run all 12 gates (see below)                               |

## Edit the content

**All text on the site lives in one file: [`src/data/site.ts`](src/data/site.ts).** Edit it, save, and the dev server updates. Every page, `#glance`, `/llm`, `/portfolio.md`, `/content.json`, `/llms.txt` and the JSON-LD regenerate from it.

| What you see                                                              | Where in `site.ts`                                                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Name, role line, email, GitHub, LinkedIn                                  | `name`, `roleLine`, `email`, `links`, `handles` (top of the file)                                                 |
| Small hero labels, button text, the experience hint, the contact sentence | `copy`                                                                                                            |
| About paragraphs                                                          | `about` (item 2 is the big lead sentence)                                                                         |
| Work-pass line under About                                                | `availability`                                                                                                    |
| Education, SAT                                                            | `education`                                                                                                       |
| Experience (orbit titles and comment boxes)                               | `experience`: `role`, `org`, `when` and `points` (the bullets)                                                    |
| Project cards and project pages                                           | `projects`: `oneLine` for the card, `body` for the page paragraphs, `facts` for the details list, `tags`, `links` |
| "Also: AgriBot…"                                                          | `otherProjects`                                                                                                   |
| Recognition                                                               | `recognition`                                                                                                     |
| Skills section                                                            | `skills` (languages, areas, ml, tools) and `interests`                                                            |
| Languages you speak                                                       | `spoken`                                                                                                          |

Text that is **not** in `site.ts` (labels and page furniture):

- [`src/layouts/Base.astro`](src/layouts/Base.astro): header nav labels, the LLM-view button labels, the "At a glance" labels, footer link labels.
- [`src/pages/index.astro`](src/pages/index.astro): section headings (About, Experience, Projects, Skills, Contact) and the small group labels in Skills.
- [`src/pages/404.astro`](src/pages/404.astro): the 404 page text.
- [`src/pages/projects/[slug].astro`](src/pages/projects/[slug].astro): "← All projects", "Previous", "Next".

Rules that the gates enforce:

- **Every claim must trace to a source.** Add a row to `docs/FACT_AUDIT.md` for any new claim.
- **DermaTrack** says "designed", never "built" or "launched".
- **BiogasBoosters:** the only result allowed is the 33%, and it must be labelled "measured".
- Don't use hype words ("passionate", "leverage", "cutting-edge", "synergy").
- Don't add a phone number or a home address.

Adding a featured project: add an object to `projects`. Its page appears at `/projects/<slug>`, and everything else picks it up automatically. The CSS handles up to six featured projects and up to eight experience roles.

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
9. Full-page screenshots of every page at 375/768/1440 in light, dark and LLM views, plus an overflow check (review notes go in `docs/VISUAL_REVIEW.md`)
10. LLM view: toggle, `#glance`, no running animation, Copy as Markdown, and the machine files and JSON-LD
11. Fact checks: no OncoGuard, DermaTrack says "designed", the BiogasBoosters 33% is labelled measured, no hype words, no phone numbers; `docs/FACT_AUDIT.md` present
12. Fresh-eyes review (`docs/REVIEW.md`) has no open items

Output goes to `reports/` and `screenshots/`, which git ignores. CI runs the same command on every pull request (`.github/workflows/verify.yml`).

## Analytics

Vercel Web Analytics is wired in: `src/components/Head.astro` loads `/_vercel/insights/script.js` on every page except the script-free `/llm`. It sets no cookies, so it needs no consent banner. It shows visitors, pages, referrers, countries and devices, but not identities.

To turn it on, open the project in Vercel, go to the **Analytics** tab and click **Enable**. Until you do, the script path returns 404 and nothing is tracked. Locally, `npm run verify` serves a stand-in for that path, so the gates behave like production.

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
src/scripts/boot.js       pre-paint theme/view (no flash, CSP-safe), hashed by the build
src/pages/                pages and machine-readable endpoints
scripts/verify.mjs        the gates
scripts/assets.mjs        OG image and icons
docs/                     design research, decisions, fact audit, reviews
```

Fonts: Bricolage Grotesque and Instrument Sans (SIL OFL 1.1). They are self-hosted, and their licences are in `src/assets/fonts/`.

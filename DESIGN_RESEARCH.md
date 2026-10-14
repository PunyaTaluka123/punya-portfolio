# Design research

Date: 2026-10-14. Method: I searched Awwwards, Godly, Siteinspire, Dribbble and GitHub Pages portfolios. Search terms were "developer portfolio", "AI engineer portfolio" and "creative developer portfolio animation". Before I opened each site, I checked its `robots.txt`. I fetched pages one at a time. Each site got one desktop request (1440×900) and one mobile request (375×812) in headless Chrome. I looked at every screenshot. For motion, I took a second capture early in page load (about 0.4 s in) and compared it with the settled frame. I also checked each page's HTML for animation libraries.

Notes on the sources:
- **Awwwards**: `robots.txt` blocks `/websites/?` and `/inspiration_search/?`. I read only the plain `/websites/portfolio/` listing.
- **Siteinspire**: allowed. I read the `/websites/categories/portfolio` listing.
- **Godly**: `godly.website/websites/portfolio` now redirects (301) to `recent.design`. I used no references from it.
- **Dribbble**: search only. Shots are static mockups, so I can't judge their motion or speed. I did not score them. One idea I noted: a hero that switches between two modes (MindInventory's "Designer/Developer" shot). It backs up the LLM-view toggle idea.
- **aengel.io** (Awwwards listing): `robots.txt` disallows `/`, so I skipped it.

Scores run from 1 to 5. Columns: **V** visual appeal, **M** motion quality, **R** readability, **S** speed, **F** fit for a data science student.

---

### 1. Samuel Goddard — https://samgoddard.co.uk/ (Awwwards portfolio listing)
- **Layout:** One huge headline fills the whole first screen. It is the name plus the role, set in an all-caps display serif. Thin monospace rails run along the top and bottom, holding the nav, socials and a "last played" ticker. A half-tone portrait fades into the right side.
- **Motion:** The half-tone portrait is drawn on a canvas. The page uses View Transitions between pages, and the headline letters settle in on load. The early and settled frames barely differ (mean pixel diff 0.56), so the type paints almost at once. Content is not held back.
- **Type and colour:** A display serif at about 7 vw, against small monospace caps. Near-black with off-white, no accent. The contrast in type size is extreme.
- **Cost risk:** Medium. Next.js with 137 KB of HTML, plus a canvas portrait.
- **Scores:** V5 M4 R3 S3 F3

### 2. Nahiyan Khan — https://nahiyan.codes/ (Awwwards portfolio listing)
- **Layout:** A big lowercase wordmark at top left. Below it are three short blocks labelled `tldr`, `today` and `yesterday`, set in a staggered asymmetric grid. A pill nav floats at the bottom.
- **Motion:** A CRT "power-on" intro: a horizontal scanline grows into the page (the 0.4 s frame is only that line). Behind the page sits a dot-matrix canvas texture. The nav uses Astro View Transitions.
- **Type and colour:** A wide geometric display face over monospace body text. Charcoal, with one blue accent on the active nav pill.
- **Cost risk:** Medium. Built with Astro, and the HTML has Three.js references. The intro hides all content for about 1 s, which is bad for LCP and does not work without JS.
- **Scores:** V5 M4 R4 S3 F4

### 3. Brittany Chiang — https://brittanychiang.com/
- **Layout:** A two-column split. The left column is sticky and holds the name, a one-line role, a section nav with drawn line markers, and social icons. The right column scrolls: about, then dated experience rows, then projects. On mobile it collapses to one column.
- **Motion:** A soft radial spotlight follows the cursor. The nav line markers grow when their section is active. Rows lift and highlight on hover.
- **Type and colour:** Clean grotesk, navy background, mint accent on tags.
- **Cost risk:** Low to medium. Next.js, framer-motion. It ships Google Analytics.
- **Scores:** V4 M3 R5 S4 F4

### 4. Rauno Freiberg — https://rauno.me/
- **Layout:** A single white card on grey. The bio is set as a large stepped sentence, with lines indented in turn. A ruler-like progress strip sits at the top.
- **Motion:** A large yellow disc and a crosshair cursor respond to the pointer. The ruler works like a scrubber.
- **Type and colour:** Large grotesk, one loud accent (pure yellow), everything else neutral. It shows how much one accent can carry.
- **Cost risk:** Low. Next.js, 31 KB of HTML.
- **Scores:** V5 M4 R4 S4 F2

### 5. Emil Kowalski — https://emilkowal.ski/
- **Layout:** One narrow centred column. Name and title, then "Today" and "Projects" lists with one line per item.
- **Motion:** Almost none on the home page. The craft is in small interaction details on the subpages.
- **Type and colour:** Small sans text, warm off-white, grey secondary text.
- **Cost risk:** Very low.
- **Scores:** V3 M2 R5 S5 F3

### 6. Andrej Karpathy — https://karpathy.ai/
- **Layout:** A portrait and name header, then a vertical timeline. Each row has years, an org logo and a paragraph.
- **Motion:** None.
- **Type and colour:** System sans, blue default links. It's purely functional.
- **Cost risk:** Very low, but the mobile layout overflows sideways.
- **Scores:** V2 M1 R4 S5 F5. It is the clearest example of who this audience trusts. Its plain content is what an LLM wants.

### 7. Lilian Weng — https://lilianweng.github.io/ (GitHub Pages)
- **Layout:** A blog index. Header nav, an intro line, then post cards with dates and reading times.
- **Motion:** None. Theme toggle only.
- **Type and colour:** Dark grey cards on charcoal. The hero is "👋 Welcome to…", which is one of the patterns to avoid.
- **Cost risk:** Very low (Hugo).
- **Scores:** V2 M1 R5 S5 F5

### 8. Josh W. Comeau — https://www.joshwcomeau.com/
- **Layout:** A layered hill illustration in the hero, a 3D avatar, then a two-column list of articles plus a sidebar.
- **Motion:** Spring physics on hover, sound effects, a theme toggle with an animated sun and moon. The motion is playful and polished.
- **Type and colour:** Rounded sans, magenta section labels on deep navy.
- **Cost risk:** Medium to high. React plus illustrations plus sound. The hero depends on images.
- **Scores:** V4 M5 R4 S3 F2

### 9. Paco Coursey — https://paco.me/
- **Layout:** One centred column of short paragraphs, then a three-column "Building / Projects / Writing" list.
- **Motion:** Very subtle link underline transitions.
- **Type and colour:** A grotesk, with italic serif for emphasis. Dark grey, no accent.
- **Cost risk:** Very low.
- **Scores:** V4 M2 R5 S5 F3

### 10. Lee Robinson — https://leerob.com/
- **Layout:** Asymmetric. A text column on the left (serif bio, notes list, blog rows with dates in a right-aligned column) and a tall illustrated panel on the right.
- **Motion:** A tab switch between short and long bio.
- **Type and colour:** Serif text on near-black with muted underlined links. The colour all comes from one illustration.
- **Cost risk:** Medium, because the illustration is large (770 KB in the desktop capture).
- **Scores:** V4 M2 R5 S3 F3

### 11. Artem Taradash — https://taradash.me/ (Siteinspire portfolio listing)
- **Layout:** An editorial grid. A big statement headline sits on the left, three narrow text columns run across the top, and below it product photos sit in asymmetric blocks with big object titles ("Pedal 4. minimal").
- **Motion:** Images scale gently as you scroll.
- **Type and colour:** Black grotesk on white, black tag chips. Large project titles make the work the visual centre.
- **Cost risk:** Medium to high, because the photography is heavy.
- **Scores:** V4 M3 R4 S2 F2

### 12. Houmahani Kane — https://houmahani.com/ (Awwwards portfolio listing)
- **Layout:** A 3D scene world. Even with a 20 s virtual-time budget, headless Chrome showed only a "0%" loader and a "rotate your phone" notice.
- **Motion:** WebGL/Three.js with a percentage loader.
- **Type and colour:** Warm cream gradient while it loads.
- **Cost risk:** High. WebGL. No content without JS and a GPU.
- **Scores:** V3 (loader only) M? R1 S1 F1

### 13. Maria Vasilyeva — https://www.mariavasilyeva.com/ (Awwwards DEV award)
- **Layout:** Horizontal rule bands, revealed after a "3% … 100%" loader.
- **Motion:** Canvas-driven intro behind a percentage loader. Content stays hidden until JS finishes.
- **Type and colour:** Charcoal with thin grey rules and a serif counter.
- **Cost risk:** High. Content is gated on the loader.
- **Scores:** V3 M? R1 S2 F1

### 14. Bruno Simon — https://bruno-simon.com/ (Awwwards SOTD, Mar 2026)
- **Layout:** A full-screen 3D world that you drive through.
- **Motion:** Physics and WebGL throughout. Headless capture showed only the gradient background.
- **Cost risk:** Very high. WebGL plus physics. Nothing to read without a GPU.
- **Scores:** V5 (known) M5 R1 S1 F2

### 15. Gil Huybrecht — https://gilhuybrecht.com/ (Siteinspire portfolio listing)
- Headless Chrome returned "500 – THREE.WebGLRenderer: Error creating WebGL context". That's a useful warning: when WebGL fails, the whole page fails.
- **Scores:** V? M? R1 S1 F1

### 16. Cassie Evans — https://cassie.codes/
- The site is now retired and shows a single monospace "Thanks for reading" note on black. I reviewed it but did not use it.

---

## Takeaways
1. The striking sites (Goddard, Nahiyan, Rauno, Taradash) win on **type scale and one bold move**, not on WebGL.
2. The WebGL and loader sites (Houmahani, Vasilyeva, Bruno Simon, Gil Huybrecht) show nothing to a crawler, a no-JS fetch or a GPU-less browser. That fails two of my gates (no-JS, LLM read). Avoid.
3. The ML-research sites (Karpathy, Lilian Weng) are what the target readers trust: plain, dated and linkable. That is the model for the LLM view.
4. Monospace metadata labels (Goddard, Nahiyan) suit a data person: they read like log lines or column headers.

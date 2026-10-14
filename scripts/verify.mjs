// npm run verify: runs every gate in order and prints one PASS/FAIL line per gate.
// Details for failures and artefacts go to reports/ and screenshots/.
// Run a subset while working: npm run verify -- 5 6
import { execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import { site } from '../src/data/site.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const REPORTS = join(ROOT, 'reports');
const SHOTS = join(ROOT, 'screenshots');
const PORT = 4321;
const BASE = `http://localhost:${PORT}`;
const SITE = (process.env.SITE_URL ?? BASE).replace(/\/$/, '');
const PAGES = ['/', ...site.projects.map((p) => `/projects/${p.slug}`), '/404', '/llm'];
const INDEXABLE = PAGES.filter((p) => p !== '/404'); // 404 is noindex on purpose
const only = process.argv.slice(2);
mkdirSync(REPORTS, { recursive: true });
mkdirSync(SHOTS, { recursive: true });

/* helpers ---------------------------------------------------------------- */
const results = [];
async function gate(id, name, fn) {
  if (only.length && !only.includes(String(id))) return;
  for (const f of readdirSync(REPORTS)) if (f.startsWith(`gate${id}-`)) rmSync(join(REPORTS, f));
  try {
    if (id >= 5 && id <= 10 && serverError) throw serverError;
    let timer;
    const note = await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('timed out (hung?)')), GATE_TIMEOUT);
      }),
    ]).finally(() => clearTimeout(timer));
    results.push({ id, name, ok: true });
    console.log(`PASS  ${id}. ${name}${note ? ` (${note})` : ''}`);
  } catch (e) {
    results.push({ id, name, ok: false });
    console.log(`FAIL  ${id}. ${name}: ${e.message}`);
  }
}
const must = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const fail = (issues, file) => {
  if (!issues.length) return;
  writeFileSync(join(REPORTS, file), issues.join('\n') + '\n');
  throw new Error(`${issues.length} issue(s), first: ${issues[0]} (see reports/${file})`);
};
// Sync is fine before the server starts (gates 1-2). Once the in-process server is up,
// a sync child would freeze the event loop and the server could never answer it.
const run = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
const runAsync = promisify(execFile);
const GATE_TIMEOUT = 20 * 60 * 1000;
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const TEXT = new Set([
  '.html',
  '.css',
  '.js',
  '.txt',
  '.md',
  '.json',
  '.xml',
  '.webmanifest',
  '.svg',
]);
const textFiles = () => walk(DIST).filter((f) => TEXT.has(extname(f)));
const read = (f) => readFileSync(f, 'utf8');
const visibleText = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(
      /<\/?(p|li|h\d|dt|dd|div|section|article|header|footer|nav|main|ul|ol|br)\b[^>]*>/g,
      '\n',
    )
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/[ \t]+/g, ' ');
const sentences = (text) =>
  text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/* Local static server that mirrors Vercel: cleanUrls, 404.html, vercel.json headers, gzip. */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};
const vercel = JSON.parse(read(join(ROOT, 'vercel.json')));
function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, BASE).pathname);
    // Vercel serves /_vercel/insights/* (Web Analytics) at runtime; stand in for it locally.
    if (path.startsWith('/_vercel/insights/'))
      return res
        .writeHead(path.endsWith('.js') ? 200 : 204, {
          'Content-Type': 'text/javascript',
          'X-Verify-Server': '1',
        })
        .end(path.endsWith('.js') ? '/* local stand-in for Vercel Web Analytics */' : undefined);
    const candidates =
      path === '/' ? ['/index.html'] : [path, `${path}.html`, `${path}/index.html`];
    let file = candidates
      .map((c) => join(DIST, c))
      .find((f) => f.startsWith(DIST) && existsSync(f) && statSync(f).isFile());
    let status = 200;
    if (!file) {
      file = join(DIST, '404.html');
      status = 404;
    }
    const headers = {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      'X-Verify-Server': '1',
    };
    for (const rule of vercel.headers)
      if (new RegExp(`^${rule.source}$`).test(path))
        for (const h of rule.headers) headers[h.key] = h.value;
    let body = readFileSync(file);
    if (/gzip/.test(req.headers['accept-encoding'] ?? '') && TEXT.has(extname(file))) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
    }
    res.writeHead(status, headers).end(body);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, async () => {
      // Another server (e.g. a stray `astro preview`) can hold [::1]:4321 and answer for
      // localhost instead of this one. Refuse to test anything but our own server.
      const res = await fetch(`${BASE}/`).catch(() => null);
      if (res?.headers.get('x-verify-server') === '1') return resolve(server);
      server.close();
      reject(new Error(`another server answers on ${BASE}; stop it and rerun`));
    });
  });
}

let browser;
const page = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  return ctx.newPage();
};
const runningAnimations = (pg) =>
  pg.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
const canvasStill = async (pg) => {
  const a = await pg.evaluate(() => document.querySelector('canvas.field')?.toDataURL() ?? '');
  await pg.waitForTimeout(600);
  const b = await pg.evaluate(() => document.querySelector('canvas.field')?.toDataURL() ?? '');
  return a === b;
};

/* gates ------------------------------------------------------------------ */
await gate(1, 'Type check, lint and format', () => {
  const c = run('npx', ['astro', 'check']);
  const m = c.stdout.match(/- (\d+) errors?\s+- (\d+) warnings?\s+- (\d+) hints?/);
  must(
    c.status === 0 && m && m[1] === '0' && m[2] === '0' && m[3] === '0',
    `astro check: ${m ? m[0].replace(/\s+/g, ' ') : c.stderr.slice(0, 200)}`,
  );
  const l = run('npx', ['eslint', '.', '--max-warnings', '0']);
  must(l.status === 0, `eslint: ${l.stdout.trim().split('\n').slice(0, 3).join(' | ')}`);
  // A pseudo-element inside :is()/:where() makes the whole rule invalid, silently.
  const badSel = readdirSync(join(ROOT, 'src/styles'))
    .flatMap((f) =>
      [...read(join(ROOT, 'src/styles', f)).matchAll(/([^{}]*)\{/g)].map((m) => [f, m[1]]),
    )
    .filter(([, sel]) => /:(is|where)\([^)]*::/.test(sel));
  must(
    !badSel.length,
    `pseudo-element inside :is()/:where() in ${badSel.map(([f]) => f).join(', ')}`,
  );
  const f = run('npx', ['prettier', '--check', '.']);
  must(
    f.status === 0,
    `prettier: ${(f.stdout + f.stderr).trim().split('\n').slice(0, 3).join(' | ')}`,
  );
  return 'astro check, eslint, prettier: 0 errors, 0 warnings';
});

await gate(2, 'Production build', () => {
  const b = run('npx', ['astro', 'build']);
  must(b.status === 0, b.stderr.trim().split('\n').slice(-3).join(' | '));
  must(existsSync(join(DIST, 'index.html')), 'dist/index.html missing');
  return `${walk(DIST).length} files in dist/`;
});

await gate(3, 'Placeholder check', () => {
  const pats = [/\{\{/, /TODO/, /lorem/i, /example\.com/i];
  const issues = [];
  for (const f of textFiles())
    for (const p of pats) if (p.test(read(f))) issues.push(`${f.slice(DIST.length)} matches ${p}`);
  fail(issues, 'gate3-placeholders.txt');
  return `${textFiles().length} text files clean`;
});

await gate(4, 'Link check', async () => {
  const issues = [];
  const external = new Set();
  const html = walk(DIST).filter((f) => f.endsWith('.html'));
  const ids = (h) => new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const resolve = (path) => {
    const c = path === '/' ? ['/index.html'] : [path, `${path}.html`, `${path}/index.html`];
    return c.map((x) => join(DIST, x)).find((f) => existsSync(f) && statSync(f).isFile());
  };
  for (const file of html) {
    const src = read(file);
    const refs = [
      ...[...src.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
      ...[...src.matchAll(/<meta[^>]+content="(https?:\/\/[^"]+)"/g)].map((m) => m[1]),
    ];
    for (let ref of refs) {
      ref = ref.replace(/&amp;/g, '&');
      if (ref.startsWith('mailto:')) {
        if (ref !== `mailto:${site.email}`) issues.push(`${file}: unexpected ${ref}`);
        continue;
      }
      if (ref.startsWith(SITE)) ref = ref.slice(SITE.length) || '/';
      if (/^https?:/.test(ref)) {
        external.add(ref);
        continue;
      }
      const [path, hash] = ref.split('#');
      if (path.startsWith('/_vercel/')) continue; // served by Vercel at runtime, not in dist/
      const target = path ? resolve(path.split('?')[0]) : file;
      if (!target) issues.push(`${file.slice(DIST.length)}: broken internal link ${ref}`);
      else if (hash && target.endsWith('.html') && !ids(read(target)).has(hash))
        issues.push(`${file.slice(DIST.length)}: missing #${hash} in ${target.slice(DIST.length)}`);
    }
  }
  for (const url of external) {
    if (new URL(url).hostname.endsWith('linkedin.com')) {
      // LinkedIn answers bots with 999, so only check the exact URL.
      if (url !== site.links.linkedin)
        issues.push(`LinkedIn link ${url} != ${site.links.linkedin}`);
      continue;
    }
    let status = 0;
    for (let attempt = 0; attempt < 2 && !(status >= 200 && status < 300); attempt++) {
      try {
        status = (
          await fetch(url, {
            redirect: 'follow',
            headers: { 'User-Agent': 'portfolio-link-check' },
          })
        ).status;
      } catch {
        status = -1;
      }
    }
    if (!(status >= 200 && status < 300)) issues.push(`${url} returned ${status}`);
  }
  const home = read(join(DIST, 'index.html'));
  for (const l of [site.links.github, site.links.linkedin])
    if (!home.includes(`href="${l}"`)) issues.push(`home page lacks link to ${l}`);
  fail(issues, 'gate4-links.txt');
  return `${html.length} pages, ${external.size} external links OK`;
});

let serverError = null;
const server =
  only.length && only.every((g) => +g <= 4)
    ? null
    : await serve().catch((e) => {
        serverError = e;
        return null;
      });
browser = server ? await chromium.launch() : null;

await gate(5, 'Accessibility (axe)', async () => {
  const issues = [];
  let runs = 0;
  for (const path of PAGES)
    for (const view of ['human', 'llm'])
      for (const scheme of ['light', 'dark'])
        for (const width of [375, 1440]) {
          const pg = await page({
            viewport: { width, height: width < 768 ? 812 : 900 },
            colorScheme: scheme,
          });
          await pg.goto(`${BASE}${path}${view === 'llm' ? '?view=llm' : ''}`, {
            waitUntil: 'networkidle',
          });
          await pg.waitForTimeout(1300);
          const r = await new AxeBuilder({ page: pg })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
            .analyze();
          runs++;
          for (const v of r.violations)
            if (v.impact === 'serious' || v.impact === 'critical')
              issues.push(
                `${path} ${view} ${scheme} ${width}: ${v.id} (${v.impact}) ${v.nodes
                  .map((n) => n.target.join(' '))
                  .slice(0, 3)
                  .join(', ')}`,
              );
          await pg.context().close();
        }
  fail(issues, 'gate5-axe.txt');
  return `${runs} runs, 0 serious/critical`;
});

await gate(6, 'Lighthouse (mobile, throttled)', async () => {
  const issues = [];
  const lh = await chromium.launch({ args: ['--remote-debugging-port=9223'] });
  const summary = [];
  try {
    for (const path of INDEXABLE) {
      const { lhr } = await lighthouse(`${BASE}${path}`, {
        port: 9223,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      });
      writeFileSync(
        join(REPORTS, `lighthouse${path.replace(/\//g, '_') || '_home'}.json`),
        JSON.stringify(lhr),
      );
      const s = Object.fromEntries(
        Object.entries(lhr.categories).map(([k, c]) => [k, Math.round(c.score * 100)]),
      );
      const lcp = lhr.audits['largest-contentful-paint'].numericValue;
      const cls = lhr.audits['cumulative-layout-shift'].numericValue;
      summary.push(
        `${path} P${s.performance} A${s.accessibility} BP${s['best-practices']} SEO${s.seo} LCP${Math.round(lcp)}ms CLS${cls.toFixed(3)}`,
      );
      for (const [k, v] of Object.entries(s)) if (v < 95) issues.push(`${path}: ${k} ${v} < 95`);
      if (lcp >= 2000) issues.push(`${path}: LCP ${Math.round(lcp)} ms >= 2000`);
      if (cls >= 0.05) issues.push(`${path}: CLS ${cls.toFixed(3)} >= 0.05`);
    }
  } finally {
    await lh.close();
  }
  const homeHtml = read(join(DIST, 'index.html'));
  const scripts = [
    ...new Set(
      [
        ...homeHtml.matchAll(/<script[^>]+src="(\/[^"]+)"/g),
        ...homeHtml.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="(\/[^"]+)"/g),
      ].map((m) => m[1]),
    ),
  ];
  // /_vercel/insights/script.js is served by Vercel (about 1.5 KB gzipped); add an allowance.
  const VERCEL_ANALYTICS_GZ = 2048;
  const jsGz = scripts.reduce(
    (n, s) =>
      n +
      (s.startsWith('/_vercel/')
        ? VERCEL_ANALYTICS_GZ
        : gzipSync(readFileSync(join(DIST, s))).length),
    0,
  );
  if (jsGz >= 120 * 1024) issues.push(`home JS ${jsGz} B gzipped >= 120 KB`);
  writeFileSync(
    join(REPORTS, 'gate6-lighthouse.txt'),
    summary.join('\n') + `\nhome JS gzipped: ${jsGz} B\n`,
  );
  fail(issues, 'gate6-lighthouse-issues.txt');
  return `${summary[0]}; home JS ${(jsGz / 1024).toFixed(1)} KB gz`;
});

await gate(7, 'No-JavaScript fetch (curl)', async () => {
  const { stdout: html } = await runAsync('curl', [
    '-sf',
    '--compressed',
    '--max-time',
    '20',
    `${BASE}/`,
  ]);
  const need = [
    site.name,
    ...site.projects.map((p) => p.name),
    `href="${site.links.github}"`,
    `href="${site.links.linkedin}"`,
    'id="glance"',
  ];
  const missing = need.filter((n) => !html.includes(n));
  must(!missing.length, `missing: ${missing.join(', ')}`);
  // The hidden #glance alone must not satisfy the check: the visible page needs it too.
  const outside = html.replace(/<section id="glance"[\s\S]*?<\/section>/, '');
  const onlyInGlance = need.slice(0, -1).filter((n) => !outside.includes(n));
  must(!onlyInGlance.length, `only inside #glance: ${onlyInGlance.join(', ')}`);
  must(
    /<section id="glance"[^>]*\shidden/.test(html),
    '#glance lacks the hidden attribute in human mode',
  );
  return `${need.length} required strings present`;
});

await gate(8, 'Motion test', async () => {
  const issues = [];
  const clip = { x: 0, y: 56, width: 1440, height: 844 };
  // Hide the canvas field only here (bypassCSP) so pixel diffs measure the hero text alone.
  const hideField = () =>
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '.field{visibility:hidden!important}.cursor{display:none!important}';
      document.head.append(s);
    });
  const capture = async (reduced) => {
    const pg = await page({ bypassCSP: true, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await pg.addInitScript(hideField);
    const t0 = Date.now();
    await pg.goto(`${BASE}/`, { waitUntil: 'commit' });
    await pg.waitForSelector('.hero-name .ch');
    const shots = {};
    for (const t of [0, 500, 1500, 3000]) {
      const wait = t - (Date.now() - t0);
      if (wait > 0) await pg.waitForTimeout(wait);
      shots[t] = await pg.screenshot({
        clip,
        path: join(SHOTS, `motion-${reduced ? 'reduced' : 'normal'}-${t}ms.png`),
      });
      if (t === 1500) {
        shots.letters = await pg.evaluate(() =>
          [...document.querySelectorAll('.hero-name .ch')].map((el) => ({
            transform: getComputedStyle(el).transform,
            running: el.getAnimations().some((a) => a.playState === 'running'),
          })),
        );
        shots.running = await runningAnimations(pg);
      }
    }
    return { pg, shots };
  };
  const normal = await capture(false);
  if (normal.shots[0].equals(normal.shots[500]))
    issues.push('hero did not move between 0 s and 0.5 s');
  if (normal.shots.letters.some((l) => l.running || l.transform !== 'none'))
    issues.push('hero letters not settled at 1.5 s');
  if (!normal.shots[1500].equals(normal.shots[3000]))
    issues.push('hero still changing after 1.5 s');
  await normal.pg.context().close();

  const reduced = await capture(true);
  if (!reduced.shots[0].equals(reduced.shots[1500]))
    issues.push('reduced motion: hero changed between 0 s and 1.5 s');
  if (reduced.shots.running)
    issues.push(`reduced motion: ${reduced.shots.running} running animations`);
  const pg = reduced.pg;
  await pg.waitForLoadState('networkidle');
  await pg.waitForTimeout(1500);
  if (!(await canvasStill(pg))) issues.push('reduced motion: canvas field still animating');
  const hidden = await pg.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll('main :is(h1,h2,h3,p,li,a,dd,dt)')) {
      if (el.closest('#glance, .sr-only, [aria-hidden="true"]')) continue;
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (
          cs.opacity !== '1' ||
          cs.visibility === 'hidden' ||
          (cs.transform !== 'none' && n.matches('.reveal > *, .sec-head > *'))
        ) {
          bad.push(el.textContent.trim().slice(0, 40));
          break;
        }
      }
    }
    return bad;
  });
  if (hidden.length)
    issues.push(`reduced motion: content not in final state: ${hidden.slice(0, 3).join(' | ')}`);
  await pg.context().close();
  fail(issues, 'gate8-motion.txt');
  return 'moves 0→0.5 s, settled by 1.5 s; reduced motion static and fully visible';
});

await gate(9, 'Visual review screenshots', async () => {
  const issues = [];
  let n = 0;
  const shoot = async (path, width, mode, reduced, file, scrollTo) => {
    const pg = await page({
      viewport: { width, height: width < 768 ? 812 : width < 1440 ? 1024 : 900 },
      colorScheme: mode === 'dark' ? 'dark' : 'light',
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    await pg.goto(`${BASE}${path}${mode === 'llm' ? '?view=llm' : ''}`, {
      waitUntil: 'networkidle',
    });
    await pg.waitForTimeout(1300);
    if (scrollTo) {
      await pg.evaluate((sel) => {
        const el = document.querySelector(sel);
        window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.45, behavior: 'instant' });
      }, scrollTo);
      await pg.waitForTimeout(500);
    }
    const over = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (over > 0) issues.push(`${path} ${width} ${mode}: horizontal overflow ${over}px`);
    const clipped = await pg.evaluate(() =>
      [...document.querySelectorAll('h1, h2, h3, p, li, a, dt, dd, button, .ch')]
        .filter((el) => el.offsetParent && !el.closest('.sr-only'))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
        })
        .map((el) => el.textContent.trim().slice(0, 30)),
    );
    if (clipped.length)
      issues.push(`${path} ${width} ${mode}: text off-screen: ${clipped.slice(0, 3).join(' | ')}`);
    await pg.screenshot({ path: join(SHOTS, file), fullPage: reduced });
    n++;
    await pg.context().close();
  };
  for (const path of PAGES) {
    const name = (path.slice(1) || 'home').replace(/\//g, '-');
    for (const width of [375, 768, 1440])
      for (const mode of ['light', 'dark', 'llm']) {
        // Full page in the settled state: scroll-driven reveals below the fold would
        // otherwise be frozen at their pre-scroll offset. Live motion is gate 8.
        await shoot(path, width, mode, true, `${name}-${width}-${mode}.png`);
        if (mode === 'llm') continue;
        // First screen with normal motion, after the hero has settled.
        await shoot(path, width, mode, false, `${name}-${width}-${mode}-viewport.png`);
        if (path === '/')
          await shoot(path, width, mode, false, `${name}-${width}-${mode}-stack.png`, '.stack');
      }
  }
  const review = join(ROOT, 'VISUAL_REVIEW.md');
  if (!existsSync(review)) issues.push('VISUAL_REVIEW.md missing');
  else if (!/Open issues: none/i.test(read(review)))
    issues.push('VISUAL_REVIEW.md still lists open issues');
  fail(issues, 'gate9-visual.txt');
  return `${n} screenshots in screenshots/, no overflow, review recorded`;
});

await gate(10, 'LLM view test', async () => {
  const issues = [];
  const pg = await page({ permissions: ['clipboard-read', 'clipboard-write'] });
  await pg.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const btn = pg.getByRole('button', { name: 'LLM view' });
  if ((await btn.getAttribute('aria-pressed')) !== 'false')
    issues.push('button not aria-pressed=false in human mode');
  await btn.click();
  await pg.waitForTimeout(400);
  const state = await pg.evaluate(() => ({
    view: document.documentElement.dataset.view,
    pressed: document.getElementById('view-toggle').getAttribute('aria-pressed'),
    label: document.getElementById('view-toggle').innerText.trim(),
    glanceHidden: document.getElementById('glance').hidden,
  }));
  if (state.view !== 'llm') issues.push('data-view="llm" not set');
  if (state.pressed !== 'true' || state.label !== 'Human view')
    issues.push(`button state wrong: ${JSON.stringify(state)}`);
  if ((await pg.getByRole('button', { name: 'Human view', exact: true }).count()) !== 1)
    issues.push('no button with accessible name "Human view"');
  if (state.glanceHidden || !(await pg.isVisible('#glance'))) issues.push('#glance not visible');
  const running = await runningAnimations(pg);
  if (running) issues.push(`${running} animations running in LLM view`);
  if (!(await canvasStill(pg))) issues.push('background canvas still moving in LLM view');
  await pg.getByRole('button', { name: 'Copy as Markdown' }).click();
  await pg.waitForTimeout(300);
  const copied = await pg.evaluate(() => navigator.clipboard.readText());
  if (copied !== (await (await fetch(`${BASE}/portfolio.md`)).text()))
    issues.push('Copy as Markdown did not copy /portfolio.md');
  await pg.evaluate(() => (document.getElementById('copy-status').textContent = ''));
  const text = await pg.evaluate(() => document.body.innerText);
  writeFileSync(join(REPORTS, 'llm-view.txt'), text);
  const facts = [
    site.name,
    site.roleLine,
    'NTU Singapore',
    'BSc Data Science and Artificial Intelligence',
    ...site.experience.map((x) => x.org),
    ...site.projects.map((p) => p.name),
    site.email,
    site.links.github,
    site.links.linkedin,
  ];
  for (const f of facts) if (!text.includes(f)) issues.push(`LLM text missing "${f}"`);
  await pg.reload({ waitUntil: 'networkidle' });
  if ((await pg.evaluate(() => document.documentElement.dataset.view)) !== 'llm')
    issues.push('LLM view not saved in localStorage');
  await pg.getByRole('button', { name: 'Human view' }).click();
  if (await pg.evaluate(() => document.documentElement.dataset.view))
    issues.push('Human view button did not switch back');
  if (!(await pg.evaluate(() => document.getElementById('glance').hidden)))
    issues.push('#glance not hidden again in human view');
  await pg.context().close();

  const fresh = await page();
  await fresh.goto(`${BASE}/?view=llm`, { waitUntil: 'networkidle' });
  if ((await fresh.evaluate(() => document.documentElement.dataset.view)) !== 'llm')
    issues.push('?view=llm ignored');
  await fresh.context().close();

  for (const [path, type] of [
    ['/llm', 'text/html'],
    ['/llms.txt', 'text/plain'],
    ['/portfolio.md', 'text/markdown'],
    ['/content.json', 'application/json'],
  ]) {
    const res = await fetch(`${BASE}${path}`);
    const body = await res.text();
    if (res.status !== 200 || !res.headers.get('content-type')?.startsWith(type))
      issues.push(`${path}: ${res.status} ${res.headers.get('content-type')}`);
    if (path === '/llm' && /<script/i.test(body)) issues.push('/llm contains a script');
    if (path === '/content.json') {
      try {
        if (JSON.parse(body).name !== site.name) issues.push('content.json name mismatch');
      } catch {
        issues.push('content.json does not parse');
      }
    }
  }
  const home = await (await fetch(`${BASE}/`)).text();
  const blocks = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  try {
    const p = JSON.parse(blocks[0]?.[1] ?? '');
    for (const k of ['name', 'jobTitle', 'alumniOf', 'url', 'email', 'sameAs'])
      if (!p[k]) issues.push(`JSON-LD missing ${k}`);
    if (p['@type'] !== 'Person') issues.push('JSON-LD @type is not Person');
    if (
      !site.links.github ||
      !p.sameAs?.includes(site.links.github) ||
      !p.sameAs?.includes(site.links.linkedin)
    )
      issues.push('JSON-LD sameAs incomplete');
  } catch {
    issues.push('JSON-LD does not parse');
  }
  for (const page of PAGES) {
    const h = await (await fetch(`${BASE}${page}`)).text();
    if (!/<link rel="alternate" type="text\/markdown" href="\/portfolio\.md"/.test(h))
      issues.push(`${page} lacks markdown alternate link`);
  }
  if (!existsSync(join(ROOT, 'LLM_TEST.md'))) issues.push('LLM_TEST.md missing');
  fail(issues, 'gate10-llm.txt');
  return 'toggle, #glance, no motion, files and JSON-LD OK';
});

await gate(11, 'Fact audit checks', () => {
  const issues = [];
  const files = textFiles().filter((f) => /\.(html|md|txt|json)$/.test(f));
  const all = files.map((f) => ({
    f: f.slice(DIST.length),
    text: f.endsWith('.html') ? visibleText(read(f)) : read(f),
  }));
  for (const { f, text } of all) {
    if (/oncoguard/i.test(text)) issues.push(`${f}: mentions OncoGuard`);
    for (const w of ['passionate', 'leverage', 'cutting-edge', 'synergy'])
      if (new RegExp(w, 'i').test(text)) issues.push(`${f}: hype word "${w}"`);
    if (/\+?\d[\d ()-]{8,}\d/.test(text.replace(/\d{1,3}(?:\/\d{1,3})+/g, '')))
      issues.push(`${f}: looks like a phone number`);
    for (const s of sentences(text)) {
      if (/DermaTrack/.test(s) && /\b(built|build|launched|launch)\b/i.test(s))
        issues.push(`${f}: DermaTrack sentence says built/launched: "${s}"`);
      if (
        /biogas/i.test(s) &&
        /\b(achieved|increased|improved|resulted|delivered|reduced|grew|saved)\b/i.test(s)
      )
        issues.push(`${f}: BiogasBoosters result claim: "${s}"`);
      // The one sourced result: the owner confirmed the 33% is measured (DECISIONS D6).
      if (/33%/.test(s) && !/measured/i.test(s))
        issues.push(`${f}: 33% not labelled as the measured result: "${s}"`);
    }
  }
  const derma = read(join(DIST, 'projects/dermatrack.html'));
  if (!/designed/.test(visibleText(derma))) issues.push('DermaTrack page does not say "designed"');
  const audit = join(ROOT, 'FACT_AUDIT.md');
  if (!existsSync(audit)) issues.push('FACT_AUDIT.md missing');
  else if (/UNSOURCED/.test(read(audit))) issues.push('FACT_AUDIT.md lists unsourced claims');
  fail(issues, 'gate11-facts.txt');
  return `${files.length} files: no OncoGuard, DermaTrack "designed", Biogas: only the measured 33%`;
});

await gate(12, 'Fresh-eyes review', () => {
  const review = join(ROOT, 'REVIEW.md');
  must(existsSync(review), 'REVIEW.md missing (run the fresh-eyes subagent)');
  const open = read(review).match(/^- \[ \].*$/gm) ?? [];
  must(!open.length, `${open.length} open item(s): ${open[0]}`);
  return 'all findings resolved';
});

await browser?.close();
server?.close();
const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} gates passed${failed.length ? `; failed: ${failed.map((r) => r.id).join(', ')}` : ''}`,
);
process.exit(failed.length ? 1 : 0);

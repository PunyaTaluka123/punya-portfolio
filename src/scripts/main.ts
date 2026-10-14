// Progressive enhancement only: every piece of content is already in the HTML.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const systemDark = matchMedia('(prefers-color-scheme: dark)');

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      // Storage blocked (private mode): the choice lasts for this page only.
    }
  },
};

const isLLM = () => root.dataset['view'] === 'llm';
const isDark = () => (root.dataset['theme'] ?? (systemDark.matches ? 'dark' : 'light')) === 'dark';
const motionOK = () => !reduced.matches && !isLLM();

/* Background field: a dot grid modulated by a drifting wave, with a 5x5
   "kernel" window that slides across it like a convolution. ~1.5 KB. */
function createField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const GAP = 22;
  const K = 5;
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let dot = '';
  let accent = '';

  const colors = () => {
    const cs = getComputedStyle(canvas);
    dot = cs.color;
    accent = cs.outlineColor;
  };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = (t: number) => {
    if (!ctx) return;
    const cols = Math.ceil(w / GAP);
    const rows = Math.ceil(h / GAP);
    // Kernel position: steps one cell at a time, eased, scanning row by row.
    const span = Math.max(cols - K, 1);
    const pos = t / 650 + span * 6; // start a few rows down, clear of the small text
    const n = Math.floor(pos);
    const e = 1 - Math.pow(1 - (pos - n), 3);
    const step = n % span;
    const kxf = step + (step === span - 1 ? 0 : e);
    const kx = Math.round(kxf);
    const ky = Math.floor(n / span) % Math.max(rows - K, 1);
    ctx.clearRect(0, 0, w, h);
    for (let pass = 0; pass < 2; pass++) {
      ctx.fillStyle = pass ? accent : dot;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const inK = c >= kx && c < kx + K && r >= ky && r < ky + K;
          if (inK !== (pass === 1)) continue;
          const x = c * GAP + GAP / 2;
          const y = r * GAP + GAP / 2;
          const v =
            Math.sin(x * 0.011 + t * 0.00035) +
            Math.sin(y * 0.017 - t * 0.00027) +
            Math.sin((x + y) * 0.006 + t * 0.0002);
          const s = (v + 3) / 6;
          const size = 0.8 + s * s * (pass ? 4.2 : 3.4);
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }
    }
    // Kernel frame
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(kxf * GAP + 1, ky * GAP + 1, K * GAP - 2, K * GAP - 2);
  };
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop);
    if (t - last < 33) return; // ~30 fps is plenty for a slow field
    last = t;
    draw(t);
  };
  const running = () => motionOK() && onScreen && !document.hidden;
  const sync = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (isLLM()) return ctx?.clearRect(0, 0, w, h);
    if (running()) raf = requestAnimationFrame(loop);
    else draw(12000); // one still frame: final state, no motion
  };

  colors();
  resize();
  new ResizeObserver(() => {
    resize();
    sync();
  }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    onScreen = !!entry?.isIntersecting;
    sync();
  }).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  return {
    sync,
    recolor: () => {
      colors();
      sync();
    },
  };
}

/* Soft cursor follower: desktop with a fine pointer only. */
function createCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  document.body.append(el);
  const lerp = parseFloat(getComputedStyle(root).getPropertyValue('--m-cursor-lerp')) || 0.18;
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let raf = 0;
  const tick = () => {
    x += (tx - x) * lerp;
    y += (ty - y) * lerp;
    // The `translate` property, not `transform`: the hover `scale` is applied on top of
    // `transform`, which would multiply the position and fling the ring across the page.
    el.style.translate = `${x}px ${y}px`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(tick) : 0;
  };
  addEventListener(
    'pointermove',
    (e) => {
      if (!motionOK() || e.pointerType !== 'mouse') return el.classList.remove('on');
      if (!el.classList.contains('on')) {
        x = e.clientX;
        y = e.clientY;
      }
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add('on');
      el.classList.toggle('big', !!(e.target as Element | null)?.closest?.('a, button'));
      if (!raf) raf = requestAnimationFrame(tick);
    },
    { passive: true },
  );
  root.addEventListener('pointerleave', () => el.classList.remove('on'));
  return { sync: () => motionOK() || el.classList.remove('on') };
}

const canvas = document.querySelector<HTMLCanvasElement>('canvas.field');
let field: ReturnType<typeof createField> | null = null;
let cursor: ReturnType<typeof createCursor> = null;

/* Theme */
const themeBtn = document.getElementById('theme-toggle');
const syncTheme = () => {
  themeBtn?.setAttribute('aria-pressed', String(isDark()));
  // Browser UI colour follows a manual choice too, not only the system setting.
  const bg = getComputedStyle(document.body).backgroundColor;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute('content', bg));
  field?.recolor();
};
themeBtn?.addEventListener('click', () => {
  const apply = () => {
    root.dataset['theme'] = isDark() ? 'light' : 'dark';
    store.set('theme', root.dataset['theme']);
    syncTheme();
  };
  if (document.startViewTransition && motionOK()) document.startViewTransition(apply);
  else apply();
});
systemDark.addEventListener('change', syncTheme);

/* Human / LLM view */
const viewBtn = document.getElementById('view-toggle');
const glance = document.getElementById('glance');
const syncView = () => {
  const llm = isLLM();
  viewBtn?.setAttribute('aria-pressed', String(llm));
  glance?.toggleAttribute('hidden', !llm);
  field?.sync();
  cursor?.sync();
};
viewBtn?.addEventListener('click', () => {
  if (isLLM()) delete root.dataset['view'];
  else root.dataset['view'] = 'llm';
  store.set('view', isLLM() ? 'llm' : 'human');
  syncView();
  if (isLLM()) glance?.scrollIntoView({ block: 'start' });
});
reduced.addEventListener('change', syncView);

/* Copy as Markdown */
const copyBtn = document.getElementById('copy-md');
const copyStatus = document.getElementById('copy-status');
const markdown = () =>
  fetch('/portfolio.md').then((r) =>
    r.ok ? r.text() : Promise.reject(new Error(String(r.status))),
  );
copyBtn?.addEventListener('click', async () => {
  try {
    // Safari only allows clipboard writes started inside the click, so hand it a promise
    // instead of awaiting the fetch first.
    if ('ClipboardItem' in window)
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': markdown().then((t) => new Blob([t], { type: 'text/plain' })),
        }),
      ]);
    else await navigator.clipboard.writeText(await markdown());
    if (copyStatus) copyStatus.textContent = 'Copied the Markdown to your clipboard.';
  } catch {
    if (copyStatus) copyStatus.textContent = 'Copy failed. Open /portfolio.md instead.';
  }
});

/* View transition home → project: name only the clicked card's title, so the other
   (stacked, partly hidden) titles never float above the page mid-transition. */
// Back/forward can restore this page from the cache with a title still named; clear
// it so a later theme toggle doesn't lift that title above the stack.
addEventListener('pageshow', () => {
  for (const t of document.querySelectorAll<HTMLElement>('[data-vt]'))
    t.style.viewTransitionName = '';
});
addEventListener('pageswap', (e) => {
  const to = (e as PageSwapEvent).activation?.entry?.url;
  if (!(e as PageSwapEvent).viewTransition || !to) return;
  for (const title of document.querySelectorAll<HTMLElement>('[data-vt]'))
    if (title.querySelector('a')?.href === to)
      title.style.viewTransitionName = title.dataset['vt'] ?? '';
});

syncTheme();
syncView();

/* Start the decorative bits after load so they never compete with content. */
const later = (fn: () => void) =>
  'requestIdleCallback' in window
    ? requestIdleCallback(fn, { timeout: 1500 })
    : setTimeout(fn, 300);
const boot = () =>
  later(() => {
    if (canvas) field = createField(canvas);
    cursor = createCursor();
    syncView();
  });
if (document.readyState === 'complete') boot();
else addEventListener('load', boot, { once: true });

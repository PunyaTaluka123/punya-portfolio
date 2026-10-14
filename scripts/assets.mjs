// Renders the Open Graph image and PNG/ICO icons into public/.
// Run after changing the name or role line: node scripts/assets.mjs
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { site } from '../src/data/site.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const font = async (f) =>
  `data:font/woff2;base64,${(await readFile(`${root}src/assets/fonts/${f}`)).toString('base64')}`;
const svg = await readFile(`${root}public/favicon.svg`, 'utf8');
const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

const og = `<!doctype html><html><head><style>
@font-face{font-family:D;src:url(${await font('bricolage-grotesque-latin-wght.woff2')});font-weight:200 800}
@font-face{font-family:B;src:url(${await font('instrument-sans-latin-wght.woff2')});font-weight:400 700}
html{background:#f3f0e8}html,body{margin:0;width:1200px;height:630px;color:#141311;overflow:hidden}
body{position:relative;font-family:B;display:flex;flex-direction:column;justify-content:space-between;padding:56px 72px;box-sizing:border-box}
.dots{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(20,19,17,.22) 1.6px,transparent 2px);background-size:22px 22px}
.k{position:absolute;right:120px;top:120px;width:132px;height:132px;border:3px solid #b23a0a;background:radial-gradient(circle,#b23a0a 2.4px,transparent 2.8px) 0 0/22px 22px}
.rail{display:flex;justify-content:space-between;font:15px/1 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#5a554c;border-top:1px solid #cfc8b8;padding-top:14px}
h1{font-family:D;font-weight:780;font-size:150px;line-height:.9;letter-spacing:-.05em;margin:0}
h1 span{display:block;padding-left:1.1em}
p{font-size:34px;line-height:1.25;max-width:820px;margin:20px 0 0}
</style></head><body><div class="dots"></div><div class="k"></div>
<div class="rail"><span>Data Science + AI</span><span>${esc(site.school)}</span><span>Computer vision</span></div>
<div><h1>${esc(site.firstName)}<span>${esc(site.name.split(' ').slice(1).join(' '))}</span></h1><p>${esc(site.roleLine)}</p></div>
</body></html>`;

const icon = (size, pad) => `<!doctype html><html><body style="margin:0;background:transparent">
<div style="width:${size}px;height:${size}px;background:#f3f0e8;display:grid;place-items:center">
<div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div></body></html>`;

const browser = await chromium.launch();
const shot = async (html, w, h, out) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ path: out ? `${root}public/${out}` : undefined });
  await page.close();
  return buf;
};
await shot(og, 1200, 630, 'og.png');
await shot(icon(180, 18), 180, 180, 'apple-touch-icon.png');
await shot(icon(192, 0), 192, 192, 'icon-192.png');
await shot(icon(512, 52), 512, 512, 'icon-512.png');
const png32 = await shot(icon(32, 0), 32, 32);
await browser.close();

// favicon.ico = ICO header + one PNG entry (valid since Windows Vista).
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6);
ico.writeUInt8(32, 7);
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png32.length, 14);
ico.writeUInt32LE(22, 18);
await writeFile(`${root}public/favicon.ico`, Buffer.concat([ico, png32]));
console.log(
  'wrote og.png, icons, favicon.ico',
  (await readFile(`${root}public/og.png`)).length,
  'bytes og',
);

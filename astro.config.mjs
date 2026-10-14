// @ts-check
import { defineConfig } from 'astro/config';

// Set SITE_URL to the real domain when it exists (see README).
const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
  // Never inline scripts: CSP is script-src 'self' with no 'unsafe-inline'.
  // esbuild keeps animation-timeline as a longhand; the default minifier folds it into
  // the animation shorthand, which browsers reject.
  vite: { build: { assetsInlineLimit: 0, cssMinify: 'esbuild' } },
});

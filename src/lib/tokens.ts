// Reads the page background token so <meta name="theme-color"> and the web manifest
// use the same colours as tokens.css instead of a second copy.
import css from '../styles/tokens.css?raw';

const m = css.match(/--c-bg:\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/i);
if (!m?.[1] || !m[2]) throw new Error('tokens.css: --c-bg must be light-dark(#hex, #hex)');

export const themeColor = { light: m[1], dark: m[2] };

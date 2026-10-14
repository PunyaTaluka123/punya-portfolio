import type { APIRoute } from 'astro';

const bots = ['*', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];

export const GET: APIRoute = ({ site }) =>
  new Response(
    bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n') +
      `\nSitemap: ${new URL('/sitemap.xml', site).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );

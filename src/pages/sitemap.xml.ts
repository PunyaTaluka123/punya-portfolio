import type { APIRoute } from 'astro';
import { site as content } from '../data/site';

export const GET: APIRoute = ({ site }) => {
  const paths = ['/', ...content.projects.map((p) => `/projects/${p.slug}`), '/llm'];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};

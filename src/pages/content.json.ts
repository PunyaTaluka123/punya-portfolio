import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = ({ site: base }) => {
  const abs = (path: string) => new URL(path, base).href;
  const data = {
    ...site,
    url: abs('/'),
    projects: site.projects.map((p) => ({ ...p, url: abs(`/projects/${p.slug}`) })),
    files: {
      markdown: abs('/portfolio.md'),
      llmsTxt: abs('/llms.txt'),
      plainHtml: abs('/llm'),
    },
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

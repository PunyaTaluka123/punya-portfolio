import type { APIRoute } from 'astro';
import { site } from '../data/site';

// Format: https://llmstxt.org
export const GET: APIRoute = ({ site: base }) => {
  const abs = (path: string) => new URL(path, base).href;
  const body = [
    `# ${site.name}`,
    '',
    `> ${site.roleLine}`,
    '',
    `Contact: ${site.email}. GitHub: ${site.links.github}. LinkedIn: ${site.links.linkedin}.`,
    '',
    '## Full content',
    '',
    `- [Portfolio as Markdown](${abs('/portfolio.md')}): everything on the site in one file`,
    `- [Portfolio as JSON](${abs('/content.json')}): the same content as structured data`,
    `- [Plain HTML version](${abs('/llm')}): no scripts, no animation, plain text`,
    '',
    '## Pages',
    '',
    `- [Home](${abs('/')}): about, experience, projects, skills, contact`,
    ...site.projects.map((p) => `- [${p.name}](${abs(`/projects/${p.slug}`)}): ${p.oneLine}`),
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

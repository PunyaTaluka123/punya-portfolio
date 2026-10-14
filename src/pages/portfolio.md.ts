import type { APIRoute } from 'astro';
import { toMarkdown } from '../lib/markdown';

export const GET: APIRoute = ({ site }) =>
  new Response(toMarkdown(site!), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });

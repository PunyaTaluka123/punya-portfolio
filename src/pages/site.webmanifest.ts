import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { themeColor } from '../lib/tokens';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: site.firstName,
      description: site.description,
      start_url: '/',
      display: 'browser',
      background_color: themeColor.light,
      theme_color: themeColor.light,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );

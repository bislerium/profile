import type { APIRoute } from 'astro';
import { LINKS } from 'src/pages/portfolio/_constants';

export const GET: APIRoute = ({ site }) => {
  if (!site) return new Response(null, { status: 500 });

  const sitemapURL = new URL('sitemap-index.xml', site).href;
  const body = `User-agent: *
Allow: /
Disallow: ${LINKS.cv}

Sitemap: ${sitemapURL}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

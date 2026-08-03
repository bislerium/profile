import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  if (!site) return new Response(null, { status: 500 });

  const sitemapURL = new URL('sitemap-index.xml', site).href;
  const body = `User-agent: *
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=no

Sitemap: ${sitemapURL}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

import { SITE, LINKS } from '../constants';

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: ${LINKS.cv}

Sitemap: ${SITE.url}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}

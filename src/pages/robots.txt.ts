import { SITE } from '../constants';

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /assets/cv.pdf

Sitemap: ${SITE.url}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}

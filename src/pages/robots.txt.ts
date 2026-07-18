export async function GET({ site }: { site: URL }) {
  const body = `User-agent: *
Allow: /
Disallow: /assets/cv.pdf

Sitemap: ${site}${site.pathname.endsWith('/') ? '' : '/'}sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}

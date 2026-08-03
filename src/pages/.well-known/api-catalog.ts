import type { APIRoute } from 'astro';
import { SITE } from '../portfolio/_constants';

export const GET: APIRoute = () => {
  const body = JSON.stringify({
    linkset: [
      {
        anchor: SITE.url,
        profile: 'https://www.rfc-editor.org/rfc/rfc9727',
        'service-doc': `${SITE.url}/llms.txt`,
      },
    ],
  });

  return new Response(body, {
    headers: { 'Content-Type': 'application/linkset+json' },
  });
};

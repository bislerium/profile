import { PERSON, PAGE } from '../constants';

export async function GET() {
  const manifest = {
    name: PERSON.fullName,
    short_name: PERSON.firstName,
    description: PAGE.description,
    start_url: '/',
    scope: '/',
    id: 'bishalgc-portfolio',
    display: 'standalone',
    lang: 'en',
    dir: 'ltr',
    categories: ['productivity', 'lifestyle'],
    background_color: '#512bd4',
    icons: [
      { src: '/assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/assets/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/icons/maskable-icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/assets/icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}

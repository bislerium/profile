import type { APIRoute } from 'astro';
import { SITE, PERSON, PAGE } from 'src/pages/portfolio/_constants';

export const GET: APIRoute = () => {
  const manifest = {
    name: PERSON.fullName,
    short_name: PERSON.firstName,
    description: PAGE.description,
    start_url: '/',
    scope: '/',
    id: `${PERSON.shortName.toLowerCase().replace(/\s/g, '')}-portfolio`,
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'natural',
    lang: 'en',
    dir: 'ltr',
    categories: ['productivity', 'lifestyle'],
    background_color: SITE.themeColor,
    screenshots: [
      {
        src: '/assets/screenshots/screenshot-narrow-light.png',
        sizes: '824x1830',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Portfolio homepage on mobile — light theme',
      },
      {
        src: '/assets/screenshots/screenshot-narrow-dark.png',
        sizes: '824x1830',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Portfolio homepage on mobile — dark theme',
      },
      {
        src: '/assets/screenshots/screenshot-wide-light.png',
        sizes: '2560x1440',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Portfolio homepage on desktop — light theme',
      },
      {
        src: '/assets/screenshots/screenshot-wide-dark.png',
        sizes: '2560x1440',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Portfolio homepage on desktop — dark theme',
      },
    ],
    icons: [
      { src: '/assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/assets/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/icons/maskable-icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/assets/icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}

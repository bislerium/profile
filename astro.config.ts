import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/pages/portfolio/_constants';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      namespaces: { news: false, xhtml: false, image: false, video: false },
      serialize(item) {
        item.lastmod = new Date('2026-08-03').toISOString();
        return item;
      },
    }),
  ],
});

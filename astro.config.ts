import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/constants';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  build: {
    format: 'file',
    assets: 'astro',
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      namespaces: { news: false, xhtml: false, image: false, video: false },
    }),
  ],
});

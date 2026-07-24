import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import { SITE } from './src/pages/portfolio/_constants';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: SITE.url,
  trailingSlash: 'never',
  build: {
    format: 'file',
    assets: 'astro',
    inlineStylesheets: 'always',
  },
  vite: {
    resolve: {
      alias: {
        src: new URL('./src', import.meta.url).pathname,
      },
    },
  },
  integrations: [
    sitemap({
      namespaces: { news: false, xhtml: false, image: true, video: false },
      serialize(item) {
        item.lastmod = new Date().toISOString();
        item.changefreq = ChangeFreqEnum.MONTHLY;
        item.priority = 1.0;
        return item;
      },
    }),
  ],
});

// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://bishalgc.info.np',
  trailingSlash: 'never',
  build: {
    format: 'file',
    assets: 'astro',
  },
});

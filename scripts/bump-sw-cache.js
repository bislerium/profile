// Auto-bumps the cache version in public/sw.js based on content that affects
// the service worker's correctness. Runs as a prebuild step.
//
// Files hashed:
//   public/sw.js        – SW logic, strategies, precache URLs
//   astro.config.mjs    – build.assets controls the path prefix the SW checks
//
// Anything else (components, styles, pages) produces content-hashed filenames
// via Astro and self-busts — no need to include them here.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const swPath = resolve(root, 'public', 'sw.js');
const configPath = resolve(root, 'astro.config.mjs');

let swContent = readFileSync(swPath, 'utf-8');
const configContent = readFileSync(configPath, 'utf-8');

// Hash SW logic (minus the current cache name) + astro config
const strippedSW = swContent.replace(/^const CACHE_NAME = '.*';$/m, '');
const hash = createHash('sha256')
  .update(strippedSW)
  .update(configContent)
  .digest('hex');

swContent = swContent.replace(
  /^const CACHE_NAME = '.*';$/m,
  `const CACHE_NAME = 'bishalgc-${hash}';`,
);

writeFileSync(swPath, swContent);
console.log(`SW cache version → bishalgc-${hash}`);

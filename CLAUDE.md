# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Bishal Gharti Chhetri, deployed at `bishalgc.info.np` via GitHub Pages with Cloudflare CDN.

**Stack:** Astro 7 + TypeScript (strict), Vanilla CSS, static generation, GitHub Actions deploy.

No linter or test runner configured — this is a single-page portfolio.

## Project structure

```text
src/
  constants.ts          # SITE, LINKS, PERSON, PAGE — single source of truth for all metadata
  layouts/
    BaseLayout.astro    # <head> with all meta, OG, Twitter, favicons, JSON-LD, CSP, GA
  pages/
    index.astro          # Single-page site — composes components into <main>
    404.astro            # Custom 404 error page with BaseLayout + inline styles
    sitemap.xml.ts       # Dynamic sitemap endpoint (lastmod + changefreq)
    robots.txt.ts        # Robots endpoint (disallows /assets/cv.pdf)
    llms.txt.ts          # LLMs.txt endpoint for AI crawlers
    site.webmanifest.ts  # Dynamic PWA manifest endpoint
  components/
    IndexHeader.astro   # Decorative div with logo (not a landmark)
    NameBlock.astro     # h1 — name with TextScramble effect
    TechStack.astro     # aside — stack list
    SectionDivider.astro # hr — decorative gradient rule
    MetaBlock.astro     # section — role + highlighted tagline (set:html)
    LinksBlock.astro    # nav — GitHub, LinkedIn, CV links
    Footer.astro        # footer — Clock + availability dot + offline indicator
    SkipLink.astro      # Skip-to-main accessibility link
    ProgressBar.astro   # Decorative scroll indicator (aria-hidden)
  scripts/
    init.ts             # Boots TextScramble + Clock + SW + offline banner (imports PERSON.nameParts)
    text-scramble.ts    # Animated text reveal (respects prefers-reduced-motion)
    clock.ts  # Live clock widget using Intl.DateTimeFormat (imports PERSON.timezone, clockLabel)
  styles/               # 8 CSS files — 1 font-face + 7 @layer (see CSS architecture below)
design/
  logo/square/          # Source logo files (logo-square.svg, .png, .graphite)
public/
  favicon.ico            # Root favicon (Googlebot fallback, duplicated from assets/icons/)
  sw.js                  # Service worker — cache-first for /astro/, network-first for navigation + /assets/
  assets/
    icons/              # 16 generated favicon/app-icon files
    logo/square/        # Public logo (logo.svg for header, logo.png for JSON-LD/OG)
    og-image.png        # 1200×630 OG card image (8-bit colormap PNG, ~440 KB)
  fonts/
    switzer/            # 4 woff2 weights — 400, 500, 600, 700
    jetbrains-mono/     # 4 woff2 weights — 400, 500, 600, 700
scripts/
  generate-icons.py     # Reproducible icon generation from design/logo/square/logo-square.svg
  bump-sw-cache.js      # Auto-bumps SW cache version before each build (hashes sw.js + astro.config.ts)
```

## Centralized constants

`src/constants.ts` is the **single source of truth** for all site metadata. There are 6 exports — never hardcode a name, URL, title, color, or tech item anywhere else.

```ts
// Site-level config — URL, analytics, brand
export const SITE = {
  url: 'https://bishalgc.info.np',
  gaId: 'G-CGXSWDPMTW',
  themeColor: '#512bd4',
} as const;

// Outbound links — used in LinkBlock, LLMs.txt, robots.txt, JSON-LD
export const LINKS = {
  github: 'https://github.com/bislerium',
  linkedin: 'https://www.linkedin.com/in/bishalgc/',
  cv: '/assets/cv.pdf',
} as const;

// Personal info — cascades through every page, meta tag, schema, and endpoint
export const PERSON = {
  fullName: 'Bishal Gharti Chhetri',
  firstName: 'Bishal',
  lastName: 'Gharti Chhetri',
  nameParts: ['Bishal', 'Gharti', 'Chhetri'],
  shortName: 'Bishal GC',
  jobTitle: 'Software Engineer',
  location: 'Kathmandu',
  country: 'NP',
  countryName: 'Nepal',
  timezone: 'Asia/Kathmandu',
  clockLabel: 'Kathmandu, Nepal',
} as const;

// Tech stack — one array drives TechStack.astro, JSON-LD knowsAbout, PAGE.description, llms.txt
export const TECH_STACK = [
  'C#',
  '.NET',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Git',
] as const;

// Page metadata — built from PERSON and TECH_STACK
export const PAGE = {
  title: `${PERSON.fullName} • ${PERSON.jobTitle}`,
  description: `${PERSON.jobTitle} based in ${PERSON.location}, ${PERSON.countryName}. ${TECH_STACK.join(', ')}. ...`,
  tagline: 'Optimizing code and architecture. ...',
  taglineHighlights: ['code', 'architecture'],
} as const;

export const OG_IMAGE_ALT = `${PERSON.fullName} • ${PERSON.jobTitle} portfolio`;
```

All derived strings are template literals built from `PERSON` and `TECH_STACK` fields. Changing a value in `PERSON` or `TECH_STACK` cascades through `<meta>`, OG, Twitter, JSON-LD, `llms.txt`, the PWA manifest, the service worker, the clock widget, and the TextScramble animation automatically.

The Astro config `site` field in `astro.config.ts` imports `SITE.url` directly — no manual sync needed.

## CSS architecture

8 CSS files imported in order via `src/styles/index.css` (loaded in `BaseLayout.astro` frontmatter via `import '../styles/index.css'`):

| File | Layer | Purpose |
| --- | --- | --- |
| `00-fonts.css` | — (no layer) | `@font-face` declarations for self-hosted Switzer + JetBrains Mono (woff2, `font-display: swap`) |
| `01-reset.css` | `reset` | Box-sizing, margin/padding zero, `text-wrap: balance/pretty` |
| `02-base.css` | `base` | Custom properties (OKLCH colors, fluid `clamp()` spacing), `:root`/`body`, `::selection`, `:focus-visible` |
| `03-theme.css` | `theme` | Reusable utility classes (`.highlight`, `.label`) |
| `04-layout.css` | `layout` | 12-column CSS Grid layout with named grid rows, subgrid footer, responsive padding |
| `05-components.css` | `components` | Self-contained widgets (`.progress-bar`, `.status-dot`, `.status-offline`) |
| `06-motion.css` | `motion` | `@keyframes` (fadeUp, fadeIn, scaleX, breathe, progressFill/Fade) and staggered entry animations, respects `prefers-reduced-motion` |
| `07-overrides.css` | `overrides` | Skip-link utility, container queries (`@container page`), media queries (768/480/360px), print styles |

All `@font-face` rules live in `00-fonts.css` (no layer) so they're always in the global scope. The 7 numbered files each get a cascade layer matching their name.

The build inlines all CSS into the HTML (`build.inlineStylesheets: 'always'`), so there are zero external stylesheet requests at runtime.

**Important:** CSS must be imported in frontmatter (`import`), NOT inside a `<style>` tag — Astro scopes `<style>` selectors with `[data-astro-cid]` which breaks matching on child elements.

## JavaScript

Two vanilla classes in `src/scripts/`, typed with TypeScript, bundled by Astro and inlined into the HTML:

- **`TextScramble`** — Animated text reveal using random character scrambling from a fixed character set. In `setText()`, uses `requestAnimationFrame` to cycle through random characters at ~28% change rate per frame. Respects `prefers-reduced-motion` by skipping animation entirely. Applied to `.name-line` elements on load. Uses `innerText` (reads rendered text including any prior scramble state) to capture the current text. Source: `src/scripts/text-scramble.ts`.
- **`Clock`** — Live clock in footer showing Asia/Kathmandu time with UTC offset (e.g. "Kathmandu, Nepal · 2:30 PM · GMT+5:45"). Uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kathmandu'` and `formatToParts()` for timezone extraction. Updates every 60s. Includes a `destroy()` method to stop the interval — not currently called since the clock lives for the page lifetime. Source: `src/scripts/clock.ts`.

Init in `init.ts` is loaded via a `<script>` tag in `index.astro`. It also registers the service worker (`/sw.js`) and sets up an offline banner (PWA standalone mode only, toggled by `online`/`offline` events).

## Icons and favicons

16 icon files in `public/assets/icons/` covering all platforms:

| Files | Platform |
| --- | --- |
| `favicon.svg` | Modern SVG favicon (Firefox, Chrome 80+) |
| `favicon.ico` | Multi-res ICO (16×16, 32×32, 48×48) — legacy IE |
| `favicon-{16,32,96}.png` | PNG fallbacks |
| `apple-touch-icon-{120,152,167,180}.png` | iOS home screen (all sizes) |
| `icon-{192,384,512}.png` | Android Chrome / PWA |
| `maskable-icon-{192,512}.png` | Android adaptive icons (80% safe zone) |
| `mstile-150x150.png` | Windows 8/10 tile |

Regenerate all icons from the source logo by running:

```bash
python3 scripts/generate-icons.py
```

This reads `design/logo/square/logo-square.svg` and outputs all sizes to `public/assets/icons/` plus the OG image to `public/assets/og-image.png`.

**Note:** Pillow 12.3.0's ICO reader reports only 1 frame, but the generated `favicon.ico` actually contains 3 frames — verify with the `file` command instead.

## Logo

Source files live in `design/logo/square/`:

- `logo-square.graphite` — editable source (Graphite app)
- `logo-square.svg` — vector export (8 KB)
- `logo-square.png` — raster export (16 KB)

Public copies are in `public/assets/logo/square/` as `logo.svg` and `logo.png`. The circle variant has been removed — only the square logo is used site-wide.

## Service Worker

`public/sw.js` provides offline support with a three-tier caching strategy:

| Path pattern | Strategy | Rationale |
| --- | --- | --- |
| Navigation (`request.mode === 'navigate'`) | Network-first, cache fallback | Always serve fresh HTML; fall back to cache or `/` when offline |
| `/astro/*` (hashed build assets) | Cache-first | Content-hashed filenames are immutable — safe to cache indefinitely |
| `/assets/*` (icons, logos, OG image, CV) | Network-first | Fixed URLs that may change across deploys |

- Precaches `/` on install, cleans old cache versions on activate
- Max 50 cache entries, LRU eviction (drops oldest entries)
- Does NOT call `clients.claim()` — existing tabs keep their current SW until reload to prevent mid-session cache invalidation
- **Known gap:** `/fonts/*` paths are NOT cached by the SW. Font files (~208 KB across 8 woff2 files) are re-fetched on every page load. Fonts follow the same-origin rule but the SW has no handler for the `/fonts/` path prefix.
- Cache version is auto-bumped by `scripts/bump-sw-cache.js` (hashes `sw.js` content + `astro.config.ts` with SHA-256)

## Deployment

GitHub Actions deploys to GitHub Pages with Cloudflare CDN in front.

The prebuild hook (`node scripts/bump-sw-cache.js`) auto-bumps the SW cache version, then `astro build` inlines all CSS and JS into a single HTML file (~29 KB). Total `dist/` size is ~920 KB (dominated by the OG image at ~440 KB and fonts at ~208 KB).

`.nojekyll` in `public/` prevents GitHub Pages from running Jekyll on the built output (which would ignore `_astro/` prefixed directories).

CI triggers on pushes to `main` for changes to `src/`, `public/`, `astro.config.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, or the workflow itself. Also supports `workflow_dispatch` for manual deploys.

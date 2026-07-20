# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Bishal Gharti Chhetri, deployed at `bishalgc.info.np` via GitHub Pages with Cloudflare CDN.

**Stack:** Astro 7 + TypeScript (strict), Vanilla CSS, static generation, GitHub Actions deploy.

No linter or test runner configured — this is a single-page portfolio.

## Project structure

```
src/
  constants.ts          # SITE, LINKS, PERSON, PAGE — single source of truth for all metadata
  layouts/
    BaseLayout.astro    # <head> with all meta, OG, Twitter, favicons, JSON-LD
  pages/
    index.astro          # Single-page site — composes components into <main>
    sitemap.xml.ts       # Dynamic sitemap endpoint (lastmod + changefreq)
    robots.txt.ts        # Robots endpoint (disallows /assets/cv.pdf)
    llms.txt.ts          # LLMs.txt endpoint for AI crawlers
    site.webmanifest.ts  # Dynamic PWA manifest endpoint
  components/
    IndexHeader.astro   # Decorative div (not a landmark)
    NameBlock.astro     # h1 — name with TextScramble effect
    TechStack.astro     # aside — stack list
    SectionDivider.astro # hr
    MetaBlock.astro     # section — role + description
    LinksBlock.astro    # nav — GitHub, LinkedIn, CV links
    Footer.astro        # footer — KathmanduClock + availability dot
    SkipLink.astro      # Skip-to-main accessibility link
    ProgressBar.astro   # Decorative scroll indicator
  scripts/
    init.ts             # Boots TextScramble + KathmanduClock + SW + offline banner
    text-scramble.ts    # Animated text reveal (respects prefers-reduced-motion)
    kathmandu-clock.ts  # Live Asia/Kathmandu clock footer widget
  styles/               # 7 @layer CSS files (see CSS architecture below)
design/
  logo/square/          # Source logo files (logo-square.svg, .png, .graphite)
public/
  assets/
    icons/              # 16 generated favicon/app-icon files
    logo/square/        # Public logo (used by og:logo meta tag)
    og-image.png        # 1200×630 OG card image
scripts/
  generate-icons.py     # Reproducible icon generation from design/logo/square/logo-square.svg
  bump-sw-cache.js      # Auto-bumps SW cache version before each build
```

## Centralized constants

`src/constants.ts` is the **single source of truth** for all site metadata. Every string in the site derives from four grouped objects — never hardcode a name, URL, title, or description anywhere else.

```ts
export const SITE = {
  url: 'https://bishalgc.info.np',
  gaId: 'G-CGXSWDPMTW',
} as const;

export const LINKS = {
  github: 'https://github.com/bislerium',
  linkedin: 'https://www.linkedin.com/in/bishalgc/',
} as const;

export const PERSON = {
  fullName: 'Bishal Gharti Chhetri',
  firstName: 'Bishal',
  lastName: 'Gharti Chhetri',
  shortName: 'Bishal GC',
  jobTitle: 'Software Engineer',
  location: 'Kathmandu',
  country: 'NP',
} as const;

export const PAGE = {
  title: `${PERSON.fullName} • ${PERSON.jobTitle}`,
  description: `${PERSON.jobTitle} based in ${PERSON.location}, Nepal. ...`,
} as const;
```

All derived strings (`PAGE.title`, `PAGE.description`, `OG_IMAGE_ALT`) are template literals built from `PERSON` fields. Changing a value in `PERSON` cascades through `<meta>`, OG, Twitter, JSON-LD, `llms.txt`, and the PWA manifest automatically.

The Astro config `site` field in `astro.config.ts` imports `SITE.url` directly — no manual sync needed.

## CSS architecture

7 `@layer` files imported globally in `BaseLayout.astro` frontmatter (`import '../styles/index.css'`):

| Layer         | Purpose                                                    |
|---------------|------------------------------------------------------------|
| `reset`       | Box-sizing, margin/padding zero                            |
| `base`        | Custom properties (colors, fonts, fluid `clamp()` spacing), `:root`/`body` |
| `theme`       | Reusable utility classes (`.highlight`, `.label`)          |
| `layout`      | 12-column CSS Grid layout, named grid rows, responsive     |
| `components`  | Self-contained widgets (`.progress-bar`, `.status-dot`)    |
| `motion`      | `@keyframes` and staggered animation rules, respects `prefers-reduced-motion` |
| `overrides`   | Container queries (`@container page`), media queries (768/480/360px), print styles |

**Important:** CSS must be imported in frontmatter (`import`), NOT inside a `<style>` tag — Astro scopes `<style>` selectors with `[data-astro-cid]` which breaks matching on child elements.

## JavaScript

Two vanilla classes in `src/scripts/`, typed with TypeScript, bundled by Astro:

- **`TextScramble`** — Animated text reveal effect using random character scrambling. Respects `prefers-reduced-motion`. Applied to `.name-line` elements on load. Source: `src/scripts/text-scramble.ts`.
- **`KathmanduClock`** — Live clock in footer showing Asia/Kathmandu time with UTC offset. Updates every 60s via `Intl.DateTimeFormat`. Source: `src/scripts/kathmandu-clock.ts`.

Init in `init.ts` is loaded via a `<script>` tag in `index.astro`.

## Icons and favicons

16 icon files in `public/assets/icons/` covering all platforms:

| Files | Platform |
|---|---|
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

## Deployment

GitHub Actions deploys to GitHub Pages. Cloudflare sits in front. `build.assets: 'astro'` in `astro.config.ts` avoids underscore prefix that GitHub Pages would otherwise block.

`.nojekyll` in `public/` prevents GitHub Pages from running Jekyll on the built output (which would ignore `_astro/` prefixed directories).

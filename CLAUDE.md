# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Bishal Gharti Chhetri, deployed at `bishalgc.info.np` via GitHub Pages with Cloudflare CDN.

**Stack:** Astro 5 + TypeScript (strict), Vanilla CSS, static generation, GitHub Actions deploy.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Build static site to dist/
npm run preview   # Preview the built site locally
```

No linter or test runner configured — this is a single-page portfolio.

## Repository structure

```
src/
  layouts/BaseLayout.astro    # <head>, SEO/OG/JSON-LD, fonts, global CSS import
  components/                 # 9 Astro components (SkipLink through Footer)
  pages/
    index.astro               # Composes all components in BaseLayout
    404.astro                 # Simple 404 page
  styles/
    index.css                 # Imports all layers in order
    01-reset.css — 07-overrides.css  # @layer split (see CSS architecture)
  scripts/
    text-scramble.ts          # TextScramble class
    kathmandu-clock.ts        # KathmanduClock class
    init.ts                   # DOM init: selects .name-line, #kathmandu-clock
public/                       # Static files copied verbatim to dist/
  CNAME                       # bishalgc.info.np
  robots.txt                  # Disallows /assets/cv.pdf
  sitemap.xml
  llms.txt                    # AI crawler info (llmstxt.org spec)
  .nojekyll                   # Prevents GitHub Pages from ignoring _-prefix dirs
  assets/                     # CV PDF, OG image, favicons, logo PNGs/SVGs
design/                       # Source .drawio files (not deployed)
.github/workflows/deploy.yml  # GitHub Actions → GitHub Pages
astro.config.mjs              # site URL, trailingSlash, build format/assets
```

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

- **`TextScramble`** — Animated text reveal effect using random character scrambling. Respects `prefers-reduced-motion`. Applied to `.name-line` elements on load.
- **`KathmanduClock`** — Live clock in footer showing Asia/Kathmandu time with UTC offset. Updates every 60s via `Intl.DateTimeFormat`.

Init in `init.ts` is loaded via a `<script>` tag in `index.astro`.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`):
- **Trigger:** push to `main` (ignores `design/`, `CLAUDE.md`, `LICENSE`, `.vscode/`, `.gitignore`)
- **Build:** `npm ci` → `npm run build` → upload `dist/` artifact
- **Deploy:** `actions/deploy-pages@v4` to GitHub Pages
- **Concurrency:** cancels in-progress runs on subsequent pushes
- **Custom domain:** `CNAME` in `public/` → ends up in `dist/`
- **Cache:** Cloudflare sits in front; `build.assets: 'astro'` avoids underscore prefix that GitHub Pages would block

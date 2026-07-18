# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Bishal Gharti Chhetri, deployed at `bishalgc.info.np` via GitHub Pages with Cloudflare CDN.

**Stack:** Astro 7 + TypeScript (strict), Vanilla CSS, static generation, GitHub Actions deploy.

No linter or test runner configured — this is a single-page portfolio.

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

GitHub Actions deploys to GitHub Pages. Cloudflare sits in front. `build.assets: 'astro'` in `astro.config.mjs` avoids underscore prefix that GitHub Pages would otherwise block.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-page personal portfolio site for Bishal Gharti Chhetri, deployed at `bishalgc.info.np` via GitHub Pages. Static HTML with embedded CSS and vanilla JS — no build tools, frameworks, or package manager.

## Repository structure

```text
index.html        # The entire site: HTML, CSS, and JS in one file
assets/
  cv.pdf          # Downloadable CV
  icons/          # Favicon and PWA icons
  logo/           # Logo variants (square, circle) in PNG, SVG, and drawio source
  og-image.png    # Open Graph / Twitter card image
CNAME             # Custom domain: bishalgc.info.np
llms.txt          # AI crawler info (llmstxt.org spec)
robots.txt        # Disallows /assets/cv.pdf from crawlers
sitemap.xml       # Single-entry sitemap for the root URL
```

## CSS architecture

CSS is organized in `@layer` order within `index.html`:

| Layer         | Purpose                                                    |
|---------------|------------------------------------------------------------|
| `reset`       | Minimal CSS reset (box-sizing, margin/padding zero)        |
| `base`        | Custom properties (colors, fonts, spacing), `:root`/`body` |
| `theme`       | Reusable utility classes (`.highlight`, `.label`)          |
| `layout`      | CSS Grid layout (`.page`, header, name block, footer, etc.)|
| `components`  | Self-contained widgets (`.progress-bar`, `.status-dot`)    |
| `motion`      | `@keyframes` and animation application rules               |
| `overrides`   | Container queries, media queries, print styles             |

The grid uses a 12-column layout via `grid-template-columns: repeat(12, 1fr)` with named grid rows. Responsive breakpoints collapse to a single-column layout at 768px.

Custom properties use fluid typography via `clamp()` and viewport-relative spacing via `dvh`/`dvw` units.

## JavaScript

Two self-contained ES module classes in the embedded `<script type="module">`:

- **`TextScramble`** — Animated text reveal effect. Scrambles characters between random symbols before settling on the target text. Respects `prefers-reduced-motion`. Used for the name lines on load.

- **`KathmanduClock`** — Live clock in the footer displaying current time in Asia/Kathmandu timezone with UTC offset. Updates every 60 seconds.

## Deployment

Deployed via GitHub Pages on the `main` branch. The `CNAME` file configures the custom domain `bishalgc.info.np`. No build step — push to `main` and GitHub Pages serves the files directly.

## SEO / metadata

- Structured data (JSON-LD `Person` schema) embedded in `<head>`
- Open Graph and Twitter Card meta tags
- `llms.txt` follows the [llmstxt.org](https://llmstxt.org) spec for AI crawler guidance
- Canonical URL set to `https://bishalgc.info.np`

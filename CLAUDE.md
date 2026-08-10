# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Bishal Gharti Chhetri, deployed at `bishalgc.info.np` via GitHub Pages with Cloudflare CDN.

**Stack:** Astro 7 + TypeScript (strict), Vanilla CSS, static generation, GitHub Actions deploy.

No linter or test runner configured — this is a single-page portfolio.

## Project structure

```text
src/
  layouts/
    BaseLayout.astro    # <head> with all meta, OG, Twitter, favicons, JSON-LD, CSP, GA
  pages/
    index.astro          # Single-page portfolio at / — imports from ./portfolio/
    portfolio/           # All index-specific supporting files (_ prefix = excluded from routing)
      _constants.ts     # SITE, LINKS, PERSON, STACK, STACK_NAMES, PAGE, OG_IMAGE_ALT — single source of truth
      _ga-events.ts     # GA4 custom event dispatch (cv_click, github_click, linkedin_click, stack_expand, accessibility_preference)
      _init.ts          # Boots TextScramble + Clock + stack toggle + delegated GA4 click listener
      styles/           # Page-level CSS (layout, components, motion)
        index.css       # Entry point — imports layout, components, motion
        layout.css      # Grid layout + component positioning (was 04-layout.css)
        components.css  # Progress bar, status dot (was 05-components.css)
        motion.css      # @keyframes + staggered entry animations (was 06-motion.css)
        overrides.css   # Skip-link, container/media queries, print, high-contrast (was 07-overrides.css)
      _components/
        Header/         # Header.astro — decorative div with logo (not a landmark)
        Name/           # Name.astro + text-scramble.ts — h1 with animated text reveal
        Stack/          # Stack.astro + stack-toggle.ts — hierarchical stack list
        Divider/        # Divider.astro — animated sine-wave SVG squiggle
        Meta/           # Meta.astro — role + highlighted tagline
        Links/          # Links.astro — nav for GitHub, LinkedIn, CV
        Footer/         # Footer.astro + clock.ts — clock widget + availability dot
        Progress/       # Progress.astro — decorative load indicator
        SkipLink/       # SkipLink.astro — skip-to-main accessibility link
    404.astro           # Custom 404 error page with BaseLayout + inline styles
    robots.txt.ts        # Robots endpoint with Content-Signal headers, CV now allowed
    llms.txt.ts          # LLMs.txt endpoint with CV link for AI crawlers
    site.webmanifest.ts  # Dynamic PWA manifest endpoint
  styles/               # 4 shared CSS files — 1 font-face + 3 @layer
workers/
  markdown-for-agents.js # Cloudflare Worker: HTML→markdown via turndown + linkedom
design/
  logo/square/          # Source logo files (logo-square.svg, .png, .graphite)
public/
  favicon.ico            # Root favicon (Googlebot fallback, duplicated from assets/icons/)
  assets/
    icons/              # 16 generated favicon/app-icon files
    screenshots/        # 4 PWA screenshots (narrow/wide × light/dark), generated via npm run screenshots
    logo/square/        # Public logo (logo.svg for header, logo.png for JSON-LD/OG)
    og-image.png        # 1200×630 OG card image (8-bit colormap PNG, ~440 KB)
  fonts/
    switzer/            # 2 woff2 weights — 400, 600
    jetbrains-mono/     # 2 woff2 weights — 400, 600
scripts/
  generate-icons.py        # Reproducible icon generation from design/logo/square/logo-square.svg
  generate-screenshots.js  # Playwright-based PWA screenshot capture (npm run screenshots)
wrangler.toml           # Cloudflare Worker config (markdown-for-agents)
```

## Centralized constants

`src/pages/portfolio/_constants.ts` is the **single source of truth** for all site metadata. There are 7 exports — never hardcode a name, URL, title, color, or tech item anywhere else.

```ts
// Site-level config — URL, analytics, brand, theme colors
export const SITE = {
  url: 'https://bishalgc.info.np',
  gaId: 'G-CGXSWDPMTW',
  themeColor: '#512bd4',
  themeColorDark: '#0a0a0f',
  themeColorLight: '#f7f7f5',
} as const;

// Outbound links — used in Links, LLMs.txt, robots.txt, JSON-LD
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

// Stack — hierarchical structure drives Stack.astro, JSON-LD knowsAbout, PAGE.description, llms.txt
export const STACK = [
  {
    name: 'Backend',
    items: [
      'C#, .NET 6/7/8/9/10',
      'ASP.NET Core Web APIs (Controller-based, Minimal, gRPC)',
      'SignalR',
      'Aspire',
      'Jobs (Fire & Forget, Delayed, Scheduled, Recurring)',
    ],
  },
  { name: 'Databases', items: ['PostgreSQL, MongoDB', 'Common Table Expressions (CTEs), Recursive CTEs', 'Table-Valued Functions (TVFs)', 'Stored Procedures (SPs)', 'Views, Materialized Views (MVs)', 'Full-Text Search: tsvector/tsquery, pg_trgm', 'Scheduled Jobs (pg_cron)'] },
  { name: 'Frontend', items: ['Blazor, .NET MAUI Blazor Hybrid', 'HTML, CSS, JavaScript, TypeScript'] },
  { name: 'Cloud & Infrastructure', items: ['AWS: S3, Lambda, SQS, SNS, EventBridge, DynamoDB, RDS, EC2, Fargate, EFS, DMS, CloudWatch, Parameter Store', 'Docker, Docker Compose', 'Git, GitHub, GitLab'] },
  { name: 'Architecture & Design', items: ['Clean Architecture, Domain-Driven Design (DDD), CQRS, Dependency Injection', 'Chain of Responsibility, Mediator, Strategy, Resolver, Singleton, Factory, Builder, Facade, Bridge', 'Transactional Outbox, Saga, Two-Phase Commit (2PC)', 'SOLID, DRY, KISS, YAGNI, SoC'] },
  { name: 'Observability', items: ['OpenTelemetry', 'Prometheus', 'Grafana (Loki, Tempo)', 'Jaeger'] },
] as const;

export const STACK_NAMES = STACK.map(category => category.name);

// Page metadata — built from PERSON and STACK_NAMES
export const PAGE = {
  title: `${PERSON.fullName} - ${PERSON.jobTitle}`,
  description: `${PERSON.jobTitle} based in ${PERSON.location}, ${PERSON.countryName}. ${STACK_NAMES.join(', ')}. Building scalable systems with precision, performance, and purpose.`,
  tagline: 'Optimizing code and architecture. Building scalable systems with precision, performance, and purpose.',
  taglineHighlights: ['code', 'architecture'],
} as const;

export const OG_IMAGE_ALT = `${PERSON.fullName} • ${PERSON.jobTitle} portfolio`;
```

All derived strings are template literals built from `PERSON` and `STACK` fields. Changing a value in `PERSON` or `STACK` cascades through `<meta>`, OG, Twitter, JSON-LD, `llms.txt`, the PWA manifest (including screenshots), the clock widget, and the TextScramble animation automatically.

The Astro config `site` field in `astro.config.ts` imports `SITE.url` directly — no manual sync needed.

## CSS architecture

4 shared CSS files imported via `src/styles/index.css` (loaded in `BaseLayout.astro`) + 4 page-level CSS files imported via `src/pages/portfolio/styles/index.css` (loaded in `index.astro`):

**Shared** (`src/styles/` — used by all pages):

| File | Layer | Purpose |
| --- | --- | --- |
| `00-fonts.css` | — (no layer) | `@font-face` declarations for self-hosted Switzer + JetBrains Mono (woff2, `font-display: swap`) |
| `01-reset.css` | `reset` | Box-sizing, margin/padding zero, `text-wrap: balance/pretty` |
| `02-base.css` | `base` | Custom properties (OKLCH colors, fluid `clamp()` spacing), `:root`/`body`, `::selection`, `:focus-visible` |
| `03-theme.css` | `theme` | Reusable utility classes (`.highlight`, `.label`) |

**Page-level** (`src/pages/portfolio/styles/` — index page only):

| File | Layer | Purpose |
| --- | --- | --- |
| `layout.css` | `layout` | 12-column CSS Grid layout with named grid rows, subgrid footer, responsive padding |
| `components.css` | `components` | Self-contained widgets (`.progress-bar`, `.status-dot`, `.status-available`) |
| `motion.css` | `motion` | `@keyframes` + staggered entry animations, `prefers-reduced-motion: reduce` kills all motion (WCAG SC 2.3.3 compliant) |
| `overrides.css` | `overrides` | Skip-link utility, container queries (`@container page`), media queries (768/480/360px), print styles, high-contrast mode |

All `@font-face` rules live in `00-fonts.css` (imported in `layer(fonts)`) so they don't interfere with the cascade. The 7 layered files each get a cascade layer matching their name.

The build inlines all CSS into the HTML (`build.inlineStylesheets: 'always'`), so there are zero external stylesheet requests at runtime.

**Important:** CSS must be imported in frontmatter (`import`), NOT inside a `<style>` tag — Astro scopes `<style>` selectors with `[data-astro-cid]` which breaks matching on child elements.

## JavaScript

Three vanilla modules colocated with their components in `src/pages/portfolio/_components/`, typed with TypeScript, bundled by Astro and inlined into the HTML. A fourth module (`_ga-events.ts`) lives at the portfolio level for GA4 event dispatch.

- **`TextScramble`** — Animated text reveal using random character scrambling from a fixed character set. In `setText()`, uses `requestAnimationFrame` to cycle through random characters at ~28% change rate per frame. Respects `prefers-reduced-motion` by skipping animation entirely. Applied to `.name-line` elements on load. Uses `textContent` to capture current text without forcing reflow. Source: `src/pages/portfolio/_components/Name/text-scramble.ts`.
- **`Clock`** — Live clock in footer showing Asia/Kathmandu time with UTC offset (e.g. "Kathmandu, Nepal · 2:30 PM · GMT+5:45"). Uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kathmandu'` and `formatToParts()` for timezone extraction. Aligns to real minute boundaries via `setTimeout` to the next :00 second, then `setInterval` every 60s — avoids drift from page-load-time alignment. Source: `src/pages/portfolio/_components/Footer/clock.ts`.
- **`initStackToggle`** — Syncs `aria-expanded` on stack categories with visual state. Desktop (`hover: hover`): hover and keyboard focus reveal sublists; `pointerdown` calls `preventDefault()` so mouse clicks don't persist `:focus-within` (Tab still works). Touch (`hover: none`): tap toggles `.stack-open` with mutual exclusion (one item open at a time); tap outside the stack to dismiss. Fires GA4 `stack_expand` events on manual interaction. Source: `src/pages/portfolio/_components/Stack/stack-toggle.ts`.
- **`_ga-events.ts`** — Central GA4 custom event dispatch. One exported function per event: `trackCvClick`, `trackGithubClick`, `trackLinkedinClick`, `trackStackExpand(category)`, `trackAccessibilityPref`. Each wraps `window.gtag('event', ...)`. Silently no-ops if gtag absent (ad-blocker, dev without network). Event names and parameters live here — callers pass only category strings. Source: `src/pages/portfolio/_ga-events.ts`.

Init in `src/pages/portfolio/_init.ts` is loaded via a `<script>` tag in `index.astro`. It boots `TextScramble`, `Clock`, `initStackToggle`, and a delegated click listener for `[data-track]` attributes that routes to the corresponding `_ga-events.ts` function.

## Icons and favicons

15 favicon/app-icon files in `public/assets/icons/` covering all platforms:

| Files | Platform |
| --- | --- |
| `favicon.svg` | Modern SVG favicon (Firefox, Chrome 80+) |
| `favicon.ico` | Multi-res ICO (16×16, 32×32, 48×48) — legacy IE |
| `favicon-{16,32,96}.png` | PNG fallbacks |
| `apple-touch-icon-{120,152,167,180}.png` | iOS home screen (all sizes) |
| `icon-{192,384,512}.png` | Android Chrome / PWA |
| `maskable-icon-{192,512}.png` | Android adaptive icons (80% safe zone) |
| `mstile-150x150.png` | Windows 8/10 tile |

PWA screenshots live in `public/assets/screenshots/` — narrow (412×915 @2x → 824×1830, 20:9 Pixel 8/9) and wide (1280×720 @2x → 2560×1440, 16:9 desktop), light and dark. Generated via `npm run screenshots` using Playwright with `prefers-reduced-motion: reduce` for animation-free captures. The web manifest includes `display_override: ["standalone", "minimal-ui"]` for progressive display fallback, `orientation: "natural"`, and labeled screenshot entries with `form_factor`.

3 additional SVG icons used as CSS mask-images for UI elements:

| Files | Purpose |
| --- | --- |
| `icon-cv.svg` | CV link icon in Meta |
| `icon-github.svg` | GitHub link icon in Links |
| `icon-linkedin.svg` | LinkedIn link icon in Links |

Regenerate all icons from the source logo by running:

```bash
python3 scripts/generate-icons.py
```

This reads `design/logo/square/logo-square.svg` and outputs all sizes to `public/assets/icons/`. Does NOT generate `og-image.png` — that is managed separately.

**Note:** Pillow 12.3.0's ICO reader reports only 1 frame, but the generated `favicon.ico` actually contains 3 frames — verify with the `file` command instead.

## Logo

Source files live in `design/logo/square/`:

- `logo-square.graphite` — editable source (Graphite app)
- `logo-square.svg` — vector export (8 KB)
- `logo-square.png` — raster export (16 KB)

Public copies are in `public/assets/logo/square/` as `logo.svg` and `logo.png`. The circle variant has been removed — only the square logo is used site-wide.

## Deployment

GitHub Actions deploys to GitHub Pages with Cloudflare CDN in front.

`astro build` inlines all CSS and JS into a single HTML file (~29 KB). Total `dist/` size is ~1.4 MB (screenshots ~512 KB, OG image ~440 KB, fonts ~104 KB, icons ~92 KB).

`.nojekyll` in `public/` prevents GitHub Pages from running Jekyll on the built output (which would ignore `_astro/` prefixed directories).

CI triggers on pushes to `main` for changes to `src/`, `public/`, `astro.config.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, or the workflow itself. Also supports `workflow_dispatch` for manual deploys.

## Cloudflare config

GitHub Pages sends no cache or security headers at origin, so these must be configured in the Cloudflare dashboard — **not in code**.

**Rocket Loader must be OFF** (Speed → Optimization → Content Optimization → Rocket Loader™ → Off). Rocket Loader intercepts Astro's module scripts and changes the request credentials mode, which mismatches Vite's `<link rel="modulepreload">` hints — causing "A preload for '...' is found, but is not used because the request credentials mode does not match" console warnings. Since all CSS is inlined and JS is a single small bundle, Rocket Loader provides no benefit and only creates compatibility issues.

**Cache Rules** (Cloudflare Dashboard → Rules → Cache Rules):

| Rule | URI Path | Browser Cache TTL |
|------|----------|-------------------|
| Fonts | `/fonts/*` | 1 year |
| Static assets | `/assets/*` | 1 year |

**Response Headers** (Cloudflare Dashboard → Rules → Transform Rules → Modify Response Header):

| Header | Value |
|--------|-------|
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Frame-Options` | `DENY` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` (overwrite Cloudflare's 30-day default) |

After setting `preload`, submit `bishalgc.info.np` at https://hstspreload.org.

`frame-ancestors 'none'` is also set in the CSP `<meta>` tag for browser-level protection. `X-Frame-Options` covers older browsers and provides defense-in-depth at the CDN layer.

Frequent pushes won't cause stale content: the HTML (short TTL) always loads fresh and picks up fingerprinted JS bundles; fonts and icons rarely change. If a font ever does change, rename the file or purge Cloudflare cache once.

## Agent Discovery

The site publishes machine-readable endpoints and headers for AI agent discovery and content negotiation. These are split across origin (Astro static files) and edge (Cloudflare dashboard/DNS).

### Origin endpoints (Astro-generated static files)

| Endpoint | Content-Type | Purpose |
| --- | --- | --- |
| `/robots.txt` | `text/plain` | Content Signals: `ai-train=no, search=yes, ai-input=no` (CV now allowed) |
| `/llms.txt` | `text/plain; charset=utf-8` | Curated LLM context: name, role, stack, links, CV, policies |
| `/.well-known/api-catalog` | `application/linkset+json` | RFC 9727 API catalog with declarative linkset |
| `/.well-known/agent-skills/index.json` | `application/json` | Agent Skills Discovery v0.2.0 index |

### Origin Link elements (HTML `<head>`, in `BaseLayout.astro`)

These `<link>` elements provide agent discovery for HTML-parsing crawlers at the origin level. They mirror the HTTP `Link:` headers configured at Cloudflare, giving double coverage — HTML-aware agents find them in the DOM, and header-aware agents find them in the HTTP response.

| Rel | Href | Purpose |
| --- | --- | --- |
| `api-catalog` | `/.well-known/api-catalog` | RFC 9727 API catalog |
| `service-doc` | `/llms.txt` | AI/LLM documentation |
| `describedby` | `/.well-known/agent-skills/index.json` | Agent Skills Discovery index |

These are IANA-registered link relation types per RFC 8288.

### Cloudflare-side configuration (dashboard only)

These HTTP `Link:` response headers complement the HTML `<link>` elements at the origin. Both must be configured — origin covers HTML-parsing agents, Cloudflare covers header-only agents.

**Link Headers** (Cloudflare Dashboard → Rules → Transform Rules → Modify Response Header):

Add a rule targeting the homepage (`hostname eq bishalgc.info.np AND uri.path eq "/"`) with these response headers:

```text
Link: </.well-known/api-catalog>; rel="api-catalog"
Link: </llms.txt>; rel="service-doc"
Link: </.well-known/agent-skills/index.json>; rel="describedby"
```

Per RFC 8288 (Web Linking) and RFC 9727 §3.

**Markdown for Agents** — two options depending on your Cloudflare plan:

*Pro/Business plan:* Cloudflare Dashboard → AI Crawl Control → Markdown for Agents → On. Enables transparent HTML→markdown conversion when `Accept: text/markdown` is present. Response uses `Content-Type: text/markdown` with `x-markdown-tokens` header. No origin changes needed.

*Free plan (current):* The toggle is unavailable, so markdown negotiation runs via a **Cloudflare Worker** (included on free plan, 100k req/day). The Worker script lives at `workers/markdown-for-agents.js`. It intercepts GET requests with `Accept: text/markdown`, fetches the HTML from origin, converts it to markdown using **turndown** + **linkedom** (spec-compliant HTML→markdown library with lightweight DOM shim), and returns `Content-Type: text/markdown` with `x-markdown-tokens`. Non-GET and non-markdown requests pass through with zero overhead (one string check). Security headers (CSP, HSTS, X-Frame-Options, etc.) are preserved from the origin response.

Deployed via GitHub integration (`wrangler.toml` at repo root). The Worker auto-deploys on push to `main`. Route must be set once in Cloudflare Dashboard: `bishalgc.info.np/*` → `markdown-for-agents`.

**DNS-AID Record** (Cloudflare DNS Dashboard → Records → Add record):

| Field | Value |
| --- | --- |
| Type | HTTPS |
| Name | `_index._agents` |
| Target | `bishalgc.info.np` |
| TTL | 3600 |
| Priority | 1 |
| Parameters | `alpn="http/1.1" port=443` |

DNSSEC is auto-managed by Cloudflare. Per draft-mozleywilliams-dnsop-dnsaid and RFC 9460.

### Validation

Verify agent readiness by scanning the deployed site:

```http
POST https://isitagentready.com/api/scan
Content-Type: application/json

{"url": "https://bishalgc.info.np"}
```

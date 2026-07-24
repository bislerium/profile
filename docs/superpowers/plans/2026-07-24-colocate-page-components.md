# Colocate Index Page Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all index-page-specific files (9 components, 4 scripts, 3 CSS files) into `src/pages/index/` with colocated scripts, leaving only shared concerns at `src/`.

**Architecture:** File reorganization only — zero logic changes. Components and their scripts colocate under `src/pages/index/components/<Name>/`. Page-level CSS (`04-layout`, `05-components`, `06-motion`) moves to `src/pages/index/styles/`. Shared CSS layers (fonts, reset, base, theme, overrides) stay at `src/styles/`. All internal imports switch to Astro's built-in `src/` alias.

**Tech Stack:** Astro 7, TypeScript, Vanilla CSS

## Global Constraints

- Zero logic or behavior changes — only file moves and import path updates
- All imports use `src/` prefix (Vite built-in alias, no config needed)
- `astro build` must produce identical output before and after
- `CLAUDE.md` must reflect the new structure

---

### Task 1: Create directory structure

**Files:**
- Create: `src/pages/index/` (directory)
- Create: `src/pages/index/components/` (directory)
- Create: `src/pages/index/styles/` (directory)

- [ ] **Step 1: Create all directories**

```bash
mkdir -p src/pages/index/components/{IndexHeader,NameBlock,Ecosystem,SectionDivider,MetaBlock,LinksBlock,Footer,ProgressBar,SkipLink}
mkdir -p src/pages/index/styles
```

- [ ] **Step 2: Verify directories exist**

```bash
ls -d src/pages/index/components/*/ src/pages/index/styles/
```

Expected: 9 component directories and `src/pages/index/styles/` listed.

---

### Task 2: Move CSS files and update shared CSS index

**Files:**
- Move: `src/styles/04-layout.css` → `src/pages/index/styles/layout.css`
- Move: `src/styles/05-components.css` → `src/pages/index/styles/components.css`
- Move: `src/styles/06-motion.css` → `src/pages/index/styles/motion.css`
- Create: `src/pages/index/styles/index.css`
- Modify: `src/styles/index.css`

**Interfaces:**
- Produces: `src/pages/index/styles/index.css` imports layout, components, motion
- Produces: `src/styles/index.css` no longer imports the three moved files

- [ ] **Step 1: Move the three CSS files**

```bash
git mv src/styles/04-layout.css src/pages/index/styles/layout.css
git mv src/styles/05-components.css src/pages/index/styles/components.css
git mv src/styles/06-motion.css src/pages/index/styles/motion.css
```

- [ ] **Step 2: Create page-level CSS index**

```css
/* src/pages/index/styles/index.css — page-level styles for index */
@import './layout.css' layer(layout);
@import './components.css' layer(components);
@import './motion.css' layer(motion);
```

- [ ] **Step 3: Update shared CSS index to remove moved files**

```css
/* src/styles/index.css — shared styles (fonts + global layers) */
@import './00-fonts.css';
@import './01-reset.css' layer(reset);
@import './02-base.css' layer(base);
@import './03-theme.css' layer(theme);
@import './07-overrides.css' layer(overrides);
```

- [ ] **Step 4: Verify CSS files moved and content correct**

```bash
ls src/pages/index/styles/layout.css src/pages/index/styles/components.css src/pages/index/styles/motion.css src/pages/index/styles/index.css
cat src/styles/index.css
```

Expected: All four files exist. Shared index has 5 `@import` lines (no 04/05/06).

---

### Task 3: Move components without scripts (IndexHeader, ProgressBar, SectionDivider, MetaBlock, LinksBlock, SkipLink)

**Files:**
- Move: `src/components/IndexHeader.astro` → `src/pages/index/components/IndexHeader/IndexHeader.astro`
- Move: `src/components/ProgressBar.astro` → `src/pages/index/components/ProgressBar/ProgressBar.astro`
- Move: `src/components/SectionDivider.astro` → `src/pages/index/components/SectionDivider/SectionDivider.astro`
- Move: `src/components/MetaBlock.astro` → `src/pages/index/components/MetaBlock/MetaBlock.astro`
- Move: `src/components/LinksBlock.astro` → `src/pages/index/components/LinksBlock/LinksBlock.astro`
- Move: `src/components/SkipLink.astro` → `src/pages/index/components/SkipLink/SkipLink.astro`

- [ ] **Step 1: Move all six component files**

```bash
git mv src/components/IndexHeader.astro src/pages/index/components/IndexHeader/IndexHeader.astro
git mv src/components/ProgressBar.astro src/pages/index/components/ProgressBar/ProgressBar.astro
git mv src/components/SectionDivider.astro src/pages/index/components/SectionDivider/SectionDivider.astro
git mv src/components/MetaBlock.astro src/pages/index/components/MetaBlock/MetaBlock.astro
git mv src/components/LinksBlock.astro src/pages/index/components/LinksBlock/LinksBlock.astro
git mv src/components/SkipLink.astro src/pages/index/components/SkipLink/SkipLink.astro
```

- [ ] **Step 2: Update constants import in IndexHeader.astro**

```diff
- import { PERSON } from '../constants';
+ import { PERSON } from 'src/constants';
```

- [ ] **Step 3: Update constants import in MetaBlock.astro**

```diff
- import { PERSON, PAGE, LINKS } from '../constants';
+ import { PERSON, PAGE, LINKS } from 'src/constants';
```

- [ ] **Step 4: Update constants import in LinksBlock.astro**

```diff
- import { LINKS } from '../constants';
+ import { LINKS } from 'src/constants';
```

- [ ] **Step 5: Verify all moves and edits**

```bash
ls src/pages/index/components/{IndexHeader,ProgressBar,SectionDivider,MetaBlock,LinksBlock,SkipLink}/*.astro
grep -r "from 'src/constants'" src/pages/index/components/{IndexHeader,MetaBlock,LinksBlock}/*.astro
```

Expected: 6 files exist. IndexHeader, MetaBlock, and LinksBlock use `src/constants`.

---

### Task 4: Move components with colocated scripts (NameBlock, Ecosystem, Footer)

**Files:**
- Move: `src/components/NameBlock.astro` → `src/pages/index/components/NameBlock/NameBlock.astro`
- Move: `src/scripts/text-scramble.ts` → `src/pages/index/components/NameBlock/text-scramble.ts`
- Move: `src/components/Ecosystem.astro` → `src/pages/index/components/Ecosystem/Ecosystem.astro`
- Move: `src/scripts/stack-toggle.ts` → `src/pages/index/components/Ecosystem/stack-toggle.ts`
- Move: `src/components/Footer.astro` → `src/pages/index/components/Footer/Footer.astro`
- Move: `src/scripts/clock.ts` → `src/pages/index/components/Footer/clock.ts`

- [ ] **Step 1: Move component and script files together**

```bash
git mv src/components/NameBlock.astro src/pages/index/components/NameBlock/NameBlock.astro
git mv src/scripts/text-scramble.ts src/pages/index/components/NameBlock/text-scramble.ts
git mv src/components/Ecosystem.astro src/pages/index/components/Ecosystem/Ecosystem.astro
git mv src/scripts/stack-toggle.ts src/pages/index/components/Ecosystem/stack-toggle.ts
git mv src/components/Footer.astro src/pages/index/components/Footer/Footer.astro
git mv src/scripts/clock.ts src/pages/index/components/Footer/clock.ts
```

- [ ] **Step 2: Update constants import in NameBlock.astro**

```diff
- import { PERSON } from '../constants';
+ import { PERSON } from 'src/constants';
```

- [ ] **Step 3: Update constants import in Ecosystem.astro**

```diff
- import { STACK } from '../constants';
+ import { STACK } from 'src/constants';
```

- [ ] **Step 4: Verify moves**

```bash
ls src/pages/index/components/{NameBlock,Ecosystem,Footer}/*
grep -r "from 'src/constants'" src/pages/index/components/{NameBlock,Ecosystem}/*.astro
```

Expected: Each folder has its `.astro` + `.ts` files. Imports use `src/constants`.

---

### Task 5: Move init.ts and update all script imports

**Files:**
- Move: `src/scripts/init.ts` → `src/pages/index/init.ts`
- The `src/scripts/` directory is now empty (all 4 files moved in Tasks 4 and 5)

- [ ] **Step 1: Move init.ts**

```bash
git mv src/scripts/init.ts src/pages/index/init.ts
```

- [ ] **Step 2: Update imports in init.ts**

```diff
- import { TextScramble } from './text-scramble';
- import { Clock } from './clock';
- import { initStackToggle } from './stack-toggle';
- import { PERSON } from '../constants';
+ import { TextScramble } from './components/NameBlock/text-scramble';
+ import { Clock } from './components/Footer/clock';
+ import { initStackToggle } from './components/Ecosystem/stack-toggle';
+ import { PERSON } from 'src/constants';
```

- [ ] **Step 3: Verify init.ts content**

```bash
head -8 src/pages/index/init.ts
```

Expected: All four imports use the new paths.

---

### Task 6: Move and update index.astro

**Files:**
- Move: `src/pages/index.astro` → `src/pages/index/index.astro`

- [ ] **Step 1: Move index.astro**

```bash
git mv src/pages/index.astro src/pages/index/index.astro
```

Note: Since the destination `src/pages/index/` already exists as the directory we've been building, `git mv` handles this correctly — it moves the file into the directory.

- [ ] **Step 2: Update all imports in index.astro**

Replace the entire frontmatter import block:

```diff
---
- import BaseLayout from '../layouts/BaseLayout.astro';
- import SkipLink from '../components/SkipLink.astro';
- import ProgressBar from '../components/ProgressBar.astro';
- import IndexHeader from '../components/IndexHeader.astro';
- import NameBlock from '../components/NameBlock.astro';
- import Ecosystem from '../components/Ecosystem.astro';
- import SectionDivider from '../components/SectionDivider.astro';
- import MetaBlock from '../components/MetaBlock.astro';
- import LinksBlock from '../components/LinksBlock.astro';
- import Footer from '../components/Footer.astro';
+ import BaseLayout from 'src/layouts/BaseLayout.astro';
+ import 'src/pages/index/styles/index.css';
+ import SkipLink from 'src/pages/index/components/SkipLink/SkipLink.astro';
+ import ProgressBar from 'src/pages/index/components/ProgressBar/ProgressBar.astro';
+ import IndexHeader from 'src/pages/index/components/IndexHeader/IndexHeader.astro';
+ import NameBlock from 'src/pages/index/components/NameBlock/NameBlock.astro';
+ import Ecosystem from 'src/pages/index/components/Ecosystem/Ecosystem.astro';
+ import SectionDivider from 'src/pages/index/components/SectionDivider/SectionDivider.astro';
+ import MetaBlock from 'src/pages/index/components/MetaBlock/MetaBlock.astro';
+ import LinksBlock from 'src/pages/index/components/LinksBlock/LinksBlock.astro';
+ import Footer from 'src/pages/index/components/Footer/Footer.astro';
---
```

- [ ] **Step 3: Update the inline script import**

```diff
-   <script>import '../scripts/init.ts';</script>
+   <script>import 'src/pages/index/init.ts';</script>
```

- [ ] **Step 4: Verify index.astro imports**

```bash
head -16 src/pages/index/index.astro
grep "init.ts" src/pages/index/index.astro
```

Expected: All imports use `src/` prefix. Script imports from `src/pages/index/init.ts`.

---

### Task 7: Build and verify

- [ ] **Step 1: Run astro build**

```bash
npm run build
```

Expected: Build succeeds with no errors. Output in `dist/`.

- [ ] **Step 2: Check that dist/index.html is valid**

```bash
ls -lh dist/index.html
head -5 dist/index.html
```

Expected: `index.html` exists and starts with `<!DOCTYPE html>`.

- [ ] **Step 3: Verify no broken references in output**

```bash
grep -c '404' dist/index.html || echo "No 404 references — good"
```

Expected: No broken paths in the built output.

---

### Task 8: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the project structure section**

Replace the current structure block with the new one:

```diff
  ## Project structure

  ```text
- src/
-   constants.ts          # SITE, LINKS, PERSON, STACK, STACK_NAMES, PAGE, OG_IMAGE_ALT — single source of truth for all metadata
-   layouts/
-     BaseLayout.astro    # <head> with all meta, OG, Twitter, favicons, JSON-LD, CSP, GA
-   pages/
-     index.astro          # Single-page site — composes components into <main>
-     404.astro            # Custom 404 error page with BaseLayout + inline styles
-     robots.txt.ts        # Robots endpoint (disallows /assets/cv.pdf)
-     llms.txt.ts          # LLMs.txt endpoint for AI crawlers
-     site.webmanifest.ts  # Dynamic PWA manifest endpoint
-   components/
-     IndexHeader.astro   # Decorative div with logo (not a landmark)
-     NameBlock.astro     # h1 — name with TextScramble effect
-     Ecosystem.astro     # aside — hierarchical stack list (categories + items)
-     SectionDivider.astro # hr — animated sine-wave SVG squiggle (drawIn + waveFlow)
-     MetaBlock.astro     # section — role + highlighted tagline (set:html)
-     LinksBlock.astro    # nav — GitHub, LinkedIn, CV links
-     Footer.astro        # footer — Clock + availability dot
-     SkipLink.astro      # Skip-to-main accessibility link
-     ProgressBar.astro   # Decorative scroll indicator (aria-hidden)
-   scripts/
-     init.ts             # Boots TextScramble + Clock (imports PERSON.nameParts)
-     text-scramble.ts    # Animated text reveal (respects prefers-reduced-motion)
-     clock.ts  # Live clock widget using Intl.DateTimeFormat (imports PERSON.timezone, clockLabel)
-     stack-toggle.ts     # Syncs aria-expanded on ecosystem categories with hover/focus state
-   styles/               # 8 CSS files — 1 font-face + 7 @layer (see CSS architecture below)
+ src/
+   constants.ts          # SITE, LINKS, PERSON, STACK, STACK_NAMES, PAGE, OG_IMAGE_ALT — single source of truth for all metadata
+   layouts/
+     BaseLayout.astro    # <head> with all meta, OG, Twitter, favicons, JSON-LD, CSP, GA
+   pages/
+     index/              # Main page — all index-specific files colocated here
+       index.astro       # Composes components into <main>, imports page-level CSS + init.ts
+       init.ts           # Boots TextScramble + Clock + stack toggle (imports PERSON.nameParts)
+       styles/           # Page-level CSS (layout, components, motion)
+         index.css       # Entry point — imports layout, components, motion
+         layout.css      # Grid layout + component positioning (was 04-layout.css)
+         components.css  # Progress bar, status dot (was 05-components.css)
+         motion.css      # @keyframes + staggered entry animations (was 06-motion.css)
+       components/
+         IndexHeader/    # IndexHeader.astro — decorative div with logo (not a landmark)
+         NameBlock/      # NameBlock.astro + text-scramble.ts — h1 with animated text reveal
+         Ecosystem/      # Ecosystem.astro + stack-toggle.ts — hierarchical stack list
+         SectionDivider/ # SectionDivider.astro — animated sine-wave SVG squiggle
+         MetaBlock/      # MetaBlock.astro — role + highlighted tagline
+         LinksBlock/     # LinksBlock.astro — nav for GitHub, LinkedIn, CV
+         Footer/         # Footer.astro + clock.ts — clock widget + availability dot
+         ProgressBar/    # ProgressBar.astro — decorative scroll indicator
+         SkipLink/       # SkipLink.astro — skip-to-main accessibility link
+     404.astro           # Custom 404 error page with BaseLayout + inline styles
+     robots.txt.ts        # Robots endpoint (disallows /assets/cv.pdf)
+     llms.txt.ts          # LLMs.txt endpoint for AI crawlers
+     site.webmanifest.ts  # Dynamic PWA manifest endpoint
+   styles/               # 5 shared CSS files — 1 font-face + 4 @layer
  design/
    logo/square/          # Source logo files (logo-square.svg, .png, .graphite)
  public/
    favicon.ico            # Root favicon (Googlebot fallback, duplicated from assets/icons/)
    assets/
      icons/              # 16 generated favicon/app-icon files
      logo/square/        # Public logo (logo.svg for header, logo.png for JSON-LD/OG)
      og-image.png        # 1200×630 OG card image (8-bit colormap PNG, ~440 KB)
    fonts/
      switzer/            # 4 woff2 weights — 400, 500, 600, 700
      jetbrains-mono/     # 4 woff2 weights — 400, 500, 600, 700
  scripts/
    generate-icons.py     # Reproducible icon generation from design/logo/square/logo-square.svg
```

- [ ] **Step 2: Update the CSS architecture table**

Replace the 8-row table with a 6-row table (2 fewer CSS files):

```diff
  ## CSS architecture

- 8 CSS files imported in order via `src/styles/index.css` (loaded in `BaseLayout.astro` frontmatter via `import '../styles/index.css'`):
+ 5 shared CSS files imported via `src/styles/index.css` (loaded in `BaseLayout.astro`) + 3 page-level CSS files imported via `src/pages/index/styles/index.css` (loaded in `index.astro`):

- | File | Layer | Purpose |
- | --- | --- | --- |
- | `00-fonts.css` | — (no layer) | `@font-face` declarations for self-hosted Switzer + JetBrains Mono (woff2, `font-display: swap`) |
- | `01-reset.css` | `reset` | Box-sizing, margin/padding zero, `text-wrap: balance/pretty` |
- | `02-base.css` | `base` | Custom properties (OKLCH colors, fluid `clamp()` spacing), `:root`/`body`, `::selection`, `:focus-visible` |
- | `03-theme.css` | `theme` | Reusable utility classes (`.highlight`, `.label`) |
- | `04-layout.css` | `layout` | 12-column CSS Grid layout with named grid rows, subgrid footer, responsive padding |
- | `05-components.css` | `components` | Self-contained widgets (`.progress-bar`, `.status-dot`, `.status-available`) |
- | `06-motion.css` | `motion` | `@keyframes` (fadeUp, fadeIn, drawIn, waveFlow, breathe, progressFill/Fade) and staggered entry animations, respects `prefers-reduced-motion` |
- | `07-overrides.css` | `overrides` | Skip-link utility, container queries (`@container page`), media queries (768/480/360px), print styles |
+ **Shared** (`src/styles/` — used by all pages):
+ | File | Layer | Purpose |
+ | --- | --- | --- |
+ | `00-fonts.css` | — (no layer) | `@font-face` declarations for self-hosted Switzer + JetBrains Mono (woff2, `font-display: swap`) |
+ | `01-reset.css` | `reset` | Box-sizing, margin/padding zero, `text-wrap: balance/pretty` |
+ | `02-base.css` | `base` | Custom properties (OKLCH colors, fluid `clamp()` spacing), `:root`/`body`, `::selection`, `:focus-visible` |
+ | `03-theme.css` | `theme` | Reusable utility classes (`.highlight`, `.label`) |
+ | `07-overrides.css` | `overrides` | Skip-link utility, container queries (`@container page`), media queries (768/480/360px), print styles |
+
+ **Page-level** (`src/pages/index/styles/` — index page only):
+ | File | Layer | Purpose |
+ | --- | --- | --- |
+ | `layout.css` | `layout` | 12-column CSS Grid layout with named grid rows, subgrid footer, responsive padding |
+ | `components.css` | `components` | Self-contained widgets (`.progress-bar`, `.status-dot`, `.status-available`) |
+ | `motion.css` | `motion` | `@keyframes` (fadeUp, fadeIn, drawIn, waveFlow, breathe, progressFill/Fade) and staggered entry animations, respects `prefers-reduced-motion` |
```

- [ ] **Step 3: Update the JavaScript section**

```diff
  ## JavaScript

- Two vanilla classes in `src/scripts/`, typed with TypeScript, bundled by Astro and inlined into the HTML:
+ Three vanilla classes colocated with their components in `src/pages/index/components/`, typed with TypeScript, bundled by Astro and inlined into the HTML:

- - **`TextScramble`** — Animated text reveal using random character scrambling from a fixed character set. In `setText()`, uses `requestAnimationFrame` to cycle through random characters at ~28% change rate per frame. Respects `prefers-reduced-motion` by skipping animation entirely. Applied to `.name-line` elements on load. Uses `innerText` (reads rendered text including any prior scramble state) to capture the current text. Source: `src/scripts/text-scramble.ts`.
- - **`Clock`** — Live clock in footer showing Asia/Kathmandu time with UTC offset (e.g. "Kathmandu, Nepal · 2:30 PM · GMT+5:45"). Uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kathmandu'` and `formatToParts()` for timezone extraction. Updates every 60s. Source: `src/scripts/clock.ts`.
+ - **`TextScramble`** — Animated text reveal using random character scrambling from a fixed character set. In `setText()`, uses `requestAnimationFrame` to cycle through random characters at ~28% change rate per frame. Respects `prefers-reduced-motion` by skipping animation entirely. Applied to `.name-line` elements on load. Uses `innerText` (reads rendered text including any prior scramble state) to capture the current text. Source: `src/pages/index/components/NameBlock/text-scramble.ts`.
+ - **`Clock`** — Live clock in footer showing Asia/Kathmandu time with UTC offset (e.g. "Kathmandu, Nepal · 2:30 PM · GMT+5:45"). Uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kathmandu'` and `formatToParts()` for timezone extraction. Updates every 60s. Source: `src/pages/index/components/Footer/clock.ts`.
+ - **`initStackToggle`** — Syncs `aria-expanded` on ecosystem stack category items with their CSS hover/focus state. Reads pseudo-class state so ARIA stays in sync without duplicating CSS logic. Source: `src/pages/index/components/Ecosystem/stack-toggle.ts`.

- Init in `init.ts` is loaded via a `<script>` tag in `index.astro`.
+ Init in `src/pages/index/init.ts` is loaded via a `<script>` tag in `index.astro`.
```

- [ ] **Step 4: Verify CLAUDE.md changes**

```bash
grep -c "src/scripts/" CLAUDE.md || echo "No stale script paths — good"
grep -c "src/components/" CLAUDE.md || echo "No stale component paths — good"
```

Expected: No references to old `src/scripts/` or `src/components/` paths.

---

### Task 9: Clean up empty directories and commit

- [ ] **Step 1: Remove empty directories**

```bash
rmdir src/components 2>/dev/null || echo "src/components already empty or removed"
rmdir src/scripts 2>/dev/null || echo "src/scripts already empty or removed"
```

- [ ] **Step 2: Final build verification**

```bash
npm run build
```

Expected: Clean build, no errors.

- [ ] **Step 3: Review git status**

```bash
git status
```

Expected: All moves staged, no untracked files in old locations.

- [ ] **Step 4: Commit all changes**

```bash
git add -A
git commit -m "refactor: colocate index page components, scripts, and styles

Move all index-page-specific files into src/pages/index/ with scripts
colocated alongside their components. Page-level CSS (layout, components,
motion) moves to src/pages/index/styles/. Shared CSS layers stay at src/styles/.

All imports use Astro's built-in src/ alias for clean, depth-independent paths.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

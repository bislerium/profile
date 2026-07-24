# Colocate Index Page Components

**Date:** 2026-07-24
**Status:** Design approved

## Goal

Group all index-page-specific files (components, scripts, and page-level CSS) into a single `src/pages/index/` folder. Shared concerns (`BaseLayout`, global CSS layers, `constants.ts`) remain at `src/`.

## Directory Structure

### New: `src/pages/index/`

```
src/pages/index/
├── index.astro                          # Moved from src/pages/index.astro
├── init.ts                              # Moved from src/scripts/init.ts
├── styles/
│   ├── index.css                        # New — imports the 3 page-level CSS files
│   ├── layout.css                       # Moved from src/styles/04-layout.css
│   ├── components.css                   # Moved from src/styles/05-components.css
│   └── motion.css                       # Moved from src/styles/06-motion.css
└── components/
    ├── IndexHeader/
    │   └── IndexHeader.astro            # Moved from src/components/
    ├── NameBlock/
    │   ├── NameBlock.astro              # Moved from src/components/
    │   └── text-scramble.ts             # Moved from src/scripts/
    ├── Ecosystem/
    │   ├── Ecosystem.astro              # Moved from src/components/
    │   └── stack-toggle.ts              # Moved from src/scripts/
    ├── SectionDivider/
    │   └── SectionDivider.astro         # Moved from src/components/
    ├── MetaBlock/
    │   └── MetaBlock.astro              # Moved from src/components/
    ├── LinksBlock/
    │   └── LinksBlock.astro             # Moved from src/components/
    ├── Footer/
    │   ├── Footer.astro                 # Moved from src/components/
    │   └── clock.ts                     # Moved from src/scripts/
    ├── ProgressBar/
    │   └── ProgressBar.astro            # Moved from src/components/
    └── SkipLink/
        └── SkipLink.astro               # Moved from src/components/
```

### Shared (remain at `src/`)

```
src/
├── constants.ts
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index/                           # NEW folder (above)
│   ├── 404.astro
│   ├── robots.txt.ts
│   ├── llms.txt.ts
│   └── site.webmanifest.ts
└── styles/
    ├── index.css                        # Updated: imports only shared layers
    ├── 00-fonts.css
    ├── 01-reset.css
    ├── 02-base.css
    ├── 03-theme.css
    └── 07-overrides.css
```

### Deleted

```
src/components/          # All 9 .astro files moved
src/scripts/             # All 4 .ts files moved
src/styles/04-layout.css # Moved
src/styles/05-components.css # Moved
src/styles/06-motion.css # Moved
```

## Import Paths

All internal imports use Astro's built-in `src/` alias (no config needed — Vite provides this by default in every Astro project). This avoids fragile relative paths like `../../../../constants`.

### `BaseLayout.astro` (shared, unchanged path)

Shared CSS index drops the three page-level imports:

```css
/* src/styles/index.css */
@import './00-fonts.css';
@import './01-reset.css';
@import './02-base.css';
@import './03-theme.css';
/* 04-layout, 05-components, 06-motion moved to page level */
@import './07-overrides.css';
```

### `index.astro`

```astro
---
import BaseLayout from 'src/layouts/BaseLayout.astro';
import 'src/pages/index/styles/index.css';
import SkipLink from 'src/pages/index/components/SkipLink/SkipLink.astro';
import ProgressBar from 'src/pages/index/components/ProgressBar/ProgressBar.astro';
import IndexHeader from 'src/pages/index/components/IndexHeader/IndexHeader.astro';
import NameBlock from 'src/pages/index/components/NameBlock/NameBlock.astro';
import Ecosystem from 'src/pages/index/components/Ecosystem/Ecosystem.astro';
import SectionDivider from 'src/pages/index/components/SectionDivider/SectionDivider.astro';
import MetaBlock from 'src/pages/index/components/MetaBlock/MetaBlock.astro';
import LinksBlock from 'src/pages/index/components/LinksBlock/LinksBlock.astro';
import Footer from 'src/pages/index/components/Footer/Footer.astro';
---

<!-- ... same template ... -->

<script>
  import 'src/pages/index/init.ts';
</script>
```

### `init.ts`

```ts
import { TextScramble } from 'src/pages/index/components/NameBlock/text-scramble';
import { Clock } from 'src/pages/index/components/Footer/clock';
import { initStackToggle } from 'src/pages/index/components/Ecosystem/stack-toggle';
import { PERSON } from 'src/constants';
```

### Components importing constants

```diff
- import { PERSON } from '../constants';
+ import { PERSON } from 'src/constants';

- import { STACK } from '../constants';
+ import { STACK } from 'src/constants';
```

### Page-level CSS index file (new)

```css
/* src/pages/index/styles/index.css */
@import './layout.css';
@import './components.css';
@import './motion.css';
```

This creates a clean boundary: `BaseLayout` loads shared CSS, the page loads page CSS.

## What Doesn't Change

- `src/constants.ts` — untouched
- `src/layouts/BaseLayout.astro` — same path, still imports `src/styles/index.css`
- `src/pages/404.astro` — same imports, same file, still uses `BaseLayout`
- `src/pages/robots.txt.ts`, `llms.txt.ts`, `site.webmanifest.ts` — untouched
- `src/styles/00-fonts.css`, `01-reset.css`, `02-base.css`, `03-theme.css`, `07-overrides.css` — untouched
- `public/`, `design/`, `scripts/generate-icons.py` — untouched
- `astro.config.ts` — no changes (no path aliases to configure)
- `CLAUDE.md` — will be updated to reflect new structure

## Rationale

- **Colocation** — Scripts live next to the components that depend on them (`text-scramble.ts` → `NameBlock/`). No more flipping between `src/components/` and `src/scripts/`.
- **Page-level CSS kept as files** — Layout, motion, and component CSS have cross-component concerns (staggered animation delays, shared grid layout). Keeping them as page-level files avoids fragmenting these coherent units.
- **Shared keeps shared** — Fonts, reset, base, theme, and overrides are genuinely shared (used by 404 page too). They stay at `src/styles/`.
- **`src/` alias** — No config, no `tsconfig.json`, always works. Clean imports from any depth.

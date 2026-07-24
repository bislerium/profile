# bishalgc.info.np

Personal portfolio site built with [Astro](https://astro.build), TypeScript, and vanilla CSS. Deployed to GitHub Pages via GitHub Actions, served through Cloudflare.

## Stack

- **Framework:** Astro 7 (static generation)
- **Language:** TypeScript (strict)
- **Styling:** Vanilla CSS with `@layer` architecture
- **CI/CD:** GitHub Actions → GitHub Pages
- **CDN:** Cloudflare
- **Fonts:** Switzer + JetBrains Mono (self-hosted woff2, `font-display: swap`)

## Development

```bash
npm ci          # Install dependencies
npm run dev     # Start dev server at localhost:4321
npm run build   # Build to dist/
npm run preview # Preview production build locally
```

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that builds and deploys to GitHub Pages. The workflow skips non-source changes (`design/`, `CLAUDE.md`, etc.).

## License

All rights reserved. See [LICENSE](LICENSE).

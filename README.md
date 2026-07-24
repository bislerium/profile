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

Pushes to `main` that touch `src/`, `public/`, config files, or the workflow itself trigger a GitHub Actions build and deploy to GitHub Pages.

## License

All rights reserved. See [LICENSE](LICENSE).

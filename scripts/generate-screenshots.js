#!/usr/bin/env node
/**
 * Generate PWA screenshots in light and dark themes
 * for the web app manifest (narrow + wide form factors).
 *
 * Starts the Astro dev server, captures at 2× device scale with
 * `prefers-reduced-motion: reduce` so the page renders instantly in
 * its final visual state — no animations, no TextScramble, no glitch.
 * Output: public/assets/screenshots/
 *
 * Requires: npx playwright install chromium (one-time setup)
 */

import { chromium } from "playwright";
import { fork } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "public", "assets", "screenshots");
const DEV_PORT = 4321;
const BASE_URL = `http://localhost:${DEV_PORT}`;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ── Form factors per spec ──────────────────────────────────────────────────

// Narrow = 412×915 @2x → 824×1830 PNG (20:9, Pixel 8/9 logical viewport)
// Wide   = 1280×720 @2x → 2560×1440 PNG (16:9, recommended desktop)
const SHOTS = [
  { label: "narrow-light", width: 412, height: 915, scheme: "light", formFactor: "narrow" },
  { label: "narrow-dark",  width: 412, height: 915, scheme: "dark",  formFactor: "narrow" },
  { label: "wide-light",   width: 1280, height: 720, scheme: "light", formFactor: "wide" },
  { label: "wide-dark",    width: 1280, height: 720, scheme: "dark",  formFactor: "wide" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

/** Wait until the dev server responds with 200. */
async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Dev server not ready after ${timeoutMs}ms`);
}

// ── Capture ────────────────────────────────────────────────────────────────

async function capture() {
  // 1. Start dev server
  const server = fork(
    resolve(ROOT, "node_modules", ".bin", "astro"),
    ["dev", "--port", String(DEV_PORT)],
    { stdio: "pipe", env: { ...process.env, NODE_ENV: "development" } },
  );

  try {
    await waitForServer(BASE_URL);

    // 2. Launch browser
    const browser = await chromium.launch({ headless: true });

    for (const shot of SHOTS) {
      const context = await browser.newContext({
        viewport: { width: shot.width, height: shot.height },
        colorScheme: shot.scheme,
        deviceScaleFactor: 2,
        reducedMotion: "reduce",
      });

      const page = await context.newPage();

      // reducedMotion: "reduce" disables all animations, TextScramble sets text
      // instantly, and glitch timers never schedule. Page renders in final state
      // immediately — no animation waits or timer-killing hacks needed.
      await page.goto(BASE_URL, { waitUntil: "networkidle" });

      const filename = `screenshot-${shot.label}.png`;
      await page.screenshot({
        path: resolve(OUT_DIR, filename),
        fullPage: false,
      });

      const size = shot.formFactor === "narrow" ? "📱" : "🖥️";
      console.log(`  ${size} ${filename} (${shot.width}×${shot.height}, ${shot.scheme})`);
      await context.close();
    }

    await browser.close();
    console.log(`\nDone — ${SHOTS.length} screenshots → public/assets/screenshots/`);
  } finally {
    server.kill();
  }
}

capture().catch(err => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Generate PWA screenshots in light and dark themes
 * for the web app manifest (narrow + wide form factors).
 *
 * Starts the Astro dev server, waits for all entry animations to finish,
 * kills the TextScramble glitch timers, then captures viewport screenshots.
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

// Narrow = Pixel 8 logical viewport (412×915) @2x → 824×1830 PNG
const SHOTS = [
  { label: "narrow-light", width: 412, height: 915, scheme: "light", formFactor: "narrow" },
  { label: "narrow-dark",  width: 412, height: 915, scheme: "dark",  formFactor: "narrow" },
  { label: "wide-light",   width: 1280, height: 800, scheme: "light", formFactor: "wide" },
  { label: "wide-dark",    width: 1280, height: 800, scheme: "dark",  formFactor: "wide" },
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

/**
 * Wait for all non-infinite CSS animations and transitions to finish.
 * Filters out infinite animations (waveFlow, breathe).
 */
async function waitForAnimations(page, timeoutMs = 10_000) {
  await page.waitForFunction(
    () => {
      const animations = document.getAnimations();
      const pending = animations.filter(a => {
        if (a.playState === "finished" || a.playState === "idle") return false;
        // Skip infinite animations — these never finish and are decorative
        const name = a.animationName || "";
        if (name === "waveFlow" || name === "breathe") return false;
        return true;
      });
      return pending.length === 0;
    },
    { timeout: timeoutMs },
  ).catch(() => {
    // Timeout is ok — animations may still have a frame or two left,
    // but the page is visually settled enough for a screenshot.
    console.warn("  ⚠ animation settle timed out, capturing anyway");
  });
}

/**
 * Nuke all pending timers so TextScramble glitch bursts don't fire mid-capture.
 * Preserves basic timer functionality — just clears what was scheduled.
 */
async function killGlitchTimers(page) {
  await page.evaluate(() => {
    // Clear all timeouts and intervals. Crude but effective — the page
    // is about to be screenshotted and closed, so no side effects matter.
    const maxId = setTimeout(() => {}, 0);
    for (let i = 0; i <= maxId; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
    // Also kill any in-flight rAF loops by replacing rAF with a no-op
    // after the current frame renders.
    const originalRAF = requestAnimationFrame;
    let killed = false;
    window.requestAnimationFrame = (cb) => {
      if (killed) return 0;
      return originalRAF(cb);
    };
    // Let one more frame render, then stop accepting new rAF callbacks.
    originalRAF(() => { killed = true; });
  });
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
      });

      const page = await context.newPage();

      // ── Navigate + wait for all entry animations to settle ──
      await page.goto(BASE_URL, { waitUntil: "networkidle" });

      // Wait for CSS animations (progress bar, divider draw-in) to finish.
      // These have known durations: progressFill 1.8s, drawIn 1.8s + 1s delay.
      await waitForAnimations(page);

      // Extra wait for TextScramble rAF loop + CSS transition tail.
      // TextScramble starts at 300ms/500ms/700ms and runs ~40 rAF frames each.
      // All entry transitions finish by ~2.8s. This waits a bit past that.
      await page.waitForTimeout(500);

      // Kill glitch timers before they fire (glitch schedules 1.5–5s after scramble).
      await killGlitchTimers(page);

      // One more rAF cycle so the killed state propagates.
      await page.waitForTimeout(100);

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

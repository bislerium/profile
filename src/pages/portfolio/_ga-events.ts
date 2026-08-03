/**
 * GA4 custom event dispatch.
 * One exported function per event. Each wraps gtag('event', ...).
 * Silently no-ops if gtag absent (ad-blocker, dev without network).
 *
 * Event parameters (gaId, event name) live here — callers pass nothing
 * except category strings where applicable. No magic strings outside
 * this file.
 */

const gtagEvent = (name: string, params?: Record<string, string | boolean>): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, params);
    }
  } catch {
    // Ad-blocker or network error — silently skip
  }
};

/** Fires when user clicks the CV link. */
export function trackCvClick(): void {
  gtagEvent('cv_click');
}

/** Fires when user clicks the GitHub outbound link. */
export function trackGithubClick(): void {
  gtagEvent('github_click');
}

/** Fires when user clicks the LinkedIn outbound link. */
export function trackLinkedinClick(): void {
  gtagEvent('linkedin_click');
}

/**
 * Fires when user hovers or focuses a stack category.
 * @param category — category name from .stack-category text (e.g. "Backend")
 */
export function trackStackExpand(category: string): void {
  gtagEvent('stack_expand', { category });
}

/** Fires once on page load with user accessibility preferences. */
export function trackAccessibilityPref(): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gtagEvent('accessibility_preference', { reduced_motion: reducedMotion });
}

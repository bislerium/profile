import { syncAllStackAria } from './stack-toggle';

/**
 * Auto-cycles a `.stack-active` class through stack categories every 3 seconds
 * for discovery and visual interest. Pauses on manual hover/focus, resumes 2s
 * after the user stops interacting. Exits immediately if prefers-reduced-motion.
 */
export function initAutoCycle(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const parents = document.querySelectorAll<HTMLElement>('.stack-parent');
  if (parents.length < 2) return;

  const stack = document.querySelector<HTMLElement>('.tech-stack');
  if (!stack) return;

  let index = -1;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let resumeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const clearActive = () => {
    for (const p of parents) p.classList.remove('stack-active');
  };

  const activate = (i: number) => {
    clearActive();
    const parent = parents[i];
    parent.classList.add('stack-active');

    // On mobile (≤768px) the stack categories are in a horizontal scrollable
    // row. Only scroll if the item isn't already fully visible to avoid
    // triggering unnecessary scroll events (and GA scroll tracking) on every
    // tick. Desktop layout stacks items vertically so this is always a no-op.
    const scrollParent = parent.closest<HTMLElement>('.tech-list');
    if (scrollParent) {
      const pRect = parent.getBoundingClientRect();
      const cRect = scrollParent.getBoundingClientRect();
      const isFullyVisible =
        pRect.left >= cRect.left &&
        pRect.right <= cRect.right &&
        pRect.top >= cRect.top &&
        pRect.bottom <= cRect.bottom;
      if (!isFullyVisible) {
        parent.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
      }
    }

    syncAllStackAria();
  };

  const next = () => {
    index = (index + 1) % parents.length;
    activate(index);
  };

  const start = () => {
    index = -1;
    next();
    intervalId = setInterval(next, 3000);
  };

  const stop = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (resumeTimeoutId !== null) {
      clearTimeout(resumeTimeoutId);
      resumeTimeoutId = null;
    }
    clearActive();
    syncAllStackAria();
  };

  // --- Pause / resume on user interaction ---
  // Listen at document level because .stack-sublist is absolutely positioned
  // outside .tech-stack's bounding box (right: calc(100% + 1.25rem)). Listening
  // on .tech-stack would fire mouseleave when the cursor enters the revealed
  // sublist, spuriously resuming the cycle while the user is still interacting.

  const pause = () => {
    stop();
  };

  const resume = () => {
    if (resumeTimeoutId !== null) clearTimeout(resumeTimeoutId);
    resumeTimeoutId = setTimeout(() => {
      resumeTimeoutId = null;
      // Don't resume if the user is still interacting. Checking both the
      // hovering flag AND CSS :hover / :focus-within covers the case where
      // focus moves out but the mouse is stationary over the stack.
      if (hovering) return;
      if (stack.matches(':hover') || stack.matches(':focus-within')) return;
      // Continue from the next item after the last auto-activated one
      next();
      intervalId = setInterval(next, 3000);
    }, 2000);
  };

  let hovering = false;

  const onMouseOver = (e: MouseEvent) => {
    const enteredStack = stack.contains(e.target as Node);
    if (enteredStack && !hovering) {
      hovering = true;
      pause();
    } else if (!enteredStack && hovering) {
      hovering = false;
      resume();
    }
  };

  const onFocusIn = (e: FocusEvent) => {
    if (stack.contains(e.target as Node)) {
      pause();
    }
  };

  const onFocusOut = (e: FocusEvent) => {
    // Only resume if focus actually left the stack (not just moved within it)
    if (!stack.contains(e.relatedTarget as Node | null)) {
      resume();
    }
  };

  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);

  // Kick off after a brief delay so the page settles first
  setTimeout(start, 1500);
}

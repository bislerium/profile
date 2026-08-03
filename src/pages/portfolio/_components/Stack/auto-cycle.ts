import { syncAllStackAria } from './stack-toggle';

/**
 * Auto-cycles a `.stack-active` class through stack categories every 3 seconds
 * for discovery and visual interest. Pauses on manual hover/focus, resumes 2s
 * after the user stops interacting. Exits immediately if prefers-reduced-motion.
 *
 * Cursor tracking (mousemove listener) catches stationary cursors at page load
 * and cursor positions over the sublist flyout after stop() clears .stack-active
 * (when pointer-events: none would make matches(':hover') miss). The 2-second
 * resume timer only fires when the last known cursor position is outside the
 * stack area — defined as .tech-stack's bounding rect expanded left by 400px
 * to cover the absolutely-positioned sublist flyout.
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
  let hovering = false;
  let lastCursorX = -1;
  let lastCursorY = -1;

  // Track cursor position so resume() can check actual cursor location even
  // when the sublist has pointer-events: none and :hover pseudo-class misses.
  const onMouseMove = (e: MouseEvent) => {
    lastCursorX = e.clientX;
    lastCursorY = e.clientY;
  };
  document.addEventListener('mousemove', onMouseMove);

  /** Returns true if last known cursor is over the stack or its sublist flyout area. */
  const isCursorInStackArea = (): boolean => {
    if (lastCursorX < 0) return false; // no mousemove yet
    const rect = stack.getBoundingClientRect();
    // Sublists extend left from .tech-stack; max-width is 360px + 1.25rem gap ≈ 380px.
    return (
      lastCursorX >= rect.left - 400 &&
      lastCursorX <= rect.right &&
      lastCursorY >= rect.top &&
      lastCursorY <= rect.bottom
    );
  };

  const clearActive = () => {
    for (const p of parents) p.classList.remove('stack-active');
  };

  const activate = (i: number) => {
    const parent = parents[i];

    // Read layout BEFORE any DOM mutations to avoid forced reflow.
    // On mobile (≤768px) the stack categories are in a horizontal scrollable
    // row. Only scroll if the item isn't already fully visible to avoid
    // triggering unnecessary scroll events (and GA scroll tracking) on every
    // tick. Desktop layout stacks items vertically so this is always a no-op.
    const scrollParent = parent.closest<HTMLElement>('.tech-list');
    let needsScroll = false;
    if (scrollParent) {
      const pRect = parent.getBoundingClientRect();
      const cRect = scrollParent.getBoundingClientRect();
      needsScroll = !(
        pRect.left >= cRect.left &&
        pRect.right <= cRect.right &&
        pRect.top >= cRect.top &&
        pRect.bottom <= cRect.bottom
      );
    }

    // All writes after reads — no layout thrashing
    clearActive();
    parent.classList.add('stack-active');

    if (needsScroll) {
      parent.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
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
  // outside .tech-stack's bounding box (right: 100%). Listening on .tech-stack
  // would fire mouseleave when the cursor enters the revealed sublist,
  // spuriously resuming the cycle while the user is still interacting.

  const pause = () => {
    stop();
  };

  const resume = () => {
    if (resumeTimeoutId !== null) clearTimeout(resumeTimeoutId);
    resumeTimeoutId = setTimeout(() => {
      resumeTimeoutId = null;
      // Don't resume if the user is still interacting.
      if (hovering) return;
      if (stack.matches(':hover') || stack.matches(':focus-within')) return;
      // Also check cursor position — covers cursor over sublist flyout area
      // where pointer-events may be none and :hover wouldn't match.
      if (isCursorInStackArea()) return;
      // Don't resume if a tap-opened item is visible
      if (document.querySelector('.stack-parent.stack-open')) return;
      next();
      intervalId = setInterval(next, 3000);
    }, 2000);
  };

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
    if (!stack.contains(e.relatedTarget as Node | null)) {
      resume();
    }
  };

  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);

  // Kick off after a brief delay so the page settles first.
  // If the cursor is already in the stack area, skip the initial cycle.
  setTimeout(() => {
    if (isCursorInStackArea() || stack.matches(':hover') || stack.matches(':focus-within')) return;
    start();
  }, 1500);
}
